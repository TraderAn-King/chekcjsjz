const express = require("express");
const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

let userStates = {}; // ذخیره وضعیت کاربران
let userLinks = {}; // ذخیره لینک‌ها
let userEpisodes = {}; // ذخیره لیست اپیزودهای هر کاربر
const startTime = Date.now(); // ذخیره زمان راه‌اندازی ربات

// پیام خوش‌آمدگویی هنگام اجرای /start
bot.start((ctx) => {
    ctx.reply("به ربات همه‌کاره خوش آمدید!");
});

// دستور /changeurl برای تنظیم لینک
bot.command("changeurl", (ctx) => {
    const userId = ctx.from.id;
    userStates[userId] = "waiting_for_url";
    ctx.reply("لینک خود را ارسال کنید:");
});

// دریافت لینک و ذخیره آن
bot.on("text", (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text;

    // اگر کاربر در مرحله ارسال لینک باشد
    if (userStates[userId] === "waiting_for_url") {
        userLinks[userId] = text;
        userEpisodes[userId] = []; // لیست اپیزودها خالی میشه
        userStates[userId] = "waiting_for_episodes";
        ctx.reply("بعدی را ارسال کنید (برای توقف دکمه 'کافی است' را بزنید):", 
            Markup.inlineKeyboard([
                Markup.button.callback("کافی است", "stop_sending")
            ])
        );
    } 
    // اگر کاربر در مرحله ارسال اپیزودها باشد
    else if (userStates[userId] === "waiting_for_episodes") {
        const episodeNumber = userEpisodes[userId].length + 1;
        const episodeTitle = `Episode_${episodeNumber}`;
        userEpisodes[userId].push(episodeTitle);
        
        const link = userLinks[userId];
        ctx.replyWithMarkdown(`*${episodeTitle}* \n[مشاهده لینک](${link})`);
    }
});

// متوقف کردن دریافت اپیزودها
bot.action("stop_sending", (ctx) => {
    const userId = ctx.from.id;
    userStates[userId] = null;
    
    // ارسال لیست نهایی اپیزودها
    if (userEpisodes[userId] && userEpisodes[userId].length > 0) {
        let episodeList = userEpisodes[userId].join("\n");
        ctx.reply(`لیست اپیزودهای شما:\n\n${episodeList}`);
    }

    ctx.answerCbQuery("دریافت اپیزودها متوقف شد.");
});

// دستور /uptime برای نمایش مدت زمان اجرا
bot.command("uptime", (ctx) => {
    const currentTime = Date.now();
    const uptimeMilliseconds = currentTime - startTime;
    
    const seconds = Math.floor((uptimeMilliseconds / 1000) % 60);
    const minutes = Math.floor((uptimeMilliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((uptimeMilliseconds / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptimeMilliseconds / (1000 * 60 * 60 * 24));

    let uptimeMessage = `⏳ مدت زمان راه‌اندازی ربات:\n`;
    if (days > 0) uptimeMessage += `📅 ${days} روز\n`;
    if (hours > 0) uptimeMessage += `⏰ ${hours} ساعت\n`;
    if (minutes > 0) uptimeMessage += `🕒 ${minutes} دقیقه\n`;
    uptimeMessage += `⏱ ${seconds} ثانیه`;

    ctx.reply(uptimeMessage);
});

// راه‌اندازی سرور اکسپرس برای اجرای روی Heroku
app.get("/", (req, res) => {
    res.send("ربات تلگرام در حال اجرا است...");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Express server running...");
});

bot.launch();
