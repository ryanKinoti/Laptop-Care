import { StaffRole, ContactMethod } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { prisma } from '../../src/lib/prisma/prisma';

interface ExcelStaffData {
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    preferred_contact: string;
    address?: string;
    notes?: string;
    role: string;
    specializations?: string;
    availability?: string;
    [key: string]: string | undefined;
}

function parseSpecializations(specializations: string | undefined): string[] {
    if (!specializations || specializations.trim() === '') {
        return [];
    }
    return specializations.split(',').map(spec => spec.trim()).filter(spec => spec.length > 0);
}

function parseAvailability(availability: string | undefined): Record<string, string> {
    if (!availability || availability.trim() === '') {
        return {};
    }

    const availabilityObj: Record<string, string> = {};
    const entries = availability.split(',');

    for (const entry of entries) {
        // Split on first colon only to handle time ranges like "08:00-17:00"
        const colonIndex = entry.indexOf(':');
        if (colonIndex !== -1) {
            const day = entry.substring(0, colonIndex).trim().toLowerCase();
            const timeRange = entry.substring(colonIndex + 1).trim();
            if (day && timeRange) {
                availabilityObj[day] = timeRange;
            }
        }
    }

    return availabilityObj;
}

function determineUserFlags(role: string): { isStaff: boolean; isSuperuser: boolean } {
    const normalizedRole = role.toUpperCase();

    switch (normalizedRole) {
        case 'ADMIN':
        case 'ADMINISTRATOR':
            return { isStaff: true, isSuperuser: true };
        case 'TECHNICIAN':
        case 'RECEPTIONIST':
            return { isStaff: true, isSuperuser: false };
        default:
            return { isStaff: true, isSuperuser: false };
    }
}

function mapToStaffRole(role: string): StaffRole {
    const normalizedRole = role.toUpperCase();

    switch (normalizedRole) {
        case 'ADMIN':
            return StaffRole.ADMINISTRATOR;
        case 'TECHNICIAN':
            return StaffRole.TECHNICIAN;
        case 'RECEPTIONIST':
            return StaffRole.RECEPTIONIST;
        default:
            return StaffRole.TECHNICIAN; // Default fallback
    }
}

export async function seedUsers() {
    console.log('🔧 All environment variables starting with STAFF:', Object.keys(process.env).filter(key => key.startsWith('STAFF')));

    const filePath = process.env.STAFF_EXCEL_PATH;

    if (!filePath) {
        console.error('❌ Please set STAFF_EXCEL_PATH environment variable with the path to your Excel file');
        console.log('Example: STAFF_EXCEL_PATH=./data/staff.xlsx npm run db:seed');
        process.exit(1);
    }

    const resolvedPath = path.resolve(filePath);
    console.log(`\n📖 Environment variable STAFF_EXCEL_PATH: "${filePath}"`);
    console.log(`📖 File exists check: ${fs.existsSync(resolvedPath)}`);

    try {
        // Create a workbook and read the Excel file
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(resolvedPath);

        // Get the "users" worksheet
        const worksheet = workbook.getWorksheet('users');

        if (!worksheet) {
            throw new Error('No worksheet named "users" found in the Excel file');
        }

        // Get headers from the first row
        const headerRow = worksheet.getRow(1);
        const headers: string[] = [];
        headerRow.eachCell((cell, colNumber) => {
            headers[colNumber] = cell.value?.toString() || '';
        });

        const staffData: ExcelStaffData[] = [];

        // Process data rows (starting from row 2)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header row

            const staffRecord: Record<string, string> = {};
            row.eachCell((cell, colNumber) => {
                const header = headers[colNumber];
                if (header) {
                    staffRecord[header] = cell.value?.toString() || '';
                }
            });

            if (staffRecord.email) {
                staffData.push(staffRecord as ExcelStaffData);
            }
        });

        console.log(`\n👥 Found ${staffData.length} staff records to process\n`);

        let created = 0;
        let skipped = 0;
        let errors = 0;

        for (const staff of staffData) {
            try {
                // Check if user already exists
                const existingUser = await prisma.user.findUnique({
                    where: { email: staff.email }
                });

                if (existingUser) {
                    console.log(`⏭️  User ${staff.email} already exists, skipping...`);
                    skipped++;
                    continue;
                }

                // Parse data
                const specializations = parseSpecializations(staff.specializations);
                const availability = parseAvailability(staff.availability);
                const { isStaff, isSuperuser } = determineUserFlags(staff.role);
                const staffRole = mapToStaffRole(staff.role);

                // Determine the preferred contact method
                const preferredContact = staff.preferred_contact?.toLowerCase() === 'phone'
                    ? ContactMethod.PHONE
                    : ContactMethod.EMAIL;

                // Create user and staff profile in a transaction
                await prisma.$transaction(async (tx) => {
                    // Create user
                    const user = await tx.user.create({
                        data: {
                            email: staff.email,
                            name: `${staff.first_name} ${staff.last_name}`.trim(),
                            phone: staff.phone_number || null,
                            preferredContact: preferredContact,
                            isStaff: isStaff,
                            isSuperuser: isSuperuser,
                            isActive: true,
                        }
                    });

                    // Create staff profile
                    await tx.staffProfile.create({
                        data: {
                            userId: user.id,
                            role: staffRole,
                            specializations: specializations,
                            availability: availability,
                        }
                    });
                });

                created++;
                console.log(`✅ Created staff member: ${staff.email} (${staff.role})`);

            } catch (error) {
                console.error(`❌ Error creating staff member ${staff.email}:`, error);
                errors++;
            }
        }

        console.log('\n📊 Seeding Summary:');
        console.log(`✅ Created: ${created}`);
        console.log(`⏭️  Skipped: ${skipped}`);
        console.log(`❌ Errors: ${errors}`);
        console.log('🎉 Staff seeding completed!');

        return { created, skipped, errors };

    } catch (error) {
        console.error('❌ Error reading Excel file:', error);
        throw error;
    }
}