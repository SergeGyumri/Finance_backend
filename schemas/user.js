import JoiBase from 'joi';
import JoiDate from '@joi/date';

const Joi = JoiBase.extend(JoiDate);

const registerSchema = Joi
  .object({
    firstName: Joi.string().pattern(/^[a-z]{3,30}$/i).required(),
    lastName: Joi.string().pattern(/^[a-z]{3,30}$/i).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,30}$/i).required(),
    birthDate: Joi.date().format('DD-MM-YYYY').utc().required(),
  });

const verifySchema = Joi
  .object({
    verifyCode: Joi.string().min(6).max(6).required(),
    email: Joi.string().email().required(),
  });

const loginSchema = Joi
  .object({
    password: Joi.string().required().allow(''),
    email: Joi.string().required().allow(''),
  });

const forgotPassSchema = Joi
  .object({
    email: Joi.string().email().required(),
  });

const resetPassSchema = Joi
  .object({
    password: Joi.string().pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,30}$/i).message(
      'Your password must be at least 8 characters long, contain at least one number and have a mixture of uppercase and lowercase letters.',
    ).required(),
    token: Joi.string().required(),
  });

const resendSchema = Joi
  .object({
    email: Joi.string().email().required(),
  });

const updateSchema = Joi
  .object({
    firstName: Joi.string().pattern(/^[a-z]{3,30}$/i).required(),
    lastName: Joi.string().pattern(/^[a-z]{3,30}$/i).required(),
    birthDate: Joi.date().format('DD-MM-YYYY').utc().required(),
    avatar: Joi.string().optional(),
  });

const changePassSchema = Joi
  .object({
    oldPass: Joi.string().required(),
    newPass: Joi.string().pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,30}$/i).message('Your password must be at least 8 characters long, contain at least one number and have a mixture of uppercase and lowercase letters.').required(),
  });

const accountSchemas = {
  changePassSchema,
  forgotPassSchema,
  resetPassSchema,
  registerSchema,
  resendSchema,
  updateSchema,
  verifySchema,
  loginSchema,
};
export default accountSchemas;
