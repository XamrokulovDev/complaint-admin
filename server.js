const { createClient } = require('@supabase/supabase-js');
const dotenv = require("dotenv");
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

const adminId = process.env.ADMIN_CHAT_ID;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const bot = new TelegramBot(process.env.TOKEN, { polling: true });

const startAnnouncementProcess = (adminId) => {
  bot.sendMessage(adminId, "📝 E'lonning sarlavhasini kiriting!");

  bot.once('message', (titleMsg) => {
    const title = titleMsg.text;
    bot.sendMessage(adminId, "📖 E'lonning ma'lumotlarini kiriting!");

    bot.once('message', (descriptionMsg) => {
      const description = descriptionMsg.text;
      bot.sendMessage(adminId, "📷 E'lon uchun rasm yuboring!");

      bot.once('photo', (photoMsg) => {
        const photo = photoMsg.photo[photoMsg.photo.length - 1].file_id;

        bot.sendMessage(adminId, "✅ Tasdiqlaysizmi?", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅ Tasdiqlayman", callback_data: "confirm" }],
              [{ text: "❌ Bekor qilish", callback_data: "cancel" }]
            ]
          }
        });

        bot.once('callback_query', (callbackQuery) => {
          const action = callbackQuery.data;

          if (action === "confirm") {
            supabase
              .from('users')
              .select('chat_id')
              .then(({ data, error }) => {
                if (error) {
                  console.error('Supabase xatolik:', error);
                  return;
                }

                data.forEach(user => {
                  bot.sendPhoto(user.chat_id, photo, {
                    caption: `${title}\n\n${description}`
                  });
                });

                bot.sendMessage(adminId, "✅ E'lon barcha foydalanuvchilarga yuborildi.", {
                  reply_markup: {
                    keyboard: [[{ text: "📣 E'lon berish" }]],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                  },
                });
              });
          } else if (action === "cancel") {
            bot.sendMessage(adminId, "↩️ E'lon bekor qilindi.", {
              reply_markup: {
                keyboard: [[{ text: "📣 E'lon berish" }]],
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            });
          }

          bot.answerCallbackQuery(callbackQuery.id);
        });
      });
    });
  });
};

bot.on('message', (msg) => {
  if (msg.chat.id == adminId) {
    if (msg.text === "📣 E'lon berish") {
      startAnnouncementProcess(adminId);
    }
  } else {
    bot.sendMessage(msg.chat.id, "🚫 Bu bot faqat admin uchun mo'ljallangan.");
  }
});

bot.sendMessage(adminId, "👋 Assalomu alaykum. Admin botiga xush kelibsiz!", {
  reply_markup: {
    keyboard: [[{ text: "📣 E'lon berish" }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
});   