// require("dotenv").config();
// const app = require("./src/app");

// const connectDb = require("./src/config/database");

// connectDb();
// // invokeGeminiAi();

// app.listen("3000", () => {
//   console.log("server started ");
// });
// UEq4RsdFJoVc7svS
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const app = require("./src/app");
const connectDb = require("./src/config/database");

connectDb();

app.listen(3000, () => {
  console.log("server started");
});
