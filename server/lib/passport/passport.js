const DB = require('../db/db');
const bcrypt = require('bcrypt');
let passport = require('passport');
const shortid = require('shortid');
let LocalStrategy = require('passport-local').Strategy;
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

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

    let googleCredential = require('../config/google.json');

    passport.use(new GoogleStrategy({
        clientID: googleCredential.web.client_id,
        clientSecret: googleCredential.web.client_secret,
        callbackURL: googleCredential.web.redirect_uris[0],
    },
        function (accessToken, refreshToken, profile, done) {

            console.log('GoogleStrategy ---> ', accessToken, refreshToken, profile);
            console.log('profile.id ---> ', profile.id);
            console.log('emails.value ---> ', profile.emails[0].value);

            let email = profile.emails[0].value;

            DB.query(
                `
                SELECT * FROM USER_IFM WHERE USER_EMAIL = ?
                `,
                [email],
                (error, member) => {

                    console.log('-----> 0');

                    // 구글에 로그인 허락, 그리고 우리 사이트에도 그 계정이 존재하는 경우
                    if (member.length > 0) {
                        DB.query(
                            `
                             UPDATE USER_IFM SET USER_PASSPROT_ID = ? WHERE USER_EMAIL = ?
                            `, [profile.id, email], (error, result) => {
                            done(null, member[0]);
                        }
                        );

                        // 구글에 로그인 허락, 그리고 우리 사이트에는 없는 계정인 경우
                    }

                    else {

                        let uId = shortid.generate();
                        let uPw = shortid.generate();
                        let uEmail = email;
                        let uNickname = '--';
                        let uPassportId = profile.id;

                        console.log('---> ', uId);
                        console.log('---> ', uPw);
                        console.log('---> ', uEmail);
                        console.log('---> ', uNickname);
                        console.log('---> ', uPassportId);

                        DB.query(`
                        INSERT INTO USER_IFM(USER_ID, USER_PW, USER_EMAIL, USER_NICKNAME, USER_PASSPROT_ID) VALUES(?,?,?,?,?)
                        `,
                            [uId, bcrypt.hashSync(uPw, 10), uEmail, uNickname, uPassportId],
                            (error, result) => {

                                done(null, { USER_ID: uId });

                            });
                    }
                }
            )
        }
    ));

    app.get('/auth/google',
        passport.authenticate('google', {
            scope: ['https://www.googleapis.com/auth/plus.login', 'email']
        }
        ));

    app.get('/auth/google/callback',
        passport.authenticate('google', {
            failureRedirect: 'http://localhost:3000'
        }),
        function (req, res) {
            sessionID = req.user.USER_ID;
            console.log('sessionID ---> ', sessionID);
            res.redirect('http://localhost:3000');
        });


    return passport;

}