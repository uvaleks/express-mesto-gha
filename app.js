const express = require('express');
const { json } = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const {
  login,
  createUser,
} = require('./controllers/users');
const auth = require('./middlewares/auth');
const router = require('./routes');

const app = express();

const { PORT, MONGO_URL } = process.env;

mongoose.connect(MONGO_URL);

app.use(json());

// app.use((req, res, next) => {
//   req.user = {
//     _id: '654fc6cb2cf78115785ca09d',
//   };

//   next();
// });

app.post('/signin', login);
app.post('/signup', createUser);

app.use(auth);

app.use(router);

app.listen(PORT);
