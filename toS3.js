const knox = require('knox');


let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env;
} else {
    secrets = require('./secrets');
}

const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'imageboardwork'
});


function uploadToS3(req, res, next) {
    console.log(req.file);
    const s3Request = client.put(req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });

    const readStream = fs.createReadStream(req.file.path);

    readStream.pipe(s3Request);

    //acess images in https://s3.amazonaws.com/:Bucket/:filename

    s3Request.on('response', s3Response => {
        const wasSuccessful = s3Response.statusCode == 200;
        console.log(s3Response.statusCode);
        if(wasSuccessful){
            next();
        }else {
            res.sendStatus(500);
        }
    });
}

exports.uploadToS3 = uploadToS3;
