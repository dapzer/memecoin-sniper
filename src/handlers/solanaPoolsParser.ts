import { parse } from "node-html-parser"
import { bot } from "../bot"
import { getCoinKeyboard } from "../utils/getCoinKeyboard"
import { getWordAfterPhrase } from "../utils/getWordAfterPhrase"
import { chatService } from "../service/ChatService"
import { ScoreEnum } from "@prisma/client"

export const solanaPoolsParser = async () => {
  const response = await fetch("https://t.me/s/solanapoolsnew")
  const html = await response.text()
  const parsedHtml = parse(html)
  const chats = await chatService.getChats()
  const messages = parsedHtml.querySelectorAll(".tgme_widget_message")

  for (const el of messages) {
    const message = el.querySelector(".tgme_widget_message_text")
    const messageText = message?.textContent
    const messageHtml = message?.innerHTML
    const currentScore = getWordAfterPhrase("Score:", messageText || "")
    const coinId = messageText?.split("\n")[1]
    const inlineKeyboard = getCoinKeyboard(coinId || "")

    if (!chats || !coinId) {
      return
    }

    for await (const chat of chats) {
      if (!chat.sendedCoins.includes(coinId) && chat.isSubscribed && chat.selectedScores.includes(currentScore?.toUpperCase() as ScoreEnum)) {
        await bot.api.sendMessage(chat.chatId, messageHtml?.replaceAll("<br>", "\n") || "", {
          parse_mode: "HTML",
          reply_markup: inlineKeyboard,
          link_preview_options: {
            is_disabled: true
          }
        })

        const sendedCoins = await chatService.getSendedCoins(chat.chatId)
        await chatService.updateSendedCoins(chat.chatId, [...sendedCoins, coinId!])
      }
    }
  }
}
