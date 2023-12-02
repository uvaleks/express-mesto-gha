const { Router } = require('express');
const { celebrate, Joi, errors } = require('celebrate');
const {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

const urlRegex = /^((http|https):\/\/)?(www\.)?[a-z0-9]+\.[a-z]{2,}(\.[a-z]{2,})?$/;

const cardRouter = Router();

cardRouter.get('/', getCards);
cardRouter.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().regex(urlRegex).required(),
  }),
}), createCard);
cardRouter.delete('/:cardId', celebrate({
  params: Joi.object({
    cardId: Joi.string().length(24),
  }),
}), deleteCardById);
cardRouter.put('/:cardId/likes', celebrate({
  params: Joi.object({
    cardId: Joi.string().length(24),
  }),
}), likeCard);
cardRouter.delete('/:cardId/likes', celebrate({
  params: Joi.object({
    cardId: Joi.string().length(24),
  }),
}), dislikeCard);

cardRouter.use(errors());

module.exports = cardRouter;
