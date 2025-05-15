const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { ensureAudioFolder } = require("./utils/fileHelpers");

const SUNO_COOKIE = process.env.SUNO_COOKIE;

async function downloadFile(url, filename) {
  const writer = fs.createWriteStream(filename);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function sunoAutomation(prompts) {
  await ensureAudioFolder();
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Set the Suno session cookie
  await page.setCookie({
    name: "session",
    value: SUNO_COOKIE,
    domain: ".suno.com",
    path: "/",
    httpOnly: true,
    secure: true,
  });

  await page.goto("https://suno.com/create?wid=default", { waitUntil: "networkidle2" });
  console.log("Logged in with session cookie");

  let trackCounter = 1;

  for (const prompt of prompts) {
    console.log(`Generating tracks for prompt: ${prompt}`);
    await page.goto("https://suno.com/create", { waitUntil: "networkidle2" });

    await page.click('div:has-text("Instrumental")');

    await page.waitForSelector('textarea[placeholder="Enter style description"]');
    await page.type('textarea[placeholder="Enter style description"]', yourPrompt);

    await page.click("#generate-button");

    // Wait for at least two download buttons
    await page.waitForSelector(".download-button", { timeout: 180000 });

    const downloadLinks = await page.$$eval(".download-button", (links) =>
      links.map((el) => el.href).filter((href) => href.endsWith(".mp3"))
    );

    // Only get the first 2 tracks per prompt
    const twoLinks = downloadLinks.slice(0, 2);

    for (const link of twoLinks) {
      const filename = path.join(__dirname, "output", "audio", `track${trackCounter}.mp3`);
      console.log(`Downloading track${trackCounter}: ${link}`);
      await downloadFile(link, filename);
      trackCounter++;
    }

    // Small delay between prompts
    await page.waitForTimeout(3000);
  }

  await browser.close();
  console.log("Suno automation complete. All tracks downloaded.");
}

module.exports = sunoAutomation;
