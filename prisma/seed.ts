import 'dotenv/config';
import {prisma} from '../src/lib/prisma/prisma';
import {seedUsers} from './seeders/users';
import {seedServices} from './seeders/services';
import inquirer from 'inquirer';

interface SeedOptions {
    users?: boolean;
    services?: boolean;
    all?: boolean;
}

async function promptSeedOptions(): Promise<SeedOptions> {
    console.log(`
🌱 Prisma Database Seeder
========================

Welcome! Please select what you would like to seed:
`);

    const { seedChoice } = await inquirer.prompt([
        {
            type: 'list',
            name: 'seedChoice',
            message: 'What would you like to seed?',
            choices: [
                {
                    name: '👥 Users and Staff (from Excel file)',
                    value: 'users'
                },
                {
                    name: '🔧 Services',
                    value: 'services'
                },
                {
                    name: '🌟 Everything (Users + Services)',
                    value: 'all'
                },
                {
                    name: '🔄 Custom Selection',
                    value: 'custom'
                }
            ]
        }
    ]);

    if (seedChoice === 'custom') {
        const { customSelections } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'customSelections',
                message: 'Select which data types to seed:',
                choices: [
                    {
                        name: '👥 Users and Staff',
                        value: 'users'
                    },
                    {
                        name: '🔧 Services',
                        value: 'services'
                    }
                ],
                validate: (answer) => {
                    if (answer.length === 0) {
                        return 'You must choose at least one option.';
                    }
                    return true;
                }
            }
        ]);

        return {
            users: customSelections.includes('users'),
            services: customSelections.includes('services')
        };
    }

    const options: SeedOptions = {};
    
    switch (seedChoice) {
        case 'users':
            options.users = true;
            break;
        case 'services':
            options.services = true;
            break;
        case 'all':
            options.all = true;
            break;
    }

    return options;
}

async function runSeeder(options: SeedOptions) {
    console.log('🚀 Database seeder starting...\n');

    const results = {
        users: {created: 0, skipped: 0, errors: 0},
        services: {created: 0, skipped: 0, errors: 0}
    };

    try {
        // Check if we should seed everything
        if (options.all) {
            options.users = true;
            options.services = true;
        }

        // Seed users if requested
        if (options.users) {
            console.log('='.repeat(50));
            console.log('👥 SEEDING USERS');
            console.log('='.repeat(50));
            results.users = await seedUsers();
            console.log();
        }

        // Seed services if requested
        if (options.services) {
            console.log('='.repeat(50));
            console.log('🔧 SEEDING SERVICES');
            console.log('='.repeat(50));
            results.services = await seedServices();
            console.log();
        }

        // Show final summary
        console.log('='.repeat(50));
        console.log('📊 FINAL SEEDING SUMMARY');
        console.log('='.repeat(50));

        if (options.users) {
            console.log('👥 Users:');
            console.log(`   ✅ Created: ${results.users.created}`);
            console.log(`   ⏭️  Skipped: ${results.users.skipped}`);
            console.log(`   ❌ Errors: ${results.users.errors}`);
        }

        if (options.services) {
            console.log('🔧 Services:');
            console.log(`   ✅ Created: ${results.services.created}`);
            console.log(`   ⏭️  Skipped: ${results.services.skipped}`);
            console.log(`   ❌ Errors: ${results.services.errors}`);
        }

        const totalCreated = results.users.created + results.services.created;
        const totalErrors = results.users.errors + results.services.errors;

        console.log('\n🎉 Database seeding completed successfully!');
        console.log(`📈 Total records created: ${totalCreated}`);

        if (totalErrors > 0) {
            console.log(`⚠️  Total errors encountered: ${totalErrors}`);
        }

    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    try {
        const options = await promptSeedOptions();
        await runSeeder(options);
    } catch (error) {
        console.error('❌ Seeder initialization failed:', error);
        process.exit(1);
    }
}

main();