const basePath = '/';

export default {
  url: {
    basePath,
  },
  timers: {
    userCookieExpiry: '12h',
  },
  env: {
    authSecret: process.env.TOKEN_SECRET_KEY || 'test',
  },
  authorizationIgnorePath: [
    '/',
    '/auth/login',
    '/auth/register',
  ],
};
