import puppeteer from "puppeteer";
import { routes } from "./data.mjs";
import fs from "fs";

const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
  slowMode: 250,
  userDataDirectory: "temporary",
});

const dataArray = [];

for (const route of routes) {
  const page = await browser.newPage();

  await page.goto(`https://keep-design.vercel.app${route.href}`, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  const elements = await page.$$(".section-title");

  const sectionTitlesData = {
    id: route.id,
    name: route.name,
    href: route.href,
    tag: false,
    deprecate: false,
    sections: [],
  };

  for (const element of elements) {
    const title = await element.evaluate((el) =>
      el.textContent.replace(/#$/, "")
    );
    const id = `#${await element.evaluate((el) => el.id)}`;

    sectionTitlesData.sections.push({
      title,
      id,
    });
  }

  dataArray.push(sectionTitlesData);

  await page.close();
}

await browser.close();

// Write the array to a file
fs.writeFileSync(
  "componentsData.js",
  `export const data = ${JSON.stringify(dataArray, null, 2)};`
);
