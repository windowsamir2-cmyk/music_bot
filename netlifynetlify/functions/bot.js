const { Bot, webhookCallback } = require("grammy");

const bot = new Bot(process.env.BOT_TOKEN);

bot.command("start", (ctx) =>
  ctx.reply("سلام 🎵 اسم آهنگ یا خواننده رو بفرست تا پیداش کنم.")
);

bot.on("message:text", async (ctx) => {
  const q = encodeURIComponent(ctx.message.text);
  const res = await fetch(`https://api.deezer.com/search?q=${q}&limit=3`);
  const data = await res.json();

  if (!data.data || data.data.length === 0) {
    return ctx.reply("چیزی پیدا نشد 😕 یه اسم دیگه امتحان کن.");
  }

  for (const t of data.data) {
    const caption = `🎵 ${t.title}\n👤 ${t.artist.name}\n🔗 ${t.link}`;
    try {
      await ctx.replyWithAudio(t.preview, {
        caption,
        title: t.title,
        performer: t.artist.name,
      });
    } catch (e) {
      await ctx.reply(caption);
    }
  }
});

exports.handler = webhookCallback(bot, "aws-lambda-async");
