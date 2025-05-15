const axios = require("axios");
const fs = require("fs");
const path = require("path");

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

async function generateImage(prompt) {
  if (!STABILITY_API_KEY) {
    throw new Error("Missing STABILITY_API_KEY.");
  }

  const outputPath = path.join(__dirname, "output", "image.jpg");

  const response = await axios.post(
    "https://api.stability.ai/v2beta/stable-image/generate/core",
    {
      model: "stable-diffusion-xl-1024-v1-0",
      prompt,
      output_format: "jpeg",
      aspect_ratio: "16:9",
    },
    {
      headers: {
        Authorization: `Bearer ${STABILITY_API_KEY}`,
        Accept: "image/jpeg",
      },
      responseType: "stream",
    }
  );

  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      console.log("Image generated and saved to:", outputPath);
      resolve(outputPath);
    });
    writer.on("error", reject);
  });
}

module.exports = generateImage;
