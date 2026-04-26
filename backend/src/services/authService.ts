import prisma from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Interfaces for data transfer
export interface RegisterData {
    name: string;
    email: string;
    passwordRaw: string;
    phone_number: string;
}

export interface LoginData {
    email: string;
    passwordRaw: string;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    phone_number?: string;
    passwordRaw?: string;
}

export async function registerUser(data: RegisterData) {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new Error('User with this email already exists.');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.passwordRaw, saltRounds);

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password_hash: hashedPassword,
                phone_number: data.phone_number
            }
        });

        // Automatically generate a token upon successful registration
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            secret,
            { expiresIn: '24h' }
        );

        // Return both the user profile and the token for immediate access
        const userProfile = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role
        };

        return { user: userProfile, token };
    }
    catch(error) {
        console.error("Error in registerUser service:", error);
        throw new Error((error as Error).message || 'Database failed to register user.');
    }
}

export async function loginUser(data: LoginData) {
    try {
        // Retrieve the user by email
        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!user) {
            throw new Error('Invalid email or password.');
        }

        // Compare the provided password with the stored hash
        const isPasswordValid = await bcrypt.compare(data.passwordRaw, user.password_hash);

        if (!isPasswordValid) {
            throw new Error('Invalid email or password.');
        }

        // Generate a JSON Web Token containing the user ID and role
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            secret,
            { expiresIn: '24h' }
        );

        // Construct the user object to return without the password hash
        const userProfile = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role
        };

        return { user: userProfile, token };
    }
    catch(error) {
        // Log the error and throw a new error for the controller
        console.error("Error in loginUser service:", error);
        throw new Error((error as Error).message || 'Authentication failed.');
    }
}

export async function getUserById(id: number) {
    try {
        // Retrieve the user profile excluding the password hash
        const user = await prisma.user.findUnique({
            where: { id: id },
            select: {
                id: true,
                name: true,
                email: true,
                phone_number: true,
                role: true,
                created_at: true
            }
        });

        if (!user) {
            throw new Error('User not found.');
        }

        return user;
    }
    catch(error) {
        // Log the error and throw a new error for the controller
        console.error(`Error while fetching user with id ${id}:`, error);
        throw new Error((error as Error).message || 'Database failed to retrieve user.');
    }
}

export async function getAllUsers() {
    try {
        return await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone_number: true,
                role: true,
                created_at: true,
                orders: { select: { id: true, total: true, status: true, datetime: true } },
                reservations: { select: { id: true, datetime: true, total: true } },
                caterings: { select: { id: true, eventName: true, total: true, status: true } }
            }
        });
    } catch(error) {
        console.error("Error fetching all users:", error);
         throw new Error("Failed to retrieve users.");
    }
}

export async function updateUserRole(id: number, role: any) {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: { role: role },
            select: { id: true, name: true, role: true }
        });
        return updatedUser;
    } catch(error) {
        console.error(`Error updating role for id ${id}:`, error);
        throw new Error("Failed to update user role.");
    }
}

export async function updateUser(id: number, data: UpdateUserData) {
    try {
        const dataToUpdate: any = {};

        // Assign fields to the update payload if they are provided
        if (data.name !== undefined) dataToUpdate.name = data.name;
        if (data.email !== undefined) dataToUpdate.email = data.email;
        if (data.phone_number !== undefined) dataToUpdate.phone_number = data.phone_number;

        // Hash the new password if a password update is requested
        if (data.passwordRaw !== undefined) {
            const saltRounds = 10;
            dataToUpdate.password_hash = await bcrypt.hash(data.passwordRaw, saltRounds);
        }

        // Update the user in the database
        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: dataToUpdate,
            select: {
                id: true,
                name: true,
                email: true,
                phone_number: true,
                role: true
            }
        });

        return updatedUser;
    }
    catch(error) {
        // Log the error and throw a new error for the controller
        console.error(`Error in updateUser service for id ${id}:`, error);
        throw new Error((error as Error).message || 'Database failed to update user.');
    }
}

export async function deleteUser(id: number) {
    try {
        // Delete the user record from the database
        await prisma.user.delete({
            where: { id: id }
        });

        return { id };
    }
    catch(error) {
        // Log the error and throw a new error for the controller
        console.error(`Error in deleteUser service for id ${id}:`, error);
        throw new Error('Database failed to delete user.');   
    }
}

export async function blacklistToken(token: string) {
    try {
        // Record the token in the blacklist table to prevent further use
        await prisma.blacklistedToken.create({
            data: { token }
        });
    } catch (error) {
        // Log the error
        console.error("Error in blacklistToken service:", error);
        throw new Error('Failed to invalidate session.');
    }
}

export async function isTokenBlacklisted(token: string) {
    try {
        // Check if the provided token exists in the blacklist
        const blacklisted = await prisma.blacklistedToken.findUnique({
            where: { token }
        });
        return !!blacklisted;
    } catch (error) {
        // Log the error
        console.error("Error in isTokenBlacklisted service:", error);
        return false;
    }
}