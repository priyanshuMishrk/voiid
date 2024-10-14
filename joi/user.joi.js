const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().required(),
  mail: Joi.string().email().required(),
  pass: Joi.string().required(),
  phNo : Joi.string().required(),
  about : Joi.string().min(2).max(140),
  img : Joi.string()
});

const userPatchSchema = Joi.object({
  username: Joi.string(),
  about : Joi.string().min(2).max(140),
  img : Joi.string()
});

module.exports = {userSchema, userPatchSchema};
