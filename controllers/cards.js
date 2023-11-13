const card = require('../models/card');

const ERROR_CODE_VALIDATION = 400;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_DEFAULT = 500;
const ERROR_CODE_DUPLICATE_MONGO = 11000;

const getCards = async (req, res) => {
  try {
    const cards = await card.find({});
    return res.status(200).send(cards);
  } catch (error) {
    console.log(error);
    return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне севера' });
  }
};

const deleteCardById = async (req, res) => {
  try {
    const { cardId } = req.params;
    const foundCard = await card.findByIdAndDelete(cardId);
    if (!foundCard) {
      throw new Error('NotFound');
    }
    return res.status(200).send(foundCard);
  } catch (error) {
    if (error.message === 'NotFound') {
      return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Карточка по id не найдена' });
    }
    if (error.name === 'CastError') {
      return res.status(ERROR_CODE_VALIDATION).send({ message: 'Передан не валидный id' });
    }
    console.log(error);
    return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне сервера' });
  }
};

const createCard = async (req, res) => {
  try {
    const cardObject = req.body;
    cardObject.owner = req.user._id;
    const newCard = card(cardObject);
    return res.status(201).send(await newCard.save());
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(ERROR_CODE_VALIDATION).send({ message: 'Ошибка валидации полей', ...error });
    }

    if (error.code === ERROR_CODE_DUPLICATE_MONGO) {
      return res.status(409).send({ message: 'Карточка уже существует' });
    }
    console.log(error);
    return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне сервера' });
  }
};

const likeCard = async (req, res) => {
  try {
    const foundCard = await card.findById(req.params.cardId);
    if (!foundCard) {
      throw new Error('NotFound');
    }
    await card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    return res.status(201).send(await card.findByIdAndUpdate(req.params.cardId));
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(ERROR_CODE_VALIDATION).send({ message: 'Передан не валидный id' });
    }
    if (error.message === 'NotFound') {
      return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Карточка по id не найдена' });
    }
    console.log(error);
    return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне сервера' });
  }
};

const dislikeCard = async (req, res) => {
  try {
    const foundCard = await card.findById(req.params.cardId);
    if (!foundCard) {
      throw new Error('NotFound');
    }
    await card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    return res.status(200).send(await card.findById(req.params.cardId));
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(ERROR_CODE_VALIDATION).send({ message: 'Передан не валидный id' });
    }
    if (error.message === 'NotFound') {
      return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Карточка по id не найдена' });
    }
    console.log(error);
    return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне сервера' });
  }
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};
