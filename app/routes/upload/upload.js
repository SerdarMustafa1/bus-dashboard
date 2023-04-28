const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const AWS = require('aws-sdk');
const imageThumbnail = require('image-thumbnail');
const shortId = require('shortid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const Picture = require('../../models/mysql/picture');

router.post('/picture', (req, res) => {
  if (!req.isAuth || !req.userId) return res.sendStatus(401);

  const form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, file) {
    // Todo: Multiple files.
    if (err) {
      console.log(err);
      return res.sendStatus(400);
    } else {
      const { campaign_id } = fields;
      if (!campaign_id || !String(file.img.type).includes('image'))
        return res.sendStatus(400);
      const ext = String(file.img.type).split('/')[1];
      if (!ext) return res.sendStatus(400);
      const path = file.img.path;
      const unID = new Date()
        .toISOString()
        .replace(/:/gi, '_')
        .replace(/\./gi, '-');
      const newpath = `media/campaigns/${fields.campaign_id}/images/${unID}.${ext}`;
      const thumbnail = `media/campaigns/${fields.campaign_id}/images/thumbnails/${unID}.${ext}`;

      fs.readFile(path, (err, data) => {
        if (err) throw err;
        const params = {
          ACL: 'public-read',
          Bucket: 'busdashboard', // pass your bucket name
          Key: newpath, // file will be saved as testBucket/contacts.csv
          Body: data,
        };
        s3.upload(params, function (s3Err, mainImg) {
          if (s3Err) {
            console.log('S3 ERROR', s3Err);
            res.sendStatus(400);
          } else {
            imageThumbnail(path).then((data) => {
              const params = {
                ACL: 'public-read',
                Bucket: 'busdashboard', // pass your bucket name
                Key: thumbnail, // file will be saved as testBucket/contacts.csv
                Body: data,
              };
              s3.upload(params, function (s3Err, thumb) {
                if (s3Err) {
                  console.log('S3 ERROR', s3Err);
                  res.sendStatus(400);
                } else {
                  Picture.createAsync(
                    new Picture({
                      campaign_id,
                      user_id: req.userId,
                      path: mainImg.Location,
                      thumbnail: thumb.Location,
                    })
                  );
                  console.log(`Image uploaded successfully`);
                  res.sendStatus(200);
                }
              });
            });
          }
        });
      });
    }
  });
});

router.use('/', (req, res) => {
  return res.sendStatus(404);
});

module.exports = router;
