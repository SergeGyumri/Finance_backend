import cookieParser from 'cookie-parser';
import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import path from 'path';
import _ from 'lodash';
import indexRouter from './routes/index';
import headers from './services/headers';

const app = express();

app.use(headers);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.resolve('./public')));

app.use((req, res, next) => {
  let { limit, page } = req.query;

  page = _.toNumber(page >= 1 ? page : 1);
  const maxLimitValue = 100;
  const minLimitValue = 2;

  limit = _.toNumber(limit >= minLimitValue && limit <= maxLimitValue ? limit : 7);

  req.paginate = { limit, page };
  delete req.query.page;
  delete req.query.limit;
  next();
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status >= 500 || !err.status ? 422 : err.status).json({
    status: 'error',
    message: err.message,
    errors: err.errors,
  });
});

export default app;
