import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    const saltRounds = 10;
    
    // Hash passwords to simulate actual registered users
    const customerPassword = await bcrypt.hash('customer123', saltRounds);
    const adminPassword = await bcrypt.hash('admin123', saltRounds);

    // Create a standard CUSTOMER user
    const customer = await prisma.user.create({
        data: {
            name: 'John Customer',
            email: 'customer@example.com',
            password_hash: customerPassword,
            phone_number: '1234567890',
            role: 'CUSTOMER'
        }
    });

    // Create an ADMIN user
    const admin = await prisma.user.create({
        data: {
            name: 'Alice Admin',
            email: 'admin@example.com',
            password_hash: adminPassword,
            phone_number: '0987654321',
            role: 'ADMIN'
        }
    });

    // Create a dummy table for testing
    const table1 = await prisma.table.create({
        data: { capacity: 4 }
    });

    // Create a few dishes for pre-ordering
    const dish1 = await prisma.dish.create({
        data: { name: 'Fettuccine Alfredo', price: 15.99, cuisine: 'Italian' }
    });
    const dish2 = await prisma.dish.create({
        data: { name: 'Caesar Salad', price: 9.50, cuisine: 'Salad' }
    });

    console.log(`Seeding finished. Customer: ${customer.email}, Admin: ${admin.email}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });