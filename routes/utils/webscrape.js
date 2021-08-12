const puppeteer = require("puppeteer");
const $ = require("jquery");

// Scrapes taobao links and returns image, price, item name
async function scrapeTaobao(link) {
    try {
        let browser = await puppeteer.launch({
            args: ["--no-sandbox"],
        });
        let page = await browser.newPage();

        // If it is the mobile website, copies the item id to the desktop url
        if (link.includes("detail")) {
            const urlSearchParams = new URLSearchParams(link.split("?")[1]);
            const params = urlSearchParams.get("id");

            link =
                "https://item.taobao.com/item.htm?spm=a2oq0.12575281.0.0.49501debEvFJCZ&ft=t&id=" +
                params;
        }
        await page.goto(link, { waitUntil: "networkidle2" });

        const data = await page.evaluate(() => {
            let imageURL = document.getElementById("J_ImgBooth");
            if (imageURL) imageURL = [imageURL.src];

            let price = document.querySelector("em[class='tb-rmb-num']");
            if (price) price = price.innerText;

            let itemName = document.getElementById("J_Title");
            if (itemName) itemName = itemName.innerText;

            return {
                imageURL,
                price,
                itemName,
            };
        });

        await browser.close();
        return data;
    } catch (err) {
        console.log("ERROR SCRAPING TAOBAO ", err);
    }
}

// Scrapes weidian links and returns image, price, item name
async function scrapeWeidian(link) {
    try {
        let browser = await puppeteer.launch({
            args: ["--no-sandbox"],
        });
        let page = await browser.newPage();

        await page.goto(link, { waitUntil: "networkidle2" });

        let data = await page.evaluate(() => {
            let imageURL = document.querySelector("img[class='item-img']");
            if (imageURL) imageURL = [imageURL.src];

            let priceSpan =
                document.querySelector("span[class='discount-cur']") ||
                document.querySelector(
                    "span[class='cur-price wd-theme__price']"
                );
            let price = "";
            if (priceSpan) price = priceSpan.innerText;

            let itemName = document.querySelector("div[class='item-title']");
            if (itemName) itemName = itemName.innerText;

            return {
                imageURL,
                price,
                itemName,
            };
        });
        await browser.close();
        return data;
    } catch (err) {
        console.log("ERROR SCRAPING WEIDIAN ", err);
    }
}

// Scrapes imgur links and returns image, price, item name
async function scrapeImgur(link) {
    try {
        let browser = await puppeteer.launch({
            args: ["--no-sandbox"],
        });
        let page = await browser.newPage();

        await page.goto(link, { waitUntil: "networkidle2" });

        let data = await page.evaluate(() => {
            let imageTags =
                document.getElementsByClassName("image-placeholder");
            let imageURL = [];
            if (imageTags) {
                for (let i = 0; i < imageTags.length; i++) {
                    imageURL.push(imageTags[i].src);
                }
            }

            return {
                imageURL,
            };
        });
        await browser.close();
        return data;
    } catch (err) {
        console.log("ERROR SCRAPING IMGUR ", err);
    }
}

// Redirects link to correct method
async function scrape(link) {
    if (link.includes("taobao")) return scrapeTaobao(link);
    if (link.includes("weidian")) return scrapeWeidian(link);
}

module.exports = { scrapeTaobao, scrapeWeidian, scrapeImgur, scrape };
