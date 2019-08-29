var express = require('express');
var router = express.Router();
const config = require('../config')
const AWS = require('aws-sdk')

const s3 = new AWS.S3({ apiVersion: '2006-03-01' })
if (process.env.VCAP_SERVICES) {
  const vcapJson = JSON.parse(process.env.VCAP_SERVICES)
  const s3Credentials = vcapJson['aws-s3-bucket'][0].credentials
  process.env.AWS_ACCESS_KEY_ID = s3Credentials.aws_access_key_id
  process.env.AWS_SECRET_ACCESS_KEY = s3Credentials.aws_secret_access_key
}

const getDates = async (bucketName) => {
  const launchDate = new Date('2019-08-27')
  const params = {
    Bucket: bucketName,
    Delimiter: '/'
  }
  const result = await s3.listObjectsV2(params).promise()
  return result.CommonPrefixes
    .map(cp => cp.Prefix.slice(0, -1))
    .filter(d => new Date(d) > launchDate)
}

const getPaths = async (bucketName, dayString, host) => {
  const params = {
    Bucket: bucketName,
    Delimiter: '/',
    Prefix: dayString + '/'
  }
  const result = await s3.listObjectsV2(params).promise()
  return result.CommonPrefixes.map(function (cp) {
    return {
      urlPath: cp.Prefix.split('/')[1].replace(/-slash-/g, '/'),
      imagePath: `${host}/${cp.Prefix}`
    }
  })
}

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    res.render('index.html', { dates: await getDates(config.bucketName) });
  } catch (e) {
    next(e)
  }
});

router.get('^/:date([0-9]{4}-[0-9]{2}-[0-9]{2})', async (req, res) => {
  try {
    const paths = await getPaths(config.bucketName, req.params.date, config.host)
    res.render('date.html', { widths: config.widths, date: req.params.date, host: config.host, paths: paths });
  } catch (e) {
    next(e)
  }
});

router.get('/healthcheck', (req, res) => res.send('OK'))


module.exports = router;
