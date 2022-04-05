const express = require('express')
const route = require('./router/routes')
const bodyParser = require('body-parser')
const validator = require('express-validator');
const formidable = require('formidable');
require('./database/dbconnect')
const app = express()
const port = 5555
app.use(validator());
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}))
app.use(function (req, res, next) {
    // console.log("req=========>", req.body)
    // process.exit()
    var flag = 1;
    if (Object.keys(req.body).length != 0) {
        next()
    } else {
        var flag = 1;
        var form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.uploadDir = './uploads'
        form.parse(req, function (err, fields, files) {
            req.body = {}
            for (let item in fields) {
                req.body[item] = fields[item];
            }

            if (flag == 1) {
                req.files = files
                req.body = fields
                next();
            }

        });
    }


});


app.use('/', route)


app.listen(port, () => console.log(`Example app listening on port port!`))