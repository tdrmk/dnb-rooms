const path = require("path");
const { createServer } = require("http");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const bcrypt = require("bcrypt");

const browsermon = require("browsermon");

const sessionOptions = require("./config/session");
const connection = require("./config/mongo"); // get mongdb connection
require("./config/passport"); // configure passport

const PORT = process.env.PORT || 8080;

const sessionMiddleware = session(sessionOptions);

const app = express();
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use("/", require("./routes/index"));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.on("connection", (socket) => {
  console.log(`Client connected with id: ${socket.id}`);
});

// Socket IO admin dashboard
instrument(io, {
  auth: {
    type: "basic",
    username: process.env.ADMIN_USERNAME,
    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
  },
});

// Refresh browser on server reload
browsermon({ server: httpServer });

connection.once("open", () => {
  // start server after connection established with mongo server
  httpServer.listen(PORT, () => console.log(`listening on *:${PORT}`));
});
