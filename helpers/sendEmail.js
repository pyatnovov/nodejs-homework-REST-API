const Mailjet = require("node-mailjet");
const {
  MJ_SENDER_EMAIL,
  MJ_APIKEY_PRIVATE,
  MJ_APIKEY_PUBLIC,
} = require("../config");

const mailjet = new Mailjet({
  apiKey: MJ_APIKEY_PUBLIC,
  apiSecret: MJ_APIKEY_PRIVATE,
});

const sendEmail = async (data) => {
  await mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: MJ_SENDER_EMAIL,
        },
        To: [
          {
            Email: data.to,
          },
        ],
        Subject: data.subject,
        HTMLPart: data.html,
      },
    ],
  });
  return true;
};
module.exports = sendEmail;
