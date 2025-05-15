const express = require("express");
const bodyParser = require("body-parser");
const sunoAutomation = require("./sunoAutomation");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const prompts = req.body.prompts;

  if (!Array.isArray(prompts) || prompts.length === 0) {
    return res.status(400).json({ error: "Missing or invalid prompts array." });
  }

  try {
    console.log("Received prompts:", prompts);
    await sunoAutomation(prompts);
    res.status(200).json({ status: "success", message: "Video creation started." });
  } catch (error) {
    console.error("Error running automation:", error);
    res.status(500).json({ error: "Something went wrong in the automation." });
  }
});

app.listen(PORT, () => {
  console.log(`NowYouFoundChill server running on port ${PORT}`);
});
