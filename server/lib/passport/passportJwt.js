const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { OAuth2Client } = require('google-auth-library');
const DB = require('../db/db');
const bcrypt = require('bcrypt');
const shortid = require('shortid');
const jwt = require('jsonwebtoken');

const CLIENT_ID = 'here!!!!';
const client = new OAuth2Client(CLIENT_ID);

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
    app.post('/auth/google', async (req, res) => {
        const { token } = req.body;

        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: CLIENT_ID,
            });
            const payload = ticket.getPayload();
            const email = payload.email;

            DB.query(`SELECT * FROM USER_IFM WHERE USER_EMAIL = ?`, [email], (error, member) => {
                if (member.length > 0) {
                    DB.query(`UPDATE USER_IFM SET USER_PASSPROT_ID = ? WHERE USER_EMAIL = ?`, [payload.sub, email], (error, result) => {
                        const userToken = jwt.sign({ id: member[0].USER_ID, isAdmin: false }, '1234');
                        res.json({ token: userToken });
                    });
                } else {
                    let uId = shortid.generate();
                    let uPw = shortid.generate();
                    let uEmail = email;
                    let uNickname = '--';
                    let uPassportId = payload.sub;

                    DB.query(`INSERT INTO USER_IFM(USER_ID, USER_PW, USER_EMAIL, USER_NICKNAME, USER_PASSPROT_ID) VALUES(?,?,?,?,?)`,
                        [uId, bcrypt.hashSync(uPw, 10), uEmail, uNickname, uPassportId],
                        (error, result) => {
                            const userToken = jwt.sign({ id: uId, isAdmin: false }, '1234');
                            res.json({ token: userToken });
                        });
                }
            });
        } catch (error) {
            res.status(400).send('Error verifying token');
        }
    });

    // passport 모듈 반환
    return passport;
};