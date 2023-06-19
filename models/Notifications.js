import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Users from './Users';
import BalanceHistory from './BalanceHistory';

class Notifications extends Model {
  static async sync(options) {
    await super.sync(options);
  }
}

Notifications.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  seen: {
    type: DataTypes.DATEONLY,
  },
}, {
  sequelize,
  tableName: 'notifications',
  modelName: 'Notifications',
});

Notifications.belongsTo(Users, {
  foreignKey: 'userId',
  as: 'user',
});

Notifications.belongsTo(BalanceHistory, {
  foreignKey: 'incomeId',
  as: 'income',
});
export default Notifications;
