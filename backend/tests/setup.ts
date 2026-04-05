import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Increase the timeout for the setup hook to 30 seconds
jest.setTimeout(30000);

beforeAll(async () => {
    // Clean and Reset all tables using Raw SQL
    const tables = ['BlacklistedToken', 'ReservationDish', 'OrderDish', 'CateringDish', 'Reservation', 'Order', 'Catering', 'Table', 'Dish', 'User'];
    
    for (const table of tables) {
        // Delete data AND reset the auto-increment counter to 1
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
    }

    // Add Fresh Test Data
    const customerPassword = await bcrypt.hash('customer123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    await prisma.user.create({
        data: { name: 'Customer', email: 'customer@example.com', password_hash: customerPassword, phone_number: '1234567890', role: 'CUSTOMER' }
    });

    await prisma.user.create({
        data: { name: 'Admin', email: 'admin@example.com', password_hash: adminPassword, phone_number: '0987654321', role: 'ADMIN' }
    });

    await prisma.table.create({ data: { capacity: 4 } });

    await prisma.dish.create({ data: { name: 'Test Dish 1', price: 15.99, cuisine: 'Italian', category: 'Mains' } });
    await prisma.dish.create({ data: { name: 'Test Dish 2', price: 9.50, cuisine: 'Salad', category: 'Starters' } });
});

afterAll(async () => {
    await prisma.$disconnect();
});