import HttpErrors from 'http-errors';
import moment from 'moment';
import _ from 'lodash';

import Users from '../models/Users';
import sequelize from '../services/sequelize';
import Notifications from '../models/Notifications';
import BalanceHistory from '../models/BalanceHistory';
import downloadExcel from '../services/downloadExcel';
import RepeatedBalances from '../models/RepeatedBalances';

class BalanceController {
  static balance = async (where) => {
    try {
      const { income = 0 } = await BalanceHistory.findOne({
        where: {
          ...where,
          status: 1,
          type: 'up',
        },
        attributes: [
          [sequelize.literal('SUM(price)'), 'income'],
        ],
        raw: true,
      });
      const { spending = 0 } = await BalanceHistory.findOne({
        where: {
          ...where,
          status: 1,
          type: 'down',
        },
        attributes: [
          [sequelize.literal('SUM(price)'), 'spending'],
        ],
        raw: true,
      });

      const balance = (income || 0) - (spending || 0);

      return {
        balance: +balance,
        income: +income,
        spending: +spending,
      };
    } catch (e) {
      return 0;
    }
  };

  static getBalance = async (req, res, next) => {
    try {
      const { id } = req.account;
      const balance = await this.balance({ userId: id });

      res.json({
        balance,
        status: 'ok',
        message: '',
      });
    } catch (e) {
      next(e);
    }
  };

  static newIncome = async (req, res, next) => {
    try {
      const { id } = req.account;

      const {
        repeatDateType,
        repeatDayCount,
        description,
        weekDay,
        repeat,
        price,
        type,
        date,
      } = req.body;

      let newIncome;

      if (repeat === true) {
        if (repeatDateType === 'day') {
          await this.bulkCreateIncome(
            {
              repeatDateType,
              repeatDayCount,
              description,
              price,
              type,
              date,
              id,
            },
          );
        } else if (repeatDateType === 'week') {
          await this.bulkCreateIncome(
            {
              repeatDateType,
              description,
              weekDay,
              price,
              type,
              date,
              id,
            },
          );
        } else if (repeatDateType === 'month') {
          await this.bulkCreateIncome(
            {
              repeatDateType,
              description,
              price,
              type,
              date,
              id,
            },
          );
        }
      } else {
        newIncome = await BalanceHistory.create({
          createdAt: date,
          description,
          userId: id,
          price,
          type,
        });
      }

      const balance = await this.balance({ userId: id });

      res.json({
        balance,
        newIncome,
        status: 'ok',
        message: '',
      });
    } catch (e) {
      next(e);
    }
  };

