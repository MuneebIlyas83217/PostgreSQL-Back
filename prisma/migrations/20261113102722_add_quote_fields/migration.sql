-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deliveryOptions" TEXT,
ADD COLUMN     "notarization" BOOLEAN DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "sourceLanguage" TEXT,
ADD COLUMN     "toLanguage" TEXT,
ADD COLUMN     "urgentReq" BOOLEAN DEFAULT false,
ALTER COLUMN "password" DROP NOT NULL;
