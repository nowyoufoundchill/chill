const express = require("express");
const bodyParser = require("body-parser");
const sunoAutomation = require("./sunoAutomation");
const mergeAudioFiles = require("./mergeAudio");
const generateImage = require("./generateImage");
const createVideo = require("./createVideo");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const prompts = req.body.prompts;

  if (!Array.isArray(prompts) || prompts.length < 5) {
    return res.status(400).json({ error: "Request must contain at least 5 prompts." });
  }

  try {
    console.log("🚀 Starting NowYouFoundChill automation pipeline...");
    await sunoAutomation(prompts);
    await mergeAudioFiles();
    await generateImage(prompts[2]); // Use the 3rd prompt as visual inspiration
    await createVideo();

    res.status(200).json({ status: "success", message: "Video created successfully." });
  } catch (error) {
    console.error("💥 Automation pipeline failed:", error);
    res.status(500).json({ error: "Pipeline failed. Check logs for details." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ NowYouFoundChill running at http://localhost:${PORT}`);
});
