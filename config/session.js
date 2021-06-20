const MongoStore = require("connect-mongo");

const sessionOptions = {
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something is store
  secret: process.env.SESSION_SECRET,
  store: MongoStore.create({
    mongoUrl: process.env.DB_URI,
    collectionName: "sessions",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
};

module.exports = sessionOptions;
