const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const DB = require('../db/db');
const bcrypt = require('bcrypt');
const shortid = require('shortid');
const jwt = require('jsonwebtoken');

module.exports = function (app) {

    const jwtOptions = {
        secretOrKey: '1234',
    };

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {
        console.log('serializeUser: ', user);
        if (user.ADMIN_ID) {
            done(null, 'admin_' + user.ADMIN_ID);
        } else {
            done(null, user.USER_ID);
        }
    });

    passport.deserializeUser(function (id, done) {
        console.log('deserializeUser: ', id);
        if (id.startsWith('admin_')) {
            const adminId = id.replace('admin_', '');
            DB.query('SELECT * FROM ADMIN_IFM WHERE ADMIN_ID = ?', [adminId], (error, admin) => {
                done(error, admin[0]);
            });
        } else {
            DB.query('SELECT * FROM USER_IFM WHERE USER_ID = ?', [id], (error, user) => {
                done(error, user[0].USER_ID);
            });
        }
    });

    passport.use('user-local', new LocalStrategy({
        usernameField: 'uId',
        passwordField: 'uPw'
    },
        function (username, password, done) {
            console.log('LocalStrategy: ', username, password);

            DB.query(`SELECT * FROM USER_IFM WHERE USER_ID = ?`,
                [username],
                (error, member) => {

                    if (error) {
                        return done(err);
                    }

                    if (member.length > 0) {
                        if (bcrypt.compareSync(password, member[0].USER_PW)) {
                            return done(null, member[0], { message: 'Welcome' });
                        } else {
                            return done(null, false, { message: 'INCORRECT MEMBER PW.' });
                        }
                    } else {
                        return done(null, false, { message: 'INCORRECT MEMBER ID.' });
                    }

                });
        }));

    passport.use('admin-local', new LocalStrategy({
        usernameField: 'aId',
        passwordField: 'aPw'
    },
        function (adminname, password, done) {
            console.log('LocalStrategy: ', adminname, password);

            DB.query(`SELECT * FROM ADMIN_IFM WHERE ADMIN_ID = ?`,
                [adminname],
                (error, admin) => {

                    if (error) {
                        return done(error);
                    }

                    if (admin.length > 0) {
                        if (bcrypt.compareSync(password, admin[0].ADMIN_PW)) {
                            return done(null, admin[0], { message: 'Welcome' });
                        } else {
                            return done(null, false, { message: 'INCORRECT ADMIN PW.' });
                        }
                    } else {
                        return done(null, false, { message: 'INCORRECT ADMIN ID.' });
                    }

                });
        }));


    // admin sign-in
    app.post('/admin/adminSigninConfirm', (req, res, next) => {
        passport.authenticate('admin-local', { session: false }, (err, admin, info) => {
            if (err || !admin) {
                return res.status(400).json({
                    message: 'Login failed',
                    admin: admin
                });
            }
            req.login(admin, { session: false }, (err) => {
                if (err) {
                    res.send(err);
                }
                // Generate JWT token
                const adminToken = jwt.sign({ id: admin.ADMIN_ID, isAdmin: true }, jwtOptions.secretOrKey);

                return res.json({ adminToken });
            });
        })(req, res, next);
    });

    // user sign-in
    app.post('/member/signinConfirm', (req, res, next) => {
        passport.authenticate('user-local', { session: false }, (err, user, info) => {
            if (err || !user) {
                return res.json({
                    message: 'Login failed',
                    user: user
                });
            }
            req.login(user, { session: false }, (err) => {
                if (err) {
                    res.send(err);
                }
                // Generate JWT token
                const userToken = jwt.sign({ id: user.USER_ID, isAdmin: false }, jwtOptions.secretOrKey);
                return res.json({ userToken });
            });
        })(req, res, next);
    });

    // Google OAuth strategy
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

            DB.query(`SELECT * FROM USER_IFM WHERE USER_EMAIL = ?`, [email], (error, member) => {
                console.log('-----> 0');
                if (member.length > 0) {
                    DB.query(`UPDATE USER_IFM SET USER_PASSPROT_ID = ? WHERE USER_EMAIL = ?`, [profile.id, email], (error, result) => {
                        done(null, member[0]);
                    });
                } else {
                    let uId = shortid.generate();
                    let uPw = shortid.generate();
                    let uEmail = email;
                    let uNickname = '--';
                    let uPassportId = profile.id;

                    DB.query(`INSERT INTO USER_IFM(USER_ID, USER_PW, USER_EMAIL, USER_NICKNAME, USER_PASSPROT_ID) VALUES(?,?,?,?,?)`,
                        [uId, bcrypt.hashSync(uPw, 10), uEmail, uNickname, uPassportId],
                        (error, result) => {
                            done(null, { USER_ID: uId });
                        });
                }
            });

        }));

    // Google OAuth 로그인 경로
    app.get('/auth/google',
        passport.authenticate('google', {
            scope: ['https://www.googleapis.com/auth/plus.login', 'email']
        }
        ));

    // Google OAuth 콜백 경로
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            failureRedirect: 'http://localhost:3000'
        }),
        function (req, res) {
            const user = { id: req.user.USER_ID };
            console.log('user.id----> ', user.id);

            const userToken = jwt.sign(user, '1234');
            console.log('userToken----> ', userToken);

            res.json({ userId: user.id, userToken: userToken });
        });
    // passport 모듈 반환
    return passport;
};
