const express = require("express");
const bodyParser = require("body-parser");

const sunoAutomation = require("./sunoAutomation");
const mergeAudioFiles = require("./mergeAudio");
const generateImage = require("./generateImage");
const createVideo = require("./createVideo");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const { prompts, imagePrompt } = req.body;

  // ✅ Validate audio prompts
  if (!Array.isArray(prompts) || prompts.length < 5) {
    return res.status(400).json({ error: "Request must contain at least 5 audio prompts." });
  }

  // ✅ Validate image prompt
  if (typeof imagePrompt !== "string" || imagePrompt.trim() === "") {
    return res.status(400).json({ error: "Missing or invalid imagePrompt." });
  }

  try {
    console.log("🚀 Starting NowYouFoundChill automation pipeline...");
    console.log("🎧 Audio prompts:", prompts);
    console.log("🖼️ Image prompt:", imagePrompt);

    await sunoAutomation(prompts);
    await mergeAudioFiles();
    await generateImage(imagePrompt);
    await createVideo();

    res.status(200).json({ status: "success", message: "Video created successfully." });
  } catch (error) {
    console.error("💥 Pipeline failed:", error);
    res.status(500).json({ error: "Pipeline failed. Check logs for details." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ NowYouFoundChill running at http://localhost:${PORT}`);
});
