const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { ensureAudioFolder } = require("./utils/fileHelpers");

const SUNO_COOKIE = process.env.SUNO_COOKIE;

// Convert prompt to safe slug
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .substring(0, 30);

async function sunoAutomation(prompts) {
  await ensureAudioFolder();

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Set up download folder
  await page._client().send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: path.resolve(__dirname, "output", "audio"),
  });

  // Set login cookie
  await page.setCookie({
    name: "session",
    value: SUNO_COOKIE,
    domain: ".suno.com",
    path: "/",
    httpOnly: true,
    secure: true,
  });

  console.log("✅ Logged into Suno with session");

  let trackCounter = 1;

  for (const prompt of prompts) {
    const slug = slugify(prompt);

    for (let i = 1; i <= 2; i++) {
      const songTitle = `${slug}-Track${i}`;
      console.log(`🎼 Generating: ${songTitle}`);

      await page.goto("https://suno.com/create?wid=default", {
        waitUntil: "networkidle2",
      });

      // Toggle "Instrumental"
      const toggle = await page.$x("//div[contains(text(), 'Instrumental')]");
      if (toggle.length > 0) {
        await toggle[0].click();
        await page.waitForTimeout(500);
        console.log("🎛️ Instrumental ON");
      }

      // Fill style description
      await page.waitForSelector(
        'textarea[placeholder="Enter style description"]',
        { timeout: 15000 }
      );
      await page.type('textarea[placeholder="Enter style description"]', prompt);

      // Expand "More Options"
      const [moreOptions] = await page.$x("//div[contains(text(), 'More Options')]");
      if (moreOptions) {
        await moreOptions.click();
        await page.waitForTimeout(500);
      }

      // Fill song title
      await page.type('input[placeholder="Enter song title"]', songTitle);

      // Click Create
      await page.click("#generate-button");
      console.log(`🎶 Generating track: ${songTitle}`);
      await page.waitForTimeout(10000);

      // Open library to find the track
      await page.goto("https://suno.com/library?liked=true", {
        waitUntil: "networkidle2",
      });

      // XPath to the correct 3-dot menu for this track
      const xpath = `//div[contains(text(), '${songTitle}')]//ancestor::div[contains(@class, 'chakra-card')]//button[contains(@class, 'chakra-menu__menu-button')]`;
      await page.waitForXPath(xpath, { timeout: 60000 });
      const [menuBtn] = await page.$x(xpath);
      if (menuBtn) {
        await menuBtn.click();
        await page.waitForTimeout(500);
      } else {
        console.warn(`⚠️ No menu button found for: ${songTitle}`);
        continue;
      }

      // Hover over "Download"
      const [downloadBtn] = await page.$x("//div[contains(text(), 'Download')]");
      if (downloadBtn) {
        await downloadBtn.hover();
        await page.waitForTimeout(500);
      } else {
        console.warn("⚠️ 'Download' option not found");
        continue;
      }

      // Click "MP3 Audio"
      const [mp3Btn] = await page.$x("//div[contains(text(), 'MP3 Audio')]");
      if (mp3Btn) {
        await mp3Btn.click();
        console.log(`⬇️ Download triggered: ${songTitle}`);
      } else {
        console.warn("⚠️ 'MP3 Audio' not found");
        continue;
      }

      // Wait for file to download
      await page.waitForTimeout(10000);
      trackCounter++;
    }
  }

  await browser.close();
  console.log("✅ All tracks created and downloaded.");
}

module.exports = sunoAutomation;
