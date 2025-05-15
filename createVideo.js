const { exec } = require("child_process");
const path = require("path");

async function createVideo() {
  const imagePath = path.join(__dirname, "output", "image.jpg");
  const audioPath = path.join(__dirname, "output", "merged_audio.mp3");
  const outputPath = path.join(__dirname, "output", "video.mp4");

  return new Promise((resolve, reject) => {
    const command = [
      "ffmpeg",
      `-loop 1 -i "${imagePath}"`,
      `-i "${audioPath}"`,
      "-c:v libx264",
      "-tune stillimage",
      "-t 1800", // 30 minutes in seconds
      "-pix_fmt yuv420p",
      "-c:a aac",
      "-shortest",
      `"${outputPath}"`
    ].join(" ");

    console.log("Rendering final video...");
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("FFmpeg error:", stderr);
        return reject(error);
      }
      console.log("Video created:", outputPath);
      resolve(outputPath);
    });
  });
}

module.exports = createVideo;
