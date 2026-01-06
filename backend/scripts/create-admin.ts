import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

async function createAdmin() {
    const email = process.argv[2];
    const username = process.argv[3];
    const password = process.argv[4];

    if (!email || !username || !password) {
        console.error('Usage: tsx scripts/create-admin.ts <email> <username> <password>');
        console.error('Example: tsx scripts/create-admin.ts admin@example.com admin password123');
        process.exit(1);
    }

    try {
        const hashedPassword = await hashPassword(password);

        const admin = await prisma.user.upsert({
            where: { email },
            update: { role: 'admin' },
            create: {
                email,
                username,
                password: hashedPassword,
                role: 'admin',
                onboardingCompleted: true,
            },
        });

        console.log('✅ Admin user created/updated successfully!');
        console.log(`   Username: ${admin.username}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
    } catch (error: any) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    }
}

createAdmin()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
