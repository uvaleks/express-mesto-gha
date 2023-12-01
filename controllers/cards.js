const card = require('../models/card');

const ERROR_CODE_VALIDATION = 400;
const ERROR_CODE_NOT_FORBIDDEN = 403;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_DEFAULT = 500;

const getCards = async (req, res) => {
  try {
    const cards = await card.find({});
    return res.status(200).send(cards);
  } catch (error) {
    return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне севера' });
  }
};

const deleteCardById = (req, res) => {
  const _id = req.params.cardId;
  const userId = req.user._id;
  console.log('cardId', _id);
  console.log('userId', userId);
  card.findOne({ _id })
    .then((foundCard) => {
      console.log('foundCard', foundCard);
      if (!foundCard) {
        throw new Error('NotFound');
      }
      return foundCard;
    })
    .then((cardToDelete) => {
      console.log('cardToDelete', cardToDelete);
      const owner = cardToDelete.owner.toString();
      console.log('owner', owner);
      if (owner !== userId) {
        throw new Error('Forbidden');
      }
      return card.findByIdAndDelete(_id);
    })
    .then((deletedCard) => res.status(200).send(deletedCard))
    .catch((error) => {
      if (error.message === 'Forbidden') {
        return res.status(ERROR_CODE_NOT_FORBIDDEN).send({ message: 'Удаление не своих карточек запрещено' });
      }
      if (error.message === 'NotFound') {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Карточка по id не найдена' });
      }
      if (error.name === 'CastError') {
        return res.status(ERROR_CODE_VALIDATION).send({ message: 'Передан не валидный id' });
      }
      return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне сервера' });
    });
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
    return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне сервера' });
  }
};

const likeCard = async (req, res) => {
  try {
    const updatedCard = await card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    if (!updatedCard) {
      throw new Error('NotFound');
    }
    return res.status(200).send(updatedCard);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(ERROR_CODE_VALIDATION).send({ message: 'Передан не валидный id' });
    }
    if (error.message === 'NotFound') {
      return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Карточка по id не найдена' });
    }
    return res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на стороне сервера' });
  }
};

const dislikeCard = async (req, res) => {
  try {
    const updatedCard = await card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    if (!updatedCard) {
      throw new Error('NotFound');
    }
    return res.status(200).send(updatedCard);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(ERROR_CODE_VALIDATION).send({ message: 'Передан не валидный id' });
    }
    if (error.message === 'NotFound') {
      return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Карточка по id не найдена' });
    }
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
