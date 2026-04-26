import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req, res) => {
    try {
        const tables = await prisma.table.findMany({
            include: {
                reservations: {
                    select: {
                        id: true,
                        datetime: true
                    }
                }
            }
        });
        res.json({ message: "Tables retrieved successfully", data: tables });
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
});

export default router;
