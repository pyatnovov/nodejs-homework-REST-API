const mongoose = require("mongoose");
const app = require("./app");
const { DB_HOST } = require("./config");

mongoose
  .connect(DB_HOST)
  .then(() => {
    console.log("Database connection successful");
    app.listen(4000, () => {
      console.log("Server running. Use our API on port: 4000");
    });
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
