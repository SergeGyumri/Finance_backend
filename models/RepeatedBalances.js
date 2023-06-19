import { DataTypes, Model } from 'sequelize';

import sequelize from '../services/sequelize';
import Users from './Users';

class RepeatedBalances extends Model {
}

RepeatedBalances.init({
  price: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(1000),
  },
  repeatDateType: {
    type: DataTypes.ENUM('day', 'week', 'month'),
    allowNull: false,
  },
  repeatDayCount: {
    type: DataTypes.INTEGER,
  },
  nextDate: {
    type: DataTypes.DATEONLY,
  },
  otherDate: {
    type: DataTypes.DATEONLY,
  },
  type: {
    type: DataTypes.ENUM('up', 'down'),
    allowNull: false,
  },
  monthDay: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  sequelize,
  tableName: 'repeated_balances',
  modelName: 'RepeatedBalances',
});

RepeatedBalances.belongsTo(Users, {
  foreignKey: 'userId',
  onDelete: 'cascade',
});

export default RepeatedBalances;
