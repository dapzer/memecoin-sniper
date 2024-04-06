import { Bot, Context, InlineKeyboard } from "grammy";
import { Menu } from "@grammyjs/menu";
import { parse } from "node-html-parser"

const bot = new Bot(process.env.BOT_TOKEN || "");

type UserId = number;

interface UserData {
  selectedScore: string;
  isSubscribed: boolean;
}

const db = new Map<UserId, UserData>();
const sendedMessages: string[] = []

const getButtonLabel = (ctx: Context, score: string) => {
  const chatId = ctx.from?.id;
  if (!chatId) {
    return "No chat id";
  }
  const data = db.get(chatId);
  return `${data?.selectedScore === score ? "+" : "-"} ${score}`
}

const selectScore = (ctx: Context, score: string) => {
  const chatId = ctx.from?.id;
  if (!chatId) {
    return;
  }
  db.set(chatId, { selectedScore: score, isSubscribed: false });
  ctx.reply(`Score ${score} selected`);
}

const settingsMenu = new Menu("settings")
  .text((ctx) => getButtonLabel(ctx, "Bad"), ctx => {
    if (db.get(ctx.from?.id)?.selectedScore !== "Bad") {
      selectScore(ctx, "Bad");
      ctx.menu.update()
    }
  })
  .text((ctx) => getButtonLabel(ctx, "Neutral"), ctx => {
    if (db.get(ctx.from?.id)?.selectedScore !== "Neutral") {
      selectScore(ctx, "Neutral");
      ctx.menu.update()
    }
  })
  .text((ctx) => getButtonLabel(ctx, "Good"), ctx => {
    if (db.get(ctx.from?.id)?.selectedScore !== "Good") {
      selectScore(ctx, "Good");
      ctx.menu.update()
    }
  })

const getCoinKeyboard = (coinId: string) => {
  return new InlineKeyboard()
    .url("Dexscreener", `https://dexscreener.com/solana/${coinId}`)
    .url("Rugcheck", `https://rugcheck.xyz/tokens/${coinId}`)
}

function getWordAfterScore(text: string) {
  const scoreIndex = text.indexOf("Score:");
  if (scoreIndex === -1) {
    return null;
  }

  const afterScore = text.slice(scoreIndex + 6);
  const wordMatch = afterScore.match(/\b\w+\b/);
  return wordMatch ? wordMatch[0] : null;
}

const getMessages = async () => {
  const response = await fetch("https://t.me/s/solanapoolsnew")
  const html = await response.text()
  const parsedHtml = parse(html)

  return parsedHtml.querySelectorAll(".tgme_widget_message").forEach(el => {
    const messageId = el.getAttribute("data-post")
    const message = el.querySelector(".tgme_widget_message_text")
    const messageText = message?.textContent
    const messageHtml = message?.innerHTML
    const currentScore = getWordAfterScore(messageText || "")
    const coinId = messageText?.split("\n")[1]
    const coinName = messageText?.split("\n")[0]
    const inlineKeyboard = getCoinKeyboard(coinId || "")

    if (!messageId) {
      return
    }

    db.forEach((value, key, map) => {
      if (value.selectedScore !== currentScore || sendedMessages.includes(messageId) || !value.isSubscribed) {
        return
      }

      bot.api.sendMessage(key, messageHtml?.replaceAll("<br>", "\n") || "", {
        parse_mode: "HTML",
        reply_markup: inlineKeyboard,
        link_preview_options: {
          is_disabled: true
        }
      })
      sendedMessages.push(messageId)
    })
  })
}

bot.use(settingsMenu)

bot.command("start", (ctx) => {
    ctx.reply("Welcome! Up and running.", { reply_markup: settingsMenu })
  }
)

bot.command("unsubscribe", (ctx) => {
  const dbRecord = db.get(ctx.from?.id!);
  if (dbRecord) {
    db.set(ctx.from?.id!, { ...dbRecord, isSubscribed: false });
  }
  ctx.reply("Unsubscribed!")
})

bot.command("subscribe", (ctx) => {
  const dbRecord = db.get(ctx.from?.id!);
  if (dbRecord) {
    db.set(ctx.from?.id!, { ...dbRecord, isSubscribed: true });
  }
  ctx.reply("Subscribed!")
})

bot.on("message", (ctx) => ctx.reply("Got another message!"));

await bot.api.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "subscribe", description: "Subscribe to updates" },
  { command: "unsubscribe", description: "Unsubscribe from updates" },
]);

setInterval(getMessages, 5000)

bot.start()
