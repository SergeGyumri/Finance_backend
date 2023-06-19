import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import helper from '../services/helper';

class Users extends Model {
  static async sync(options) {
    await super.sync(options);
  }
}

Users.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val) {
      if (val) {
        this.setDataValue('email', helper.normalizeEmail(val));
      }
    },
  },
  username: {
    type: DataTypes.STRING,
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  verify: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(32),
    get() {
      return undefined;
    },
    set(val) {
      if (val) {
        this.setDataValue('password', helper.passwordHash(val));
      }
    },
  },
  verifyCode: {
    type: DataTypes.STRING(6),
  },
  avatar: {
    type: DataTypes.STRING(500),
    defaultValue: null,
  },
}, {
  hooks: {
    beforeFind(options) {
      if (options.where.email) {
        options.where.email = helper.normalizeEmail(options.where.email);
      }
      if (options.where.password) {
        options.where.password = helper.passwordHash(options.where.password);
      }
    },
  },
  sequelize,
  tableName: 'users',
  modelName: 'Users',
});

export default Users;
