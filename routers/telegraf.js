const express = require("express");
const { Telegram } = require("telegraf");
const axios = require("axios");
const router = express.Router();

const telegram = new Telegram("7221312469:AAHpG-K9hCN_U2hsgYPF8kM6387ajRnwRkY");
const chatId = "-1002070621778";

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

  return `<b>Городской округ:</b> ${entry.go}
<b>Улицы:</b> ${entry.addressDisconnected}
<b>Дата:</b> ${formattedDate}
<b>Продолжительность:</b> ${entry.durationSolution} ч`;
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
          `http://5.35.9.42:1337/api/id-avarijnyh-soobshhenij-v-telegrams?filters[avariynoeID][$eq]=${entry.id}`
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
          await axios.post(
            "http://5.35.9.42:1337/api/id-avarijnyh-soobshhenij-v-telegrams",
            {
              data: {
                messageID: response.message_id,
                avariynoeID: entry.id,
              },
            }
          );
          console.log("Message sent and saved to database:", response);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (event === "entry.delete") {
      try {
        const response = await axios.get(
          `http://5.35.9.42:1337/api/id-avarijnyh-soobshhenij-v-telegrams?filters[avariynoeID][$eq]=${entry.id}`
        );
        const messageId = response.data.data[0].attributes.messageID;

        const telegramResponse = await telegram.deleteMessage(
          chatId,
          messageId
        );
        if (telegramResponse === true) {
          await axios.delete(
            `http://5.35.9.42:1337/api/id-avarijnyh-soobshhenij-v-telegrams/${response.data.data[0].id}`
          );
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