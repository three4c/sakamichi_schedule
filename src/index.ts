import puppeteer from "puppeteer";
import fs from "fs";

import {
  SakamichiType,
  ScrapingInfoType,
  FieldType,
  ScheduleType,
} from "types";

/** 乃木坂 */
const getNogizakaSchedule = async (page: puppeteer.Page) => {
  await page.click(".b--lng");
  await page.waitForTimeout(1000);
  await page.click(".b--lng__one.js-lang-swich.hv--op.ja");
  await page.waitForTimeout(1000);

  return page.$$eval(".sc--lists .sc--day", (element) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    return element.map((item) => {
      const date = `${year}-${month}-${item
        .querySelector(".sc--day__hd")
        ?.getAttribute("id")}`;

      const schedule: ScheduleType[] = [];
      item.querySelectorAll(".m--scone").forEach((item) => {
        schedule.push({
          href: item.querySelector(".m--scone__a")?.getAttribute("href") || "",
          category:
            item.querySelector(".m--scone__cat__name")?.textContent || "",
          time: item.querySelector(".m--scone__start")?.textContent || "",
          text: item.querySelector(".m--scone__ttl")?.textContent || "",
        });
      });

      return {
        date,
        schedule,
      };
    });
  });
};

const getMember = async (page: puppeteer.Page) => {
  await page.click(".b--lng");
  await page.waitForTimeout(1000);
  await page.click(".b--lng__one.js-lang-swich.hv--op.ja");
  await page.waitForTimeout(1000);

  return page.$eval(".m--mem", (element) => {
    element
      .querySelector<HTMLElement>(".m--bg")
      ?.style.backgroundImage.slice(4, -1)
      .replace(/"/g, "");
  });
};

/** 日向坂 */
const getHinatazakaSchedule = (page: puppeteer.Page) =>
  page.$$eval(".p-schedule__list-group", (element) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const convertText = (text: string) => text.trim().replace(/\n/g, "");

    return element.map((item) => {
      const date = `${year}-${month}-${
        item.querySelector(".c-schedule__date--list span")?.textContent
      }`;

      const schedule: ScheduleType[] = [];
      item.querySelectorAll(".p-schedule__item a").forEach((item) => {
        schedule.push({
          href:
            `https://www.hinatazaka46.com${item.getAttribute("href")}` || "",
          category: convertText(
            item.querySelector(".c-schedule__category")?.textContent || ""
          ),
          time: convertText(
            item.querySelector(".c-schedule__time--list")?.textContent || ""
          ),
          text: convertText(
            item.querySelector(".c-schedule__text")?.textContent || ""
          ),
        });
      });

      return {
        date,
        schedule,
      };
    });
  });

/** スクレイピング */
const scraping = async (scrapingInfo: ScrapingInfoType[]) => {
  const browser = await puppeteer.launch({
    args: ["--lang=ja"],
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 320, height: 640 });

  const result: { [key in SakamichiType]: FieldType[] } = {
    nogizaka: [],
    hinatazaka: [],
  };

  for (const item of scrapingInfo) {
    await page.goto(item.url, {
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(1000);
    result[item.key] = await item.fn(page);
    /** Github Actionsのデバッグ用 */
    await page.screenshot({
      path: `./screenshot/${item.key}.jpeg`,
      type: "jpeg",
    });
  }

  await browser.close();
  return result;
};

const main = async () => {
  const scrapingInfo: ScrapingInfoType[] = [
    {
      key: "nogizaka",
      url: "https://www.nogizaka46.com/s/n46/media/list",
      fn: getNogizakaSchedule,
    },
    {
      key: "hinatazaka",
      url: "https://www.hinatazaka46.com/s/official/media/list?ima=0000&dy=202203",
      fn: getHinatazakaSchedule,
    },
  ];

  console.log("Scraping start");
  const field = await scraping(scrapingInfo);
  const obj = {
    nogizaka: field.nogizaka,
    hinatazaka: field.hinatazaka,
  };
  console.log("Scraping end");
  console.log("WriteFileSync start");
  fs.writeFileSync("./schedule.json", JSON.stringify(obj));
  console.log("WriteFileSync end");
};

main();
