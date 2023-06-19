import jwt from 'jsonwebtoken';
import _ from 'lodash';

import Users from '../models/Users';

const exclude = [
  'POST:/users/register',
  'POST:/users/login',
  'POST:/users/forgot-pass',
  'PUT:/users/reset-pass',
  'POST:/users/resend',
  'POST:/users/verify',
];

const Authorization = async (req, res, next) => {
  try {
    const { originalUrl, method } = req;

    if (method === 'OPTIONS' || exclude.includes(`${method}:${originalUrl.replace(/\?.*/, '')}`)) {
      next();
      return;
    }

    const { authorization } = req.headers;
    if (!authorization) {
      res.status(401).json({
        message: 'Unauthorized',
      });
      return;
    }

    const { JWT_TOKEN } = process.env;
    const token = authorization.replace('Bearer ', '');
    const userInfo = jwt.verify(token, JWT_TOKEN);

    const { id } = userInfo;

    const user = await Users.findByPk(id);

    if (_.isEmpty(user)) {
      res.status(401).json({
        message: 'Unauthorized',
      });
      return;
    }
    const verifyMethod = 'POST:/users/verify';
    const resendMethod = 'POST:/users/resend';
    if (user.verify === false && (`${method}:${originalUrl.replace(/\?.*/, '')}` !== verifyMethod && `${method}:${originalUrl.replace(/\?.*/, '')}` !== resendMethod)) {
      res.status(401).json({
        message: 'Unauthorized',
      });
      return;
    }

    req.account = {
      id: user.id,
    };
    next();
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        message: 'Token expired',
      });
      return;
    }
    next(e);
  }
};

export default Authorization;
