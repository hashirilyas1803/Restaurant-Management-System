-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DELIVERY', 'TAKEAWAY');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'ONLINE');

-- AlterTable
ALTER TABLE "Dish" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Main Course';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
ADD COLUMN     "type" "OrderType" NOT NULL DEFAULT 'DELIVERY';
