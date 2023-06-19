import JoiBase from 'joi';
import JoiDate from '@joi/date';

const Joi = JoiBase.extend(JoiDate);

const newIncome = Joi
  .object({
    repeatDateType: Joi.when('repeat', { is: true, then: Joi.string().valid('day', 'week', 'month').required(), otherwise: Joi.allow(null, '') }),
    repeatDayCount: Joi.when('repeatDateType', { is: 'day', then: Joi.number().min(1).required(), otherwise: Joi.allow(null, '') }),
    weekDay: Joi.when('repeatDateType', { is: 'week', then: Joi.number().min(1).max(7).required(), otherwise: Joi.allow(null, '') }),
    description: Joi.string().max(1000).allow('', null),
    repeat: Joi.boolean().default(false).allow(null, ''),
    price: Joi.number().min(1).required(),
    type: Joi.string().valid('up', 'down').required(),
    date: Joi.date().format('YYYY-MM-DD').utc().required(),
  });

const updateIncome = Joi
  .object({
    description: Joi.string().max(1000).allow('', null),
    incomeId: Joi.number().required(),
    price: Joi.number().required(),
    type: Joi.string().valid('up', 'down').required(),
  });

const getHistory = Joi
  .object({
    startDate: Joi.date().format('YYYY-MM-DD').utc().allow(null, ''),
    endDate: Joi.date().format('YYYY-MM-DD').utc().allow(null, ''),
    s: Joi.string().allow(null, ''),
  });

const deleteIncome = Joi
  .object({
    incomeId: Joi.number().required(),
  });

const updateRepeatedIncome = Joi
  .object({
    incomeId: Joi.number().required(),
    repeatDateType: Joi.string().valid('day', 'week', 'month').required(),
    repeatDayCount: Joi.when('repeatDateType', { is: 'day', then: Joi.number().min(1).required(), otherwise: Joi.allow('') }),
    description: Joi.string().max(1000).allow('', null),
    price: Joi.number().required(),
    type: Joi.string().valid('up', 'down').required(),
  });

const deleteRepeatedIncome = Joi
  .object({
    incomeId: Joi.number().required(),
  });

const getRepeatHistory = Joi
  .object({
    s: Joi.string().allow('', null),
  });

const incomeId = Joi
  .object({
    incomeId: Joi.number().required(),
  });

const downloadXlsx = Joi
  .object({
    startDate: Joi.date().format('YYYY-MM-DD').utc().required(),
    endDate: Joi.date().format('YYYY-MM-DD').utc().required(),
  });

const balanceSchema = {
  incomeId,
  newIncome,
  getHistory,
  updateIncome,
  downloadXlsx,
  deleteIncome,
  getRepeatHistory,
  updateRepeatedIncome,
  deleteRepeatedIncome,
};
export default balanceSchema;
