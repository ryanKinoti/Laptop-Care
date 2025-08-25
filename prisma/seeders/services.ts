import {DeviceType} from '@prisma/client';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import {prisma} from '../../src/lib/prisma/prisma';
import {Decimal} from "@prisma/client/runtime/library";

interface ExcelCategoryData {
    name: string;
    description?: string;

    [key: string]: string | undefined;
}

interface ExcelServiceData {
    service_name: string;
    service_category: string;
    device_type: string;
    description?: string;
    service_price: string;
    notes?: string;
    estimated_time: string;

    [key: string]: string | undefined;
}

function mapToDeviceType(deviceType: string): DeviceType {
    const normalizedDevice = deviceType.toUpperCase().trim();

    switch (normalizedDevice) {
        case 'LAPTOP':
            return DeviceType.LAPTOP;
        case 'DESKTOP':
            return DeviceType.DESKTOP;
        case 'PRINTER':
            return DeviceType.PRINTER;
        default:
            // Default to laptop if no match found
            console.warn(`⚠️  Unknown device type "${deviceType}", defaulting to LAPTOP`);
            return DeviceType.LAPTOP;
    }
}

function parsePrice(priceString: string): Decimal {
    // Remove any currency symbols and spaces, then parse as float
    const cleanPrice = priceString.replace(/[^\d.]/g, '');
    const price = parseFloat(cleanPrice);

    if (isNaN(price)) {
        console.warn(`⚠️  Invalid price "${priceString}", defaulting to 0`);
        return new Decimal(0);
    }

    return new Decimal(price);
}

