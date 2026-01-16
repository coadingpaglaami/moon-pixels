/*******************************************************
 *      Server Starts From Here                        *
 *******************************************************/
"use strict";

require("dotenv").config();
const cors = require("cors");
const http = require("http");
const app = require("./app");
app.use(cors({ origin: "*" }));   // ✅ correct

const port = process.env.PORT || 4000;
const env = process.env.NODE_ENV || "development";
const server = http.createServer(app);

app.set("PORT_NUMBER", port);
app.get('/', (req, res) => {
  res.send('Server is running');
});


//  Start the app on the specific interface (and port).
server.listen(port, () => {
  // Keep the visual separator for development
  if (env === 'development') {
    console.log(`Server is running on ${port} successfully!`);
  }
});

module.exports = server;
