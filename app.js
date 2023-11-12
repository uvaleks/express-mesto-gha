const express = require('express');
const { json } = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const router = require('./routes');

const app = express();

const dirname = path.resolve();
const { PORT = 3000, MONGO_URL = 'mongodb://localhost:27017/mestodb' } = process.env;

mongoose.connect(MONGO_URL);

app.use(express.static(path.join(dirname, 'public')));

app.use(json());

app.use((req, res, next) => {
  req.user = {
    _id: '654fc6cb2cf78115785ca09d',
  };

  next();
});

app.use(router);

app.listen(PORT);
