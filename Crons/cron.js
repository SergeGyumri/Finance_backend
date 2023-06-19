import { CronJob } from 'cron';
import Promise from 'bluebird';
import moment from 'moment';

import Notifications from '../models/Notifications';
import BalanceHistory from '../models/BalanceHistory';
import RepeatedBalances from '../models/RepeatedBalances';

class Cron {
  static init() {
    global.cron = new CronJob('0 20 * * *', this.updateGlobalBalances, null, true);
  }

  static updateGlobalBalances = async () => {
    const date = new Date();
    const now = moment(date).format('YYYY-MM-DD');

    const count = await RepeatedBalances.count({
      where: {
        $or: [
          { nextDate: now },
          { otherDate: now },
        ],
      },
    });

    for (let i = 1; i < (Math.ceil(count / 100)); i++) {
      const newIncomes = await RepeatedBalances.findAll({
        where: {
          $or: [
            { nextDate: now },
            { otherDate: now },
          ],
        },
        limit: 100,
        offset: (100 * i) - 100,
      });

      await Promise.map(newIncomes, async (income) => {
        const {
          userId, description, price, type, repeatDateType, id, repeatDayCount, monthDay,
        } = income;
        const newIncome = await BalanceHistory.create({
          description,
          userId,
          price,
          type,
          status: 2,
        });

        await Notifications.create({
          incomeId: newIncome.id,
        });

        if (repeatDateType === 'day') {
          const nextDate = moment(date.setDate(date.getDate() + repeatDayCount)).format('YYYY-MM-DD');
          await RepeatedBalances.update({
            nextDate,
          }, {
            where: {
              id,
              userId,
            },
          });
        } else if (repeatDateType === 'week') {
          const nextDate = moment(date.setDate(date.getDate() + 7)).format('YYYY-MM-DD');
          await RepeatedBalances.update({
            nextDate,
          }, {
            where: {
              id,
              userId,
            },
          });
        } else if (repeatDateType === 'month') {
          const daysInNextMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0).getDate();

          let otherDate = null;
          let nextDate = null;

          if (monthDay <= daysInNextMonth) {
            nextDate = new Date(date.getFullYear(), date.getMonth() + 1, monthDay);
          } else {
            otherDate = new Date(date.getFullYear(), date.getMonth() + 2, 1);
          }
          await RepeatedBalances.update({
            otherDate,
            nextDate,
          }, {
            where: {
              id,
              userId,
            },
          });
        }
      });
    }
  };
}
export default Cron;
