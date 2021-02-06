const passport = require('passport');
const db = require('../models');
const local = require('./local');

module.exports = () => {
  passport.serializeUser((user, done) => { // 서버쪽에 [{ id: 3, cookie: 'asdfgh' }]
    return done(null, user.userId);
  });

  passport.deserializeUser(async (userId, done) => {
    try {
      const user = await db.USERS.findOne({
        where: { userId },
      });
      return done(null, user); // req.user
    } catch (e) {
      console.error(e);
      return done(e);
    }
  });

  local();

};