export async function seedServices() {
    console.log('🔧 Starting services seeding process...');

    const filePath = process.env.STAFF_EXCEL_PATH; // Reusing the same Excel file path

    if (!filePath) {
        console.error('❌ Please set STAFF_EXCEL_PATH environment variable with the path to your Excel file');
        console.log('Example: STAFF_EXCEL_PATH=./data/staff.xlsx npm run db:seed');
        process.exit(1);
    }

    const resolvedPath = path.resolve(filePath);
    console.log(`\n📖 Reading Excel file: "${resolvedPath}"`);
    console.log(`📖 File exists: ${fs.existsSync(resolvedPath)}`);

    try {
        // Create a workbook and read the Excel file
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(resolvedPath);

        // First, seed service categories
        const categoriesWorksheet = workbook.getWorksheet('categories');
        if (!categoriesWorksheet) {
            throw new Error('No worksheet named "categories" found in the Excel file');
        }

        // Get headers from the categories worksheet
        const categoryHeaderRow = categoriesWorksheet.getRow(1);
        const categoryHeaders: string[] = [];
        categoryHeaderRow.eachCell((cell, colNumber) => {
            categoryHeaders[colNumber] = cell.value?.toString().toLowerCase() || '';
        });

        const categoriesData: ExcelCategoryData[] = [];

        // Process category data rows
        categoriesWorksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header row

            const categoryRecord: Record<string, string> = {};
            row.eachCell((cell, colNumber) => {
                const header = categoryHeaders[colNumber];
                if (header) {
                    categoryRecord[header] = cell.value?.toString() || '';
                }
            });

            if (categoryRecord.name) {
                categoriesData.push(categoryRecord as ExcelCategoryData);
            }
        });

        console.log(`\n🏷️  Found ${categoriesData.length} service categories to process\n`);

        // Create service categories
        const categoryMap = new Map<string, string>(); // Map category name to category ID
        let categoriesCreated = 0;
        let categoriesSkipped = 0;

        for (const categoryData of categoriesData) {
            try {
                // Check if category already exists
                const existingCategory = await prisma.serviceCategory.findUnique({
                    where: {name: categoryData.name}
                });

                if (existingCategory) {
                    console.log(`⏭️  Category "${categoryData.name}" already exists, skipping...`);
                    categoryMap.set(categoryData.name, existingCategory.id);
                    categoriesSkipped++;
                    continue;
                }

                // Create new category
                const category = await prisma.serviceCategory.create({
                    data: {
                        name: categoryData.name,
                        description: categoryData.description || null,
                        isActive: true,
                    }
                });

                categoryMap.set(categoryData.name, category.id);
                categoriesCreated++;
                console.log(`✅ Created category: "${categoryData.name}"`);

            } catch (error) {
                console.error(`❌ Error creating category "${categoryData.name}":`, error);
            }
        }

        // Now seed services
        const servicesWorksheet = workbook.getWorksheet('services');
        if (!servicesWorksheet) {
            throw new Error('No worksheet named "services" found in the Excel file');
        }

        // Get headers from the services worksheet
        const serviceHeaderRow = servicesWorksheet.getRow(1);
        const serviceHeaders: string[] = [];
        serviceHeaderRow.eachCell((cell, colNumber) => {
            serviceHeaders[colNumber] = cell.value?.toString().toLowerCase() || '';
        });

        const servicesData: ExcelServiceData[] = [];

        // Process service data rows
        servicesWorksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header row

            const serviceRecord: Record<string, string> = {};
            row.eachCell((cell, colNumber) => {
                const header = serviceHeaders[colNumber];
                if (header) {
                    serviceRecord[header] = cell.value?.toString() || '';
                }
            });

            if (serviceRecord.service_name) {
                servicesData.push(serviceRecord as ExcelServiceData);
            }
        });

        console.log(`\n🔧 Found ${servicesData.length} services to process\n`);

        // Create services
        let servicesCreated = 0;
        let servicesSkipped = 0;
        let servicesErrors = 0;

        for (const serviceData of servicesData) {
            try {
                // Get category ID from our map
                const categoryId = categoryMap.get(serviceData.service_category);

                if (!categoryId) {
                    console.error(`❌ Category "${serviceData.service_category}" not found for service "${serviceData.service_name}"`);
                    servicesErrors++;
                    continue;
                }

                // Parse device type first for the duplicate check
                const deviceType = mapToDeviceType(serviceData.device_type);
                
                // Check if service already exists (by name, category, and device type)
                const existingService = await prisma.service.findFirst({
                    where: {
                        name: serviceData.service_name,
                        categoryId: categoryId,
                        device: deviceType
                    }
                });

                if (existingService) {
                    console.log(`⏭️  Service "${serviceData.service_name}" for ${deviceType} already exists in category "${serviceData.service_category}", skipping...`);
                    servicesSkipped++;
                    continue;
                }

                // Parse and validate data (deviceType already parsed above)
                const price = parsePrice(serviceData.service_price);

                // Create a new service
                await prisma.service.create({
                    data: {
                        name: serviceData.service_name,
                        categoryId: categoryId,
                        description: serviceData.description || null,
                        device: deviceType,
                        price: price,
                        notes: serviceData.notes || null,
                        estimatedTime: serviceData.estimated_time,
                        isActive: true,
                    }
                });

                servicesCreated++;
                console.log(`✅ Created service: "${serviceData.service_name}" (${serviceData.service_category}, ${serviceData.device_type}, $${price})`);

            } catch (error) {
                console.error(`❌ Error creating service "${serviceData.service_name}":`, error);
                servicesErrors++;
            }
        }

        console.log('\n📊 Services Seeding Summary:');
        console.log('\n🏷️  Categories:');
        console.log(`  ✅ Created: ${categoriesCreated}`);
        console.log(`  ⏭️  Skipped: ${categoriesSkipped}`);
        console.log('\n🔧 Services:');
        console.log(`  ✅ Created: ${servicesCreated}`);
        console.log(`  ⏭️  Skipped: ${servicesSkipped}`);
        console.log(`  ❌ Errors: ${servicesErrors}`);
        console.log('🎉 Services seeding completed!');

        // Return flattened format expected by main seeder
        return {
            created: categoriesCreated + servicesCreated,
            skipped: categoriesSkipped + servicesSkipped,
            errors: servicesErrors
        };

    } catch (error) {
        console.error('❌ Error reading Excel file:', error);
        throw error;
    }
}