import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

beforeAll(async () => {
    // 1. Reset the database completely (ignoring the external seed script)
    execSync('npx prisma migrate reset --force --skip-seed');

    // 2. Explicitly create the required test data
    const customerPassword = await bcrypt.hash('customer123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Create Customer
    await prisma.user.create({
        data: { 
            name: 'Customer', 
            email: 'customer@example.com', 
            password_hash: customerPassword, 
            phone_number: '1234567890', 
            role: 'CUSTOMER' 
        }
    });

    // Create Admin
    await prisma.user.create({
        data: { 
            name: 'Admin', 
            email: 'admin@example.com', 
            password_hash: adminPassword, 
            phone_number: '0987654321', 
            role: 'ADMIN' 
        }
    });

    // Create a Table (will have ID 1)
    await prisma.table.create({ data: { capacity: 4 } });

    // Create Dishes (will have IDs 1 and 2)
    await prisma.dish.create({ data: { name: 'Test Dish 1', price: 15.99, cuisine: 'Italian', category: 'Mains' } });
    await prisma.dish.create({ data: { name: 'Test Dish 2', price: 9.50, cuisine: 'Salad', category: 'Starters' } });
});

afterAll(async () => {
    // Disconnect Prisma after all tests finish
    await prisma.$disconnect();
});