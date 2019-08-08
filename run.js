require('events').EventEmitter.defaultMaxListeners = 100
const puppeteer = require('puppeteer');
const fs = require('fs')
const domain = 'https://www.heritagefund.org.uk';
const widths = [320, 480, 600, 800, 768, 1024, 1200]
const paths = ['/', '/funding', '/funding/outcomes']
for (const path of paths) {
    console.log('path is ' + path)
    const filePath = path === '/' ? '/homepage' : path
    if (!fs.existsSync(__dirname + filePath)) {
        fs.mkdirSync(__dirname + filePath, ({ recursive: true }))
    }
    for (const width of widths) {
        console.log(`width is ${width}`);
        (async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setViewport(Object.assign(page.viewport(), { width: parseInt(width) }));
            await page.goto(domain + path);
            console.log('writing ' + `${filePath}/${width}.png`)
            await page.screenshot({ path: `./${filePath}/${width}.png`, fullPage: true });
            await browser.close();
        })().catch((e) => {
            console.log(`threw exception ${e}`)
        })
    }
};