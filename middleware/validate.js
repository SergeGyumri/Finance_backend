import HttpErrors from 'http-errors';
import _ from 'lodash';
import fs from 'fs';

const validator = (schema, path = 'body') => (req, res, next) => {
  try {
    const v = schema.validate(req[path], { abortEarly: false });
    if (v.error) {
      const errors = {};
      const normalize = (data) => {
        if (data.path[0] === 'login') {
          data.message = 'Incorrect email';
          return data.message;
        }
        if (data.path[0] === 'email') {
          data.message = 'Incorrect email';
          return data.message;
        }
        if (data.path[0] === 'password') {
          data.message = 'Password must be at minimum 6 characters long';
          return data.message;
        }
        if (data.path[0] === 'oldPass') {
          data.message = 'Password must be at minimum 8 characters long';
          return data.message;
        }
        if (data.path[0] === 'newPass') {
          data.message = 'Password must be at minimum 8 characters long';
          return data.message;
        }
        if (data.path[0] === 'firstName') {
          data.message = 'Invalid first name, not allowed empty';
          return data.message;
        }
        if (data.path[0] === 'lastName') {
          data.message = 'Invalid last name, not allowed empty';
          return data.message;
        }
        if (data.path[0] === 'nickname') {
          data.message = 'Invalid nickname, allowed a-zA-Z0-9, min 3 max 30';
          return data.message;
        }
        if (data.path[0] === 'gender') {
          data.message = 'Invalid Last name, allowed a-zA-Z, min 3 max 30';
          return data.message;
        }
        if (data.path[0] === 'verifyToken') {
          data.message = 'Invalid verifyToken';
          return data.message;
        }
        if (data.path[0] === 'reset') {
          data.message = 'Invalid reset, allowed true or false';
          return data.message;
        }
        if (data.path[0] === 'id') {
          data.message = 'Invalid id, allowed only string';
          return data.message;
        }
        if (data.path[0] === 'startDate') {
          data.message = 'Start date is required';
          return data.message;
        }
        if (data.path[0] === 'endDate') {
          data.message = 'End date is required';
          return data.message;
        }
        if (data.path[0] === 'birthDate') {
          data.message = 'Invalid birth date';
          return data.message;
        }
        if (data.path[0] === 'date') {
          data.message = 'Date is required';
          return data.message;
        }
        return data.message;
      };
      v.error.details.forEach((d) => {
        _.set(errors, d.path, normalize(d));
      });
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      throw new HttpErrors(422, { errors });
    }

    next();
  } catch (e) {
    next(e);
  }
};

export default validator;
