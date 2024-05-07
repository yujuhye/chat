const DB = require('../db/db');
const bcrypt = require('bcrypt');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

exports.passport = (app) => {

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (admin, done) {
        console.log('serializeUser: ', admin);

        done(null, admin.ADMIN_ID);

    });

    passport.deserializeUser(function (ADMIN_ID, done) {
        console.log('deserializeUser: ', ADMIN_ID);
        done(null, ADMIN_ID);

    });

    passport.use(new LocalStrategy(
        {
            usernameField: 'aId',
            passwordField: 'aPw'
        },
        function (adminname, password, done) {
            console.log('LocalStrategy: ', adminname, password);

            DB.query(`SELECT * FROM ADMIN_IFM WHERE ADMIN_ID = ?`,
                [adminname],
                (error, admin) => {

                    console.log('admin1 ---> ', admin);

                    if (error) {

                        return done(err);

                    }

                    if (admin.length > 0) {

                        console.log('admin2 ---> ', admin);
                        if (bcrypt.compareSync(password, admin[0].ADMIN_PW)) {

                            console.log('admin3 ---> ', admin);
                            return done(null, admin[0], { message: 'Welcome' });

                        } else {
                            return done(null, false, { message: 'INCORRECT ADMIN PW.' });

                        }

                    } else {
                        return done(null, false, { message: 'INCORRECT ADMIN ID.' });

                    }

                });
        }
    ));

    return passport;

}