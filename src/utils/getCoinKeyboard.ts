import { InlineKeyboard } from "grammy"

export const getCoinKeyboard = (coinId: string) => {
  return new InlineKeyboard()
    .url("Dexscreener", `https://dexscreener.com/solana/${coinId}`)
    .url("Rugcheck", `https://rugcheck.xyz/tokens/${coinId}`)
}
