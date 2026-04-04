import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Create a dummy user for testing
    const user1 = await prisma.user.create({
        data: {
            name: 'Test User',
            email: 'test@example.com',
            password_hash: 'somehash',
            phone_number: '1234567890'
        }
    });

    // Create a dummy table for testing
    const table1 = await prisma.table.create({
        data: {
            capacity: 4
        }
    });

    // Create a few dishes for pre-ordering
    const dish1 = await prisma.dish.create({
        data: { name: 'Fettuccine Alfredo', price: 15.99, cuisine: 'Italian' }
    });
    const dish2 = await prisma.dish.create({
        data: { name: 'Caesar Salad', price: 9.50, cuisine: 'Salad' }
    });

    console.log(`Seeding finished. Created user ${user1.id}, table ${table1.id}, dishes ${dish1.id} & ${dish2.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });