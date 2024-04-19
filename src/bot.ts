import { Bot, Context } from "grammy";
import { Menu } from "@grammyjs/menu";
import { solanaPoolsParser } from "./handlers/solanaPoolsParser.js"
import { chatService } from "./service/ChatService.js"
import { ScoreEnum } from "@prisma/client"

export const bot = new Bot(process.env.BOT_TOKEN || "");

const getButtonLabel = async (ctx: Context, score: ScoreEnum) => {
  const chatId = ctx.chat?.id;
  if (!chatId) {
    return "No chat id";
  }
  const data = await chatService.getChatIdByTelegramId(chatId)
  return `${data?.selectedScores.includes(score) ? "+" : "-"} ${score}`
}

const handleScore = async (ctx: Context, score: ScoreEnum) => {
  const chatId = ctx.chat?.id;
  if (!chatId) {
    return;
  }
  const currentScores = await chatService.getSelectedScores(chatId.toString());

  if (!currentScores.includes(score)) {
    await chatService.updateSelectedScores(chatId.toString(), [...currentScores, score]);
    await ctx.reply(`Score ${score} selected`);
    return;
  } else {
    await chatService.updateSelectedScores(chatId.toString(), currentScores.filter(s => s !== score));
    await ctx.reply(`Score ${score} unselected`);
    return;
  }
}

const settingsMenu = new Menu("settings")
  .text((ctx) => getButtonLabel(ctx, ScoreEnum.BAD), async ctx => {
    await handleScore(ctx, ScoreEnum.BAD);
    ctx.menu.update()
  })
  .text((ctx) => getButtonLabel(ctx, ScoreEnum.NEUTRAL), async ctx => {
    await handleScore(ctx, ScoreEnum.NEUTRAL);
    ctx.menu.update()
  })
  .text((ctx) => getButtonLabel(ctx, ScoreEnum.GOOD), async ctx => {
    await handleScore(ctx, ScoreEnum.GOOD);
    ctx.menu.update()
  })

bot.use(settingsMenu)

bot.command("start", async (ctx) => {
    try {
      if (!await chatService.getChatIdByTelegramId(ctx.chat.id)) {
        await chatService.createChat(ctx.chat.id)
      } else {
        await chatService.updateIsSubscribed(ctx.chat.id!.toString(), false)
      }

      ctx.reply("Welcome! Select a score for parsing.", { reply_markup: settingsMenu })
    } catch (e) {
      console.log(e)
    }
  }
)

bot.command("changescore", async (ctx) => {
  chatService.updateIsSubscribed(ctx.chat.id!.toString(), false)
  ctx.reply("Select a score for parsing.", { reply_markup: settingsMenu })
})

bot.command("unsubscribe", (ctx) => {
  chatService.updateIsSubscribed(ctx.chat.id!.toString(), false)
  ctx.reply("Unsubscribed!")
})

bot.command("subscribe", (ctx) => {
  chatService.updateIsSubscribed(ctx.chat.id!.toString(), true)
  ctx.reply("Subscribed!")
})

await bot.api.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "changescore", description: "Change selected scores" },
  { command: "subscribe", description: "Subscribe to updates" },
  { command: "unsubscribe", description: "Unsubscribe from updates" },
]);

setInterval(solanaPoolsParser, 5000)

bot.start()
