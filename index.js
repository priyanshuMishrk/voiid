const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const messagingRealTime = require('./LiveMessagin')

messagingRealTime()
// Import the Swagger options
const swaggerOptions = require("./swaggerOptions");
const userEndpoint = require('./routes/User')
const http = require('http');
const socketIo = require('socket.io');



const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 1900;


// Swagger setup
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(userEndpoint);


// Your other middleware and routes go here
// app.get("/api/hello", (req, res) => {
//   res.send("Hello, Swagger!");
// });

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
