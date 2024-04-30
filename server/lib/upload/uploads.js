const multer = require("multer");
const uuid4 = require("uuid4");
const path = require('path');
const fs = require('fs');

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


}

module.exports = uploads;