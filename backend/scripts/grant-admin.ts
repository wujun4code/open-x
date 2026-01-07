import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function grantAdminRole() {
    const email = process.argv[2];

    if (!email) {
        console.error('Usage: tsx scripts/grant-admin.ts <email>');
        console.error('Example: tsx scripts/grant-admin.ts user@example.com');
        process.exit(1);
    }

    try {
        // Find the user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.error(`❌ User with email "${email}" not found`);
            process.exit(1);
        }

        // Update user role to admin
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'admin' },
        });

        console.log('✅ Admin role granted successfully!');
        console.log(`   Username: ${updatedUser.username}`);
        console.log(`   Email: ${updatedUser.email}`);
        console.log(`   Role: ${updatedUser.role}`);
        console.log('');
        console.log('💡 User should log out and log back in to see admin features.');
    } catch (error: any) {
        console.error('❌ Error granting admin role:', error.message);
        process.exit(1);
    }
}

grantAdminRole()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
