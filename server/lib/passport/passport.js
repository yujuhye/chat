const DB = require('../db/db');
const bcrypt = require('bcrypt');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

exports.passport = (app) => {

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {
        console.log('serializeUser: ', user);

        done(null, user.USER_ID);

    });

    passport.deserializeUser(function (USER_ID, done) {
        console.log('deserializeUser: ', USER_ID);
        done(null, USER_ID);

    });

    passport.use(new LocalStrategy(
        {
            usernameField: 'uId',
            passwordField: 'uPw'
        },
        function (username, password, done) {
            console.log('LocalStrategy: ', username, password);

            DB.query(`SELECT * FROM USER_IFM WHERE USER_ID = ?`,
                [username],
                (error, member) => {

                    console.log('member1 ---> ', member);

                    if (error) {

                        return done(err);

                    }

                    if (member.length > 0) {

                        console.log('member2 ---> ', member);
                        if (bcrypt.compareSync(password, member[0].USER_PW)) {

                            console.log('member3 ---> ', member);
                            return done(null, member[0], { message: 'Welcome' });

                        } else {
                            return done(null, false, { message: 'INCORRECT MEMBER PW.' });

                        }

                    } else {
                        return done(null, false, { message: 'INCORRECT MEMBER ID.' });

                    }

                });
        }
    ));

    return passport;

}