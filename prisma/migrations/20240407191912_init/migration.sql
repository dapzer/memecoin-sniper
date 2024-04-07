/*
  Warnings:

  - You are about to drop the column `sended_tokens` on the `chats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chats" DROP COLUMN "sended_tokens",
ADD COLUMN     "sended_coins" TEXT[] DEFAULT ARRAY[]::TEXT[];
