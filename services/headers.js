const ALLOW_ORIGINS = [
  'http://localhost:3000', 'http://localhost:3001', 'http://localhost:4000', 'http://192.168.31.137:3000',
];

export default function headers(req, res, next) {
  try {
    const { origin } = req.headers;
    if (ALLOW_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    next();
  } catch (e) {
    next(e);
  }
}
