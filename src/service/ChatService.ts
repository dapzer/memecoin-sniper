import { ScoreEnum } from "@prisma/client"
import { prisma } from "../lib/prismaClient.js"

class ChatService {
  async getChats() {
    return prisma.chat.findMany()
  }

  async getChatIdByTelegramId(telegramId: number) {
    return prisma.chat.findUnique({
      where: {
        chatId: telegramId
      }
    })
  }

  async createChat(telegramId: number) {
    return prisma.chat.create({
      data: {
        chatId: telegramId
      }
    })
  }

  async updateSelectedScores(chatId: number, scores: ScoreEnum[]) {
    return prisma.chat.update({
      where: {
        chatId
      },
      data: {
        selectedScores: scores
      }
    })
  }

  async updateIsSubscribed(chatId: number, isSubscribed: boolean) {
    return prisma.chat.update({
      where: {
        chatId
      },
      data: {
        isSubscribed
      }
    })
  }

  async getSelectedScores(chatId: number) {
    const record = await prisma.chat.findUnique({
      where: {
        chatId
      },
      select: {
        selectedScores: true
      }
    })

    return record?.selectedScores || []
  }

  async getIsSubscribed(chatId: number) {
    return prisma.chat.findUnique({
      where: {
        chatId
      },
      select: {
        isSubscribed: true
      }
    })
  }

  async getSendedCoins(chatId: number) {
    const  record = await prisma.chat.findUnique({
      where: {
        chatId
      },
      select: {
        sendedCoins: true
      }
    })

    return record?.sendedCoins || []
  }

  async updateSendedCoins(chatId: number, sendedCoins: string[]) {
    return prisma.chat.update({
      where: {
        chatId
      },
      data: {
        sendedCoins
      }
    })
  }
}

export const chatService = new ChatService()
