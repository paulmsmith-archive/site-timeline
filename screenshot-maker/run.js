require('events').EventEmitter.defaultMaxListeners = 100
const puppeteer = require('puppeteer');
const fs = require('fs')
const AWS = require('aws-sdk')
const throttledQueue = require('throttled-queue')
const throttle = throttledQueue(1, 2000);
const schedule = require('node-schedule')

const domain = 'https://www.heritagefund.org.uk/';
const widths = [320, 480, 600, 800, 768, 1024, 1280]
const paths = ['', 'funding', 'funding/outcomes']

const vcap = process.env.VCAP_SERVICES
let bucketName
let s3
if (process.env.S3) {
    const vcapJson = JSON.parse(vcap)
    const s3Credentials = vcapJson['aws-s3-bucket'][0].credentials
    process.env.AWS_ACCESS_KEY_ID = s3Credentials.aws_access_key_id
    process.env.AWS_SECRET_ACCESS_KEY = s3Credentials.aws_secret_access_key
    bucketName = s3Credentials.bucket_name
    s3 = new AWS.S3({ apiVersion: '2006-03-01', region: s3Credentials.aws_region })
}

const buildFilePath = (path) => {
    const isoDate = new Date().toISOString().split('T')[0]
    return `${isoDate}/${!path ? 'homepage' : path}`
}

const getScreenshotBody = async function (url, width) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport(Object.assign(page.viewport(), { width: parseInt(width) }));
    await page.goto(url);
    const body = await page.screenshot({ fullPage: true });
    console.log(`got body for ${url}`)
    await browser.close();
    return body
}

const writeScreenshotFile = async function (url, width, filePath) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport(Object.assign(page.viewport(), { width: parseInt(width) }));
    await page.goto(url);
    await page.screenshot({ path: `./${filePath}/${width}.png`, fullPage: true });
    await browser.close()
    return (`wrote file ./${filePath}/${width}.png`)
}

const createLocalFolders = (filePath) => {
    const absoluteFilePath = `${__dirname}/${filePath}`
    if (!fs.existsSync(absoluteFilePath)) {
        fs.mkdirSync(absoluteFilePath, ({ recursive: true }))
    }
}



const putBodyToS3 = async function (body, key) {

    const params = {
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: 'image/png'
    }
    const putObject = await s3.putObject(params).promise().catch((e) => {
        return (`threw excption ${e} attempting S3 PutObject`)
    });
    return (`Successfully Put ${key}, ${JSON.stringify(putObject)}`)
}


async function makeScreenshots() {
    for (const path of paths) {
        const filePath = buildFilePath(path)
        if (!process.env.S3) {
            createLocalFolders(path)
        }
        for (const width of widths) {
            console.log(`width is ${width}`);
            (async () => {
                if (process.env.S3) {
                    throttle(() => {
                        getScreenshotBody(domain + path, width)
                            .then(body => putBodyToS3(body, `${filePath}/${width}.png`)
                                .then(console.log))
                    })
                } else {
                    writeScreenshotFile(domain + path, width, filePath).then(console.log)
                }
            })().catch((e) => {
                console.log(`threw exception ${e}`)
            })
        }
    }
};

makeScreenshots();

console.log("starting node schedule")
schedule.scheduleJob('0 8 * * *', (fireDate) => {
    console.log(`started scheduled task at ${fireDate.toISOString}`)
    makeScreenshots()
})