var express = require('express');
var router = express.Router();
const config = require('../config')
const AWS = require('aws-sdk')

const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

const getDates = async function () {
  const launchDate = new Date('2019-08-27')
  const params = {
    Bucket: process.env.bucket_name,
    Delimiter: '/'
  }
  const result = await s3.listObjectsV2(params).promise()
  return result.CommonPrefixes
    .map(cp => cp.Prefix.slice(0, -1))
    .filter(d => new Date(d) > launchDate)
}



/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    res.render('index.html', { dates: await getDates()});
  } catch (e) {
    next(e)
  }
});

router.get('^/:date([0-9]{4}-[0-9]{2}-[0-9]{2})', function (req, res) {
  res.render('date.html', { widths: config.widths, pages: config.pages, date: req.params.date, host: config.host });
});

module.exports = router;
