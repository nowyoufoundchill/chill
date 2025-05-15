const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "..", "output");
const AUDIO_DIR = path.join(OUTPUT_DIR, "audio");

function ensureAudioFolder() {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
    console.log("Created audio output folder.");
  }
}

module.exports = {
  AUDIO_DIR,
  ensureAudioFolder,
};
