-- CreateEnum
CREATE TYPE "ScoreEnum" AS ENUM ('BAD', 'NEUTRAL', 'GOOD');

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "chat_id" INTEGER NOT NULL,
    "is_subscribed" BOOLEAN NOT NULL DEFAULT false,
    "selected_scores" "ScoreEnum"[] DEFAULT ARRAY[]::"ScoreEnum"[],

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);
