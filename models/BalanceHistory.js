import { DataTypes, Model } from 'sequelize';

import sequelize from '../services/sequelize';
import Users from './Users';

class BalanceHistory extends Model {
}

BalanceHistory.init({
  price: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('up', 'down'),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(1000),
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'balance_history',
  modelName: 'BalanceHistory',
});

BalanceHistory.belongsTo(Users, {
  foreignKey: 'userId',
  onDelete: 'cascade',
});

export default BalanceHistory;
