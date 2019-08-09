require('events').EventEmitter.defaultMaxListeners = 100
const puppeteer = require('puppeteer');
const fs = require('fs')
const AWS = require('aws-sdk')
// const cron = require('node-cron')


const domain = 'https://www.heritagefund.org.uk/';
const widths = [320, 480, 600, 800, 768, 1024, 1280]
const paths = ['', 'funding', 'funding/outcomes']

const vcap = process.env.VCAP_SERVICES
const vcapJson = JSON.parse(vcap)
const vcapCredentials =  vcapJson.aws-s3-bucket[0].credentials
process.env.AWS_ACCESS_KEY_ID = vcapCredentials.aws_access_key_id
process.env.AWS_SECRET_ACCESS_KEY = vcapCredentials.aws_secret_access_key
const s3 = new AWS.S3()

const buildFilePath = (path) => {
    const isoDate = new Date().toISOString().split('T')[0]
    return `${isoDate}/${!path ? 'homepage' : path.replace('/', '-slash-')}`
}


async function makeScreenshots() {
    for (const path of paths) {
        console.log('path is ' + path)
        const filePath = buildFilePath(path)
        console.log(`file path is ${filePath}`)
        const absoluteFilePath = `${__dirname}/${filePath}`
        if (!fs.existsSync(absoluteFilePath)) {
            fs.mkdirSync(absoluteFilePath, ({ recursive: true }))
        }
        for (const width of widths) {
            console.log(`width is ${width}`);
            (async () => {
                const browser = await puppeteer.launch({args: ['--no-sandbox']});
                const page = await browser.newPage();
                await page.setViewport(Object.assign(page.viewport(), { width: parseInt(width) }));
                await page.goto(domain + path);
                console.log('writing ' + `${filePath}/${width}.png`)
                
                if (process.env.S3) {
                    const body = await page.screenshot({ fullPage: true });
                    const key = `${filePath}/${width}.png`
                    const params = {
                        Bucket: vcapCredentials.bucket_name,
                        Key: key,
                        Body: body,
                        ACL: 'public-read'
                    }
                    const putObject = await s3.putObject(params).promise().catch((e) => {
                        console.log(`threw excption ${e} attempting S3 PutObject`)
                    });
                    console.log(putObject)
                } else {
                    await page.screenshot({ path: `./${filePath}/${width}.png`, fullPage: true });
                }
                await browser.close();
            })().catch((e) => {
                console.log(`threw exception ${e}`)
            })
        }
    }
};

makeScreenshots();

// console.log("starting cron schedule")
// cron.schedule('0 8 * * *', () => {
//     console.log(`Running scheduled task at: ${new Date().toISOString}` )
//     makeScreenshots();
// })

