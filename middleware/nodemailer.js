const nodemailer = require('nodemailer');
const email = 'foodvhouse@gmail.com';
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
     "806628543447-ukj4frb8f628bbh1vts5euj4j0b34upf.apps.googleusercontent.com", // ClientID
     "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", // Client Secret
     "https://developers.google.com/oauthplayground" // Redirect URL
);
oauth2Client.setCredentials({
     refresh_token: "1//04uyiykaF_sYpCgYIARAAGAQSNwF-L9IrfZA0iykLMX2WxSikGJkGizL5xRKgvOoy-QNyycm4nYCp8InHk7c9nwP6Ym7xgwhQQY4"
});
const accessToken = oauth2Client.getAccessToken()
const smtpTransport = nodemailer.createTransport({
     service: "gmail",
     auth: {
          type: "OAuth2",
          user: "foodvhouse@gmail.com",
          clientId: "806628543447-ukj4frb8f628bbh1vts5euj4j0b34upf.apps.googleusercontent.com",
          clientSecret: "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",
          refreshToken: "1//04uyiykaF_sYpCgYIARAAGAQSNwF-L9IrfZA0iykLMX2WxSikGJkGizL5xRKgvOoy-QNyycm4nYCp8InHk7c9nwP6Ym7xgwhQQY4",
          accessToken: accessToken
     }
});
module.exports = {smtpTransport: smtpTransport, email: email};
