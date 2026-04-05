import prisma from "../config/db";

export async function createDish(data: any) {
    // Allows admins to add new items to the restaurant menu
    return await prisma.dish.create({
        data: {
            name: data.name,
            price: data.price,
            cuisine: data.cuisine,
            category: data.category
        }
    });
}

export async function getAllDishes() {
    // Retrieves the full menu for customers to browse
    return await prisma.dish.findMany({
        orderBy: { category: 'asc' }
    });
}

export async function updateDish(id: number, data: any) {
    // Allows admins to update pricing or descriptions of menu items
    return await prisma.dish.update({
        where: { id },
        data: data
    });
}

export async function deleteDish(id: number) {
    // Remove a dish from the menu
    return await prisma.dish.delete({ where: { id } });
}