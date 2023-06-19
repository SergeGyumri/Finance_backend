import randomstring from 'randomstring';
import HttpErrors from 'http-errors';
import JWT from 'jsonwebtoken';
import moment from 'moment';
import _ from 'lodash';

import Users from '../models/Users';
import helper from '../services/helper';
import Notifications from '../models/Notifications';

const { JWT_TOKEN, JWT_FORGOT_TOKEN_SECRET } = process.env;

class UsersController {
  static upload = async (req, res, next) => {
    try {
      res.json({
        status: 'ok',
        message: '',
        avatar: req.file.path,
      });
    } catch (e) {
      next(e);
    }
  };

  static register = async (req, res, next) => {
    try {
      const {
        firstName, lastName, email, birthDate, password,
      } = req.body;

      const user = await Users.findOne({
        where: {
          email,
        },
      });

      if (!_.isEmpty(user)) {
        throw HttpErrors({
          status: 'error',
          message: 'This email already used',
          errors: {
            login: 'This email already used',
          },
        });
      }

      const date = moment(birthDate, ['DD-MM-YYYY', 'YYYY-MM-DD']).format('YYYY-MM-DD');

      const verifyCode = randomstring.generate({
        length: 6,
        charset: 'numeric',
      });

      await Users.create({
        firstName, lastName, email, password, birthDate: date, verifyCode,
      }, {
        attributes: {
          exclude: ['password'],
        },
      });

      await helper.verifyEmail(email, verifyCode);

      res.json({
        status: 'ok',
        message: 'Please check your email',
      });
    } catch (e) {
      next(e);
    }
  };

  static update = async (req, res, next) => {
    try {
      const {
        id,
      } = req.account;
      const {
        firstName, lastName, birthDate, avatar,
      } = req.body;

      let user = await Users.findOne({
        where: {
          id,
        },
        attributes: {
          exclude: ['password'],
        },
      });

      const date = moment(birthDate, ['DD-MM-YYYY', 'YYYY-MM-DD']).format('YYYY-MM-DD');
      user.firstName = firstName;
      user.lastName = lastName;
      user.birthDate = date;
      user.avatar = avatar;
      await user.save();

      user = await Users.findOne({
        where: {
          id,
        },
        attributes: {
          exclude: ['password'],
        },
      });
      res.json({
        user,
        status: 'ok',
        message: 'Information successfully updated',
      });
    } catch (e) {
      next(e);
    }
  };

  static myAccount = async (req, res, next) => {
    try {
      const {
        id,
      } = req.account;

      const user = await Users.findByPk(id);

      if (_.isEmpty(user)) {
        throw HttpErrors({
          status: 'error',
          message: '',
          errors: {
            login: 'User not found',
          },
        });
      }

      user.dataValues.notificationCount = await Notifications.count({

        where: {
          userId: id,
          seen: null,
        },
      });

      res.json({
        user,
        status: 'ok',
        message: '',
      });
    } catch (e) {
      next(e);
    }
  };

  static login = async (req, res, next) => {
    try {
      const {
        email, password,
      } = req.body;

      const user = await Users.findOne({
        where: {
          email,
          password,
        },
      });

      if (_.isEmpty(user)) {
        throw HttpErrors({
          status: 'error',
          errors: {
            login: 'Wrong login or password',
          },
        });
      }
      if (user.verify === false) {
        res.status(401).json({
          message: 'Not verified',
          email,
        });
        return;
      }

      const userInfo = {
        id: user.id,
      };
      const token = JWT.sign(userInfo, JWT_TOKEN);

      res.json({
        status: 'ok',
        token,
      });
    } catch (e) {
      next(e);
    }
  };

  static verify = async (req, res, next) => {
    try {
      const { verifyCode, email } = req.body;

      const user = await Users.findOne({
        where: {
          email,
        },
      });

      if (user.verifyCode !== verifyCode) {
        throw HttpErrors({
          status: 'error',
          message: 'Wrong verification code',
          errors: {
            message: 'Wrong verification code',
          },
        });
      }

      user.verify = true;
      user.verifyCode = null;
      await user.save();
      const userInfo = {
        id: user.id,
      };
      const token = JWT.sign(userInfo, JWT_TOKEN, { expiresIn: '5d' });
      res.json({
        status: 'ok',
        message: 'You are successfully verified',
        token,
      });
    } catch (e) {
      next(e);
    }
  };

  static forgot = async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await Users.findOne({
        where: {
          email,
        },
      });
      if (_.isEmpty(user)) {
        throw HttpErrors(422, {
          status: 'error',
          message: 'User not found',
          errors: {
            message: 'User not found',
          },
        });
      }

      const forgotCode = randomstring.generate({
        length: 6,
        charset: 'numeric',
      });
      const userInfo = {
        id: user.id,
        forgotCode,
      };

      user.verifyCode = forgotCode;
      await user.save();

      const forgotToken = JWT.sign(userInfo, JWT_FORGOT_TOKEN_SECRET, { expiresIn: '5d' });
      const userName = `${user.firstName} ${user.lastName}`;
      await helper.forgotEmail(email, userName, forgotToken);

      res.json({
        status: 'ok',
        message: 'Please check your email',
      });
    } catch (e) {
      next(e);
    }
  };

  static resetPass = async (req, res, next) => {
    try {
      const { password, token } = req.body;
      const userInfo = JWT.verify(token, JWT_FORGOT_TOKEN_SECRET);
      const { id, forgotCode } = userInfo;

      const user = await Users.findOne({
        where: {
          id,
          verifyCode: forgotCode,
        },
      });
      console.log(user);
      if (_.isEmpty(user)) {
        throw HttpErrors(422, {
          status: 'error',
          message: 'User not found',
          errors: {
            message: 'User not found',
          },
        });
      }
      user.password = password;
      user.verifyCode = null;
      await user.save();
      res.json({
        status: 'ok',
        message: 'Successfully changed password',
      });
    } catch (e) {
      next(e);
    }
  };

  static resendVerifyCode = async (req, res, next) => {
    try {
      const { email } = req.body;

      const user = await Users.findOne({
        where: {
          email,
        },
      });

      if (user.verify) {
        res.json({
          status: 'ok',
          message: 'You already verified',
        });
      }

      const verifyCode = randomstring.generate({
        length: 6,
        charset: 'numeric',
      });

      await helper.verifyEmail(user.email, verifyCode);
      user.verifyCode = verifyCode;
      await user.save();
      res.json({
        status: 'ok',
        message: 'Check your email',
      });
    } catch (e) {
      next(e);
    }
  };

  static changePass = async (req, res, next) => {
    try {
      const { id } = req.account;
      const { oldPass, newPass } = req.body;
      const user = await Users.findOne({
        where: {
          id,
          password: oldPass,
        },
      });
      if (_.isEmpty(user)) {
        throw HttpErrors({
          status: 'error',
          message: 'Wrong old password',
          errors: {
            oldPass: 'Wrong old password',
          },
        });
      }
      user.password = newPass;
      await user.save();
      res.json({
        status: 'ok',
        message: 'Password successfully changed ',
      });
    } catch (e) {
      next(e);
    }
  };
}

export default UsersController;
