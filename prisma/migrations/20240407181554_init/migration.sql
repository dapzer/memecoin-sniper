-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "sended_messages" TEXT[] DEFAULT ARRAY[]::TEXT[];
