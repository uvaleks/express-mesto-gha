const NotFoundError = require('../errors/not-found-error');
const ForbiddenError = require('../errors/forbidden-error');
const card = require('../models/card');

const getCards = (req, res, next) => {
  card.find({})
    .then((cards) => {
      res.status(200).send(cards);
    })
    .catch(next);
};

const deleteCardById = (req, res, next) => {
  const _id = req.params.cardId;
  const userId = req.user._id;
  console.log('cardId', _id);
  console.log('userId', userId);
  card.findOne({ _id })
    .then((foundCard) => {
      console.log('foundCard', foundCard);
      if (!foundCard) {
        throw new NotFoundError('Карточка по id не найдена');
      }
      return foundCard;
    })
    .then((cardToDelete) => {
      console.log('cardToDelete', cardToDelete);
      const owner = cardToDelete.owner.toString();
      console.log('owner', owner);
      if (owner !== userId) {
        throw new ForbiddenError('Удаление не своих карточек запрещено');
      }
      return card.deleteOne(cardToDelete);
    })
    .then((deletedCard) => res.status(200).send(deletedCard))
    .catch(next);
};

const createCard = (req, res, next) => {
  const cardObject = req.body;
  cardObject.owner = req.user._id;
  const newCard = card(cardObject);
  newCard.save()
    .then((savedCard) => {
      res.status(201).send(savedCard);
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user.id } },
    { new: true },
  )
    .then((updatedCard) => {
      if (!updatedCard) {
        throw new NotFoundError('Карточка по id не найдена');
      }
      res.status(200).send(updatedCard);
    })
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((updatedCard) => {
      if (!updatedCard) {
        throw new NotFoundError('Карточка по id не найдена');
      }
      res.status(200).send(updatedCard);
    })
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};
