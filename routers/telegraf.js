const express = require("express");
const { Telegram } = require("telegraf");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

const telegram = new Telegram(process.env.TELEGRAM_TOKEN);
const chatId = process.env.CHAT_ID;
const telegramApiUrl = process.env.TELEGRAM_API_URL;

function formatMessage(entry) {
  const date = new Date(entry.dateDisconnected);
  const options = {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedDate = date.toLocaleString("ru-RU", options);

  const fields = [
    { label: "Городской округ", value: entry.go },
    { label: "Улицы", value: entry.addressDisconnected },
    { label: "Дата", value: formattedDate },
    { label: "Продолжительность", value: `${entry.durationSolution} ч` },
  ];

  const message = fields
    .filter(field => field.value !== null)
    .map(field => `<b>${field.label}:</b> ${field.value}`)
    .join("\n");

  return message;
}

router.post("/", async (req, res) => {
  const event = req.body.event;
  const model = req.body.model;

  if (model === "avarijnye-otklyucheniya") {
    const entry = req.body.entry;
    const message = formatMessage(entry);

    if (event === "entry.update") {
      try {
        const response = await axios.get(
          `${telegramApiUrl}?filters[avariynoeID][$eq]=${entry.id}`
        );
        const messageId = response.data.data[0].attributes.messageID;

        await telegram.editMessageText(chatId, messageId, null, message, {
          parse_mode: "HTML",
        });

        console.log("Message updated in Telegram:", messageId);
      } catch (error) {
        console.error("Error updating Telegram message:", error);
      }
    } else if (event === "entry.create") {
      try {
        const response = await telegram.sendMessage(chatId, message, {
          message_thread_id: 4,
          parse_mode: "HTML",
        });
        if (response.message_id) {
          await axios.post(telegramApiUrl, {
            data: {
              messageID: response.message_id,
              avariynoeID: entry.id,
            },
          });
          console.log("Message sent and saved to database:", response);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (event === "entry.delete") {
      try {
        const response = await axios.get(
          `${telegramApiUrl}?filters[avariynoeID][$eq]=${entry.id}`
        );
        const messageId = response.data.data[0].attributes.messageID;

        const telegramResponse = await telegram.deleteMessage(
          chatId,
          messageId
        );
        if (telegramResponse === true) {
          await axios.delete(`${telegramApiUrl}/${response.data.data[0].id}`);
          console.log("Message deleted from Telegram and database:", messageId);
        } else {
          console.log("Failed to delete message in Telegram");
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  res.json("Ok");
});

module.exports = router;


// const express = require("express");
// const { Telegram } = require("telegraf");
// const axios = require("axios");
// const router = express.Router();
// require("dotenv").config();

// const telegram = new Telegram(process.env.TELEGRAM_TOKEN);
// const chatId = process.env.CHAT_ID;
// const telegramApiUrl = process.env.TELEGRAM_API_URL;

// function formatMessage(entry) {
//   const date = new Date(entry.dateDisconnected);
//   const options = {
//     timeZone: "Europe/Moscow",
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   };
//   const formattedDate = date.toLocaleString("ru-RU", options);

//   return `<b>Городской округ:</b> ${entry.go}
// <b>Улицы:</b> ${entry.addressDisconnected}
// <b>Дата:</b> ${formattedDate}
// <b>Продолжительность:</b> ${entry.durationSolution} ч`;
// }

// router.post("/", async (req, res) => {
//   const event = req.body.event;
//   const model = req.body.model;

//   if (model === "avarijnye-otklyucheniya") {
//     const entry = req.body.entry;
//     const message = formatMessage(entry);

//     if (event === "entry.update") {
//       try {
//         const response = await axios.get(
//           `${telegramApiUrl}?filters[avariynoeID][$eq]=${entry.id}`
//         );
//         const messageId = response.data.data[0].attributes.messageID;

//         await telegram.editMessageText(chatId, messageId, null, message, {
//           parse_mode: "HTML",
//         });

//         console.log("Message updated in Telegram:", messageId);
//       } catch (error) {
//         console.error("Error updating Telegram message:", error);
//       }
//     } else if (event === "entry.create") {
//       try {
//         const response = await telegram.sendMessage(chatId, message, {
//           message_thread_id: 4,
//           parse_mode: "HTML",
//         });
//         if (response.message_id) {
//           await axios.post(telegramApiUrl, {
//             data: {
//               messageID: response.message_id,
//               avariynoeID: entry.id,
//             },
//           });
//           console.log("Message sent and saved to database:", response);
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     } else if (event === "entry.delete") {
//       try {
//         const response = await axios.get(
//           `${telegramApiUrl}?filters[avariynoeID][$eq]=${entry.id}`
//         );
//         const messageId = response.data.data[0].attributes.messageID;

//         const telegramResponse = await telegram.deleteMessage(
//           chatId,
//           messageId
//         );
//         if (telegramResponse === true) {
//           await axios.delete(`${telegramApiUrl}/${response.data.data[0].id}`);
//           console.log("Message deleted from Telegram and database:", messageId);
//         } else {
//           console.log("Failed to delete message in Telegram");
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     }
//   }

//   res.json("Ok");
// });

// module.exports = router;