  static bulkCreateIncome = async (data) => {
    try {
      const {
        repeatDateType,
        repeatDayCount,
        description,
        weekDay,
        price,
        type,
        date,
        id,
      } = data;

      const dateNow = moment();
      const newDate = new Date(date);

      if (repeatDateType === 'month') {
        const receivedDate = moment(date);
        const monthsCount = dateNow.diff(receivedDate, 'month');
        for (let i = 0; i <= monthsCount; i++) {
          const createdAt = moment(receivedDate).add(i, 'month');
          await BalanceHistory.create({
            description,
            userId: id,
            createdAt,
            price,
            type,
          });

          if (i === monthsCount) {
            const monthDay = newDate.getDate();
            const daysInNextMonth = moment(receivedDate).add(i + 1, 'month').daysInMonth();

            let otherDate;
            let nextDate;
            if (monthDay > daysInNextMonth) {
              otherDate = moment(receivedDate).add(i + 1, 'month').endOf('month');
            } else {
              nextDate = moment(receivedDate).add(i + 1, 'month').date(monthDay);
            }

            console.log(nextDate, '===');
            console.log(otherDate, '---');
            await RepeatedBalances.create({
              repeatDateType,
              description,
              userId: id,
              otherDate,
              monthDay,
              nextDate,
              price,
              type,
            });
          }
        }
      } else if (repeatDateType === 'week') {
        const receivedDate = moment(date);
        const weeksCount = dateNow.diff(receivedDate, 'week');
        for (let i = 0; i <= weeksCount; i++) {
          const createdAt = moment(receivedDate).day(weekDay).add(i, 'week');
          await BalanceHistory.create({
            description,
            userId: id,
            createdAt,
            price,
            type,
          });

          if (i === weeksCount) {
            await RepeatedBalances.create({
              repeatDateType,
              description,
              userId: id,
              nextDate: moment(createdAt).add(1, 'week'),
              price,
              type,
              status: 1,
            });
          }
        }
      } else if (repeatDateType === 'day') {
        const receivedDate = moment(date);
        const daysCount = dateNow.diff(receivedDate, 'day');
        for (let i = 0; i <= Math.floor(daysCount / repeatDayCount); i++) {
          const createdAt = moment(receivedDate).add(i * repeatDayCount, 'day');
          if (i === Math.floor(daysCount / repeatDayCount)) {
            await RepeatedBalances.create({
              repeatDayCount,
              repeatDateType,
              description,
              userId: id,
              nextDate: moment(createdAt).add(repeatDayCount, 'day'),
              price,
              type,
              status: 1,
            });
          }
          await BalanceHistory.create({
            description,
            userId: id,
            createdAt,
            price,
            type,
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  static updateIncome = async (req, res, next) => {
    try {
      const { id } = req.account;

      const {
        description,
        incomeId,
        price,
        type,
      } = req.body;
      const income = await BalanceHistory.findOne({
        where: {
          id: incomeId,
          userId: id,
        },
      });

      if (_.isEmpty(income)) {
        throw HttpErrors(422, 'Income not found in history');
      }

      await income.update({
        description,
        price,
        type,
      });

      const balance = await this.balance({ userId: id });

      res.json({
        balance,
        income,
        status: 'ok',
        message: '',
      });
    } catch (e) {
      next(e);
    }
  };

  static deleteIncome = async (req, res, next) => {
    try {
      const { id } = req.account;
      const { incomeId } = req.params;

      const income = await BalanceHistory.findOne({
        where: {
          userId: id,
          id: incomeId,
        },
      });

      if (_.isEmpty(income)) {
        throw HttpErrors(422, 'Income not found in history');
      } else {
        await income.update({
          status: 0,
        });
      }

      const balance = await this.balance({ userId: id });

      res.json({
        balance,
        id: incomeId,
        status: 'ok',
        message: 'Successfully deleted',
      });
    } catch (e) {
      next(e);
    }
  };

  static updateRepeatedIncome = async (req, res, next) => {
    try {
      const { id } = req.account;

      const {
        repeatDateType,
        repeatDayCount,
        description,
        incomeId,
        price,
        type,
      } = req.body;

      const income = await RepeatedBalances.findOne({
        where: {
          id: incomeId,
          userId: id,
        },
      });

      if (_.isEmpty(income)) {
        throw HttpErrors(422, 'Income not found in history');
      }

      const date = new Date();
      if (repeatDateType === 'day') {
        const nextDate = moment(date.setDate(date.getDate() + repeatDayCount)).format('YYYY-MM-DD');
        await income.update({
          repeatDayCount,
          repeatDateType,
          description,
          nextDate,
          price,
          type,
        });
      } else if (repeatDateType === 'week') {
        const nextDate = moment(date.setDate(date.getDate() + 7)).format('YYYY-MM-DD');
        await income.update({
          repeatDateType,
          description,
          nextDate,
          price,
          type,
        });
      } else if (repeatDateType === 'month') {
        const dateNow = date.getDate();

        const daysInNextMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0).getDate();

        let otherDate;
        let nextDate;

        if (dateNow <= daysInNextMonth) {
          nextDate = new Date(date.getFullYear(), date.getMonth() + 1, dateNow);
        } else {
          otherDate = new Date(date.getFullYear(), date.getMonth() + 2, 1);
        }
        await income.update({
          monthDay: dateNow,
          repeatDateType,
          description,
          otherDate,
          nextDate,
          price,
          type,
        });
      }

      res.json({
        income,
        status: 'ok',
        message: '',
      });
    } catch (e) {
      next(e);
    }
  };

  static deleteRepeatedIncome = async (req, res, next) => {
    try {
      const { id } = req.account;
      const { incomeId } = req.params;

      const income = await RepeatedBalances.findOne({
        where: {
          userId: id,
          id: incomeId,
        },
      });

      if (_.isEmpty(income)) {
        throw HttpErrors(422, 'Repeated income not found');
      } else {
        await income.update({
          status: 0,
        });
      }

      res.json({
        incomeId,
        status: 'ok',
        message: 'Successfully deleted',
      });
    } catch (e) {
      next(e);
    }
  };

  static getHistory = async (req, res, next) => {
    try {
      const { startDate, endDate, s = '' } = req.query;
      const { page, limit } = req.paginate;
      const { id } = req.account;

      const where = {
        userId: id,
        status: 1,
        $and: [],
      };

      if (s.trim() !== '') {
        where.$or = [
          { description: { $like: `%${s}%` } },
          { price: { $like: `%${s}%` } },
        ];
      }

      if (moment(startDate, 'YYYY-MM-DD').isValid()) {
        where.$and.push({ createdAt: { $gte: `${moment(startDate).format('YYYY-MM-DD')} 00:00:00` } });
      }

      if (moment(endDate, 'YYYY-MM-DD').isValid()) {
        where.$and.push({ createdAt: { $lte: `${moment(endDate).format('YYYY-MM-DD')} 23:59:59` } });
      }

      const balanceHistory = await BalanceHistory.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset: (limit * page) - limit,
      });

      const count = await BalanceHistory.count({
        where,
      });

      const _meta = {
        currentPage: page,
      };
      if (count > 0) {
        _meta.pageCount = Math.ceil(count / limit);
      } else {
        _meta.pageCount = 0;
      }

      const balance = await this.balance(where);

      res.json({
        balanceHistory,
        _meta,
        balance,
        status: 'ok',
        message: '',
      });
    } catch (e) {
      next(e);
    }
  };

  static getRepeatList = async (req, res, next) => {
    try {
      const { page, limit } = req.paginate;
      const { id } = req.account;
      const { s = '' } = req.query;

      const where = {
        userId: id,
        status: 1,
        $and: [],
      };

      if (s.trim() !== '') {
        where.$or = [
          { description: { $like: `%${s}%` } },
          { price: { $like: `%${s}%` } },
        ];
      }

      const repeatHistory = await RepeatedBalances.findAll({
        where,
        order: [['nextDate', 'ASC'], ['otherDate', 'ASC']],
        limit,
        offset: (limit * page) - limit,
      });
      const count = await RepeatedBalances.count({
        where,
      });

      const _meta = {
        currentPage: page,
      };
      if (count > 0) {
        _meta.pageCount = Math.ceil(count / limit);
      } else {
        _meta.pageCount = 0;
      }

      res.json({
        repeatHistory,
        _meta,
        status: 'ok',
        message: '',
      });
    } catch (e) {
      next(e);
    }
  };

  static getDeletedRepeatList = async (req, res, next) => {
    try {
      const { page, limit } = req.paginate;
      const { id } = req.account;
      const { s = '' } = req.body;

      const where = {
        userId: id,
        status: 0,
        $and: [],
      };

      if (s.trim() !== '') {
        where.$or = [
          { description: { $like: `%${s}%` } },
          { price: { $like: `%${s}%` } },
        ];
      }

      const repeatHistory = await RepeatedBalances.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset: (limit * page) - limit,
      });

      const count = await RepeatedBalances.count({
        where,
      });

      const _meta = {
        currentPage: page,
      };
      if (count > 0) {
        _meta.pageCount = Math.ceil(count / limit);
      } else {
        _meta.pageCount = 0;
      }

      res.json({
        repeatHistory,
        _meta,
        status: 'ok',
        message: '',
      });
    } catch (e) {
      next(e);
    }
  };

  static getDeletedHistory = async (req, res, next) => {
    try {
      const { startDate, endDate, s = '' } = req.query;
      const { page, limit } = req.paginate;
      const { id } = req.account;

      const where = {
        userId: id,
        status: 0,
        $and: [],
      };

      if (s.trim() !== '') {
        where.$or = [
          { description: { $like: `%${s}%` } },
          { price: { $like: `%${s}%` } },
        ];
      }

      if (moment(startDate, 'YYYY-MM-DD').isValid()) {
        where.$and.push({ createdAt: { $gte: moment(startDate).format('YYYY-MM-DD') } });
      }

      if (moment(endDate, 'YYYY-MM-DD').isValid()) {
        where.$and.push({ createdAt: { $lte: moment(endDate).format('YYYY-MM-DD') } });
      }

      const deletedHistory = await BalanceHistory.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset: (limit * page) - limit,
      });

      const count = await BalanceHistory.count({
        where,
      });

      const _meta = {
        currentPage: page,
      };
      if (count > 0) {
        _meta.pageCount = Math.ceil(count / limit);
      } else {
        _meta.pageCount = 0;
      }

      res.json({
        deletedHistory,
        _meta,
        status: 'ok',
        message: '',
      });
    } catch (e) {
      next(e);
    }
  };

  static getNotifications = async (req, res, next) => {
    try {
      const { page, limit } = req.paginate;
      const { id } = req.account;

      const where = { userId: id };
      const notifications = await Notifications.findAll({
        where,
        include: {
          model: BalanceHistory,
          as: 'income',
          attributes: {
            exclude: ['updatedAt', 'userId'],
          },
        },
        attributes: ['id'],
        order: [['createdAt', 'DESC']],
        limit,
        offset: (limit * page) - limit,
      });

      const count = await Notifications.count({
        where,
      });

      const _meta = {
        currentPage: page,
      };
      if (count > 0) {
        _meta.pageCount = Math.ceil(count / limit);
      } else {
        _meta.pageCount = 0;
      }

      res.json({
        notifications,
        _meta,
        status: 'ok',
        message: '',
      });
    } catch (e) {
      next(e);
    }
  };

  static seen = async (req, res, next) => {
    try {
      const { id } = req.account;
      await Notifications.update({
        seen: moment().format('YYYY-MM-DD'),
      }, {
        where: {
          userId: id,
        },
      });

      res.json({
        status: 'ok',
        message: '',
      });
    } catch (e) {
      next(e);
    }
  };

  static acceptIncome = async (req, res, next) => {
    try {
      const { id } = req.account;
      const { incomeId } = req.params;

      await BalanceHistory.update({
        status: 1,
      }, {
        where: {
          userId: id,
          id: incomeId,
        },
      });
      res.json({
        incomeId,
        status: 'ok',
        message: '',
      });
    } catch (e) {
      next(e);
    }
  };

  static rejectIncome = async (req, res, next) => {
    try {
      const { id } = req.account;
      const { incomeId } = req.params;

      await BalanceHistory.update({
        status: 0,
      }, {
        where: {
          userId: id,
          id: incomeId,
        },
      });
      res.json({
        incomeId,
        status: 'ok',
        message: '',
      });
    } catch (e) {
      next(e);
    }
  };

  static resumeIncome = async (req, res, next) => {
    try {
      const { id } = req.account;
      const { incomeId } = req.params;

      await BalanceHistory.update({
        status: 1,
      }, {
        where: {
          userId: id,
          id: incomeId,
        },
      });
      res.json({
        incomeId,
        status: 'ok',
        message: '',
      });
    } catch (e) {
      next(e);
    }
  };

  static downloadXlsx = async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const { id } = req.account;

      const where = {
        userId: id,
        status: 1,
        $and: [],
      };

      if (moment(startDate, 'YYYY-MM-DD').isValid()) {
        where.$and.push({ createdAt: { $gte: `${moment(startDate).format('YYYY-MM-DD')} 00:00:00` } });
      }

      if (moment(endDate, 'YYYY-MM-DD').isValid()) {
        where.$and.push({ createdAt: { $lte: `${moment(endDate).format('YYYY-MM-DD')} 23:59:59` } });
      }

      const history = await BalanceHistory.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: 500,
        offset: 0,
        attributes: ['description', 'price', 'type',
          [sequelize.col('createdAt'), 'Date']],
        raw: true,
      });

      const { firstName, lastName } = await Users.findOne({
        where: {
          id,
        },
      });

      if (!_.isEmpty(history)) {
        history.forEach((item) => {
          if (item.type === 'up') {
            item.Income = item.price;
            item.Spending = 0;
          } else if (item.type === 'down') {
            item.Income = 0;
            item.Spending = item.price;
          }
          item.balance = item.type === 'up' ? item.price : -item.price;
          item.Date = moment(item.date).format('DD-MM-YYYY');
          delete item.date;
          delete item.price;
          delete item.type;
        });

        await downloadExcel(res, history, `${firstName}_${lastName}_data`);
        console.log('end');
      } else {
        throw HttpErrors(422, {
          status: 'error',
          message: 'Data not found',
          errors: {
            message: 'Data not found',
          },
        });
      }
    } catch (e) {
      console.log(e, '-----------');
      next(e);
    }
  };
}

export default BalanceController;
