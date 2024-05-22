const multer = require("multer");
const uuid4 = require("uuid4");
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const uploads = {

    UPLOAD_PROFILE_MIDDLEWARE: () => {

        const upload = multer({
            storage: multer.diskStorage({
                destination(req, file, done) {

                    let fileDir = `C:\\member\\upload\\profile_thums\\${req.body.uId}\\`;

                    console.log('req.body.uId  ---> ', req.body.uId);

                    if (!fs.existsSync(fileDir)) {
                        fs.mkdirSync(fileDir, { recursive: true });
                    }

                    done(null, `C:\\member\\upload\\profile_thums\\${req.body.uId}\\`);
                },
                filename(req, file, done) {
                    let uuid = uuid4();
                    let extName = path.extname(file.originalname);
                    let fileName = uuid + extName
                    done(null, fileName);
                },
            }),
            limits: {
                fileSize: 1024 * 1024,
            },
        });

        return upload.single('uFrontImgName');
    },
    UPLOAD_CHAT_IMG_MIDDLEWARE: () => {
        // 채팅 다중 이미지 전송
        const uploads = multer({
            storage: multer.diskStorage({
                destination(req, file, done) {
                    //let fileDir = `C:\\ChatSquare\\chat\\upload\\chatImg\\${req.user}`;
                    let fileDir = `C:\\ChatSquare\\chat\\upload\\chat`;

                    console.log('채팅 이미지 전송 -----> ', fileDir);
                    console.log('채팅 이미지 전송 -----> ', req.user);

                    if(!fs.existsSync(fileDir)) {
                        fs.mkdirSync(fileDir, {recursive: true});
                    }

                    //done(null, `C:\\ChatSquare\\chat\\upload\\chatImg\\${req.user}\\`);
                    done(null, `C:\\ChatSquare\\chat\\upload\\chat\\`);
                },
                filename(req, file, done) {
                    let uuid = uuid4();
                    let extName = path.extname(file.originalname);
                    let fileName = uuid + extName;
                    done(null, fileName);
                },
            }),
            limits: {
                fileSize: 1024 * 1024,
            },
        });

        return uploads.array('chat_img_name');
    },
    UPLOAD_CHAT_VIDEO_MIDDLEWARE: () => {
        // 채팅 다중 영상 전송
        const uploads = multer({
            storage: multer.diskStorage({
                destination(req, file, done) {
                    //let fileDir = `C:\\ChatSquare\\chat\\upload\\chatVideo\\${req.user}`;
                    let fileDir = `C:\\ChatSquare\\chat\\upload\\chat`;

                    console.log('채팅 영상 전송 -----> ', fileDir);
                    console.log('채팅 영상 전송 -----> ', req.user);

                    if(!fs.existsSync(fileDir)) {
                        fs.mkdirSync(fileDir, {recursive: true});
                    }

                    // done(null, `C:\\ChatSquare\\chat\\upload\\chatVideo\\${req.user}\\`);
                    done(null, `C:\\ChatSquare\\chat\\upload\\chat\\`);
                },
                filename(req, file, done) {
                    let uuid = uuid4();
                    let extName = path.extname(file.originalname);
                    let fileName = uuid + extName;
                    done(null, fileName);
                },
            }),
            limits: {
                fileSize: 1024 * 1024 * 100,
            },
        });

        return uploads.array('chat_video_name');
    },
    UPLOAD_CHAT_FILE_MIDDLEWARE: () => {
        // 채팅 다중 파일 전송
        const uploads = multer({
            storage: multer.diskStorage({
                destination(req, file, done) {
                    //let fileDir = `C:\\ChatSquare\\chat\\upload\\chatFile\\${req.user}`;
                    let fileDir = `C:\\ChatSquare\\chat\\upload\\chat`;

                    console.log('채팅 파일 전송 -----> ', fileDir);
                    console.log('채팅 파일 전송 -----> ', req.user);

                    if(!fs.existsSync(fileDir)) {
                        fs.mkdirSync(fileDir, {recursive: true});
                    }

                    //done(null, `C:\\ChatSquare\\chat\\upload\\chatFile\\${req.user}\\`);
                    done(null, `C:\\ChatSquare\\chat\\upload\\chat\\`);
                },
                filename(req, file, done) {
                    let uuid = uuid4();
                    let extName = path.extname(file.originalname);
                    let fileName = uuid + extName;
                    done(null, fileName);
                },
            }),
            limits: {
                fileSize: 1024 * 1024 * 100,
            },
        });

        return uploads.array('chat_file_name');
    },
    UPLOAD_MULTIPROFILE_MIDDLEWARE: () => {

        const upload = multer({
            storage: multer.diskStorage({
                destination(req, file, done) {

                    let fileDir = `C:\\member\\upload\\profile_thums\\${req.body.userId}\\`;

                    // console.log('profileImg userId ---> ', userId);

                    if (!fs.existsSync(fileDir)) {
                        fs.mkdirSync(fileDir, { recursive: true });
                    }

                    done(null, `C:\\member\\upload\\profile_thums\\${req.body.userId}\\`);
                },
                filename(req, file, done) {
                    let uuid = uuid4();
                    let extName = path.extname(file.originalname);
                    let fileName = uuid + extName
                    done(null, fileName);
                },
            }),
            limits: {
                fileSize: 1024 * 1024,
            },
        });

        return upload.fields([
            { name: 'uFrontImgName', maxCount: 1 },
            { name: 'profileBackImg', maxCount: 1 }
        ]);
    },


}

module.exports = uploads;