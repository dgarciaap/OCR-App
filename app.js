const express = require('express');
const app = express();
//read files, create files and such
const fs = require('fs');
//upload files to server
const multer = require('multer');
//read images
const {TesseractWorker} = require('tesseract.js');
const worker = new TesseractWorker();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

//Accept a single file with the name fieldName. The single file will be stored in req.file.
const upload = multer({ storage: storage }).single("avatar");


//we installed ejs for views (allow us to combine some html)
app.set("view engine", "ejs");
//give it some styles
app.use(express.static("public"));

//ROUTES
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/upload', (req, res) => {
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if(err) return console.log('This is your error', err);

            worker
            .recognize(data, "eng", {tessjs_create_pdf: "1"})
            .progress(progress => {
                console.log(progress);
            })
            .then(result => {
                //download as a pdf
                res.redirect('/download')
            })
            .finally(() => worker.terminate());
        });
    });
});

app.get('/download', (req, res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
});



//Start up our server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`running on ${PORT} port`));