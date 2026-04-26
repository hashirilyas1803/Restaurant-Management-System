import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    const saltRounds = 10;
    
    // Hash passwords to simulate actual registered users
    const customerPassword = await bcrypt.hash('customer123', saltRounds);
    const adminPassword = await bcrypt.hash('admin123', saltRounds);

    // Upsert a standard CUSTOMER user
    const customer = await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: {},
        create: {
            name: 'John Customer',
            email: 'customer@example.com',
            password_hash: customerPassword,
            phone_number: '1234567890',
            role: 'CUSTOMER'
        }
    });

    // Upsert an ADMIN user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            name: 'Alice Admin',
            email: 'admin@example.com',
            password_hash: adminPassword,
            phone_number: '0987654321',
            role: 'ADMIN'
        }
    });

    // Seed Tables
    console.log('Loading Tables...');
    const tableData = [
        { capacity: 2 }, { capacity: 2 }, { capacity: 2 },
        { capacity: 4 }, { capacity: 4 }, { capacity: 4 }, { capacity: 4 },
        { capacity: 6 }, { capacity: 6 },
        { capacity: 8 }, { capacity: 10 }
    ];
    for (const t of tableData) {
        await prisma.table.create({ data: t });
    }

    // Create Dishes
    console.log('Loading Bespoke Menu...');
    const menuData = [
        // Starters
        { name: 'Architectural Caesar', price: 16.00, cuisine: 'American', category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80' },
        { name: 'Truffle Arancini', price: 18.00, cuisine: 'Italian', category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80' },
        { name: 'Wagyu Beef Tartare', price: 24.00, cuisine: 'French', category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=800&q=80' },
        
        // Mains
        { name: 'Wagyu Gold Burger', price: 28.00, cuisine: 'American', category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
        { name: 'Atlantic Glazed Salmon', price: 32.00, cuisine: 'Seafood', category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=800&q=80' },
        { name: 'Black Truffle Risotto', price: 24.00, cuisine: 'Italian', category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80' },
        { name: 'Confit Duck Leg', price: 34.00, cuisine: 'French', category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80' },

        // Desserts
        { name: 'Molten Obsidian Cake', price: 14.00, cuisine: 'Dessert', category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80' },
        { name: 'Vanilla Bean Panna Cotta', price: 12.00, cuisine: 'Dessert', category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80' },
        
        // Drinks
        { name: 'Signature Mojito', price: 14.00, cuisine: 'Beverage', category: 'Drink', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80' },
        { name: 'Velvet Espresso Martini', price: 16.00, cuisine: 'Beverage', category: 'Drink', imageUrl: 'https://images.unsplash.com/photo-1545438102-799c3991ffb2?auto=format&fit=crop&w=800&q=80' },
        { name: 'Mango Lassi Silk', price: 9.00, cuisine: 'Beverage', category: 'Drink', imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80' }
    ];
    for (const d of menuData) {
        await prisma.dish.create({ data: d });
    }

    console.log(`Seeding finished. Added ${menuData.length} menu items and ${tableData.length} tables.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });