/*
  Warnings:

  - A unique constraint covering the columns `[chat_id]` on the table `chats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "chats_chat_id_key" ON "chats"("chat_id");
