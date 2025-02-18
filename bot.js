const express = require("express");
const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

let userStates = {}; // ذخیره وضعیت کاربران
let userLinks = {}; // ذخیره لینک‌ها

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
        userStates[userId] = "waiting_for_episodes";
        ctx.reply("بعدی را ارسال کنید:");
    } 
    // اگر کاربر در مرحله ارسال اپیزودها باشد
    else if (userStates[userId] === "waiting_for_episodes") {
        const link = userLinks[userId];
        ctx.replyWithMarkdown(`*${text}* \n[Episode](${link})`);
    }
});

// راه‌اندازی سرور اکسپرس برای اجرای روی Heroku
app.get("/", (req, res) => {
    res.send("ربات تلگرام در حال اجرا است...");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Express server running...");
});

bot.launch();