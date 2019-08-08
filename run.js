require('events').EventEmitter.defaultMaxListeners = 100
const puppeteer = require('puppeteer');
const fs = require('fs')
const domain = 'https://www.heritagefund.org.uk';
const widths = [320, 480, 600, 800, 768, 1024, 1200]
const paths = ['/', '/funding']
for (const path of paths) {
    console.log('path is ' + path)
    const withHomePagePath = path === '/' ? '/homepage' : path
    if (!fs.existsSync(__dirname + withHomePagePath)) {
        fs.mkdirSync(__dirname + withHomePagePath, ({ recursive: true }))
    }
    for (const width of widths) {
        console.log(`width is ${width}`);
        (async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setViewport(Object.assign(page.viewport(), { width: parseInt(width) }));
            await page.goto(domain + path);
            console.log('writing ' + `${withHomePagePath}/${width}.png`)
            await page.screenshot({ path: `./${withHomePagePath}/${width}.png`, fullPage: true });
            await browser.close();
        })()
    }
};