const { Bot, webhookCallback } = require("grammy");

const bot = new Bot(process.env.BOT_TOKEN);

bot.command("start", (ctx) =>
  ctx.reply(
    "سلام 🎵\nاسم خواننده یا آهنگ رو بفرست (فارسی یا انگلیسی).\nلیست آهنگ‌ها رو می‌فرستم و با زدن روی شناسه زیر هر آهنگ، همون آهنگ برات میاد."
  )
);

bot.hears(/^\/get_(\d+)/, async (ctx) => {
  const id = ctx.match[1];
  const res = await fetch(`https://api.deezer.com/track/${id}`);
  const t = await res.json();

  if (!t || t.error) {
    return ctx.reply("آهنگ پیدا نشد 😕");
  }

  const yt = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    t.artist.name + " " + t.title
  )}`;
  const caption = `🎵 ${t.title}\n👤 ${t.artist.name}\n\n🎧 نسخه کامل:\n${t.link}\n${yt}`;

  try {
    await ctx.replyWithAudio(t.preview, {
      caption,
      title: t.title,
      performer: t.artist.name,
    });
  } catch (e) {
    await ctx.reply(caption);
  }
});

bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;
  if (text.startsWith("/")) return;

  const res = await fetch(
    `https://api.deezer.com/search?q=${encodeURIComponent(text)}&limit=10`
  );
  const data = await res.json();

  if (!data.data || data.data.length === 0) {
    return ctx.reply("چیزی پیدا نشد 😕 یه اسم دیگه امتحان کن.");
  }

  let msg = "نتایج پیدا شده:\n\n";
  data.data.forEach((t, i) => {
    msg += `${i + 1}. 🎵 ${t.title}\n👤 ${t.artist.name}\n/get_${t.id}\n\n`;
  });
  msg += "روی شناسه آهنگ درست بزن تا برات بفرستم 👆";

  await ctx.reply(msg);
});

exports.handler = webhookCallback(bot, "aws-lambda-async");
