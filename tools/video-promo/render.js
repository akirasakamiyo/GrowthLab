/* Render comp.html per frame (1920x1080, 30 fps, 60 dtk) ke ffmpeg, lalu gabung dengan music.wav */
const { chromium } = require("playwright"), path = require("path"), { spawn } = require("child_process");
const N = __dirname, FPS = 30, D = 60, NF = FPS * D;
(async () => {
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-", "-i", path.join(N, "music.wav"),
    "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-pix_fmt", "yuv420p", "-r", String(FPS), "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", path.join(N, "promo.mp4")], { stdio: ["pipe", "inherit", "inherit"] });
  const b = await chromium.launch({ channel: "chrome" }); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const er = []; p.on("pageerror", e => er.push(e.message));
  await p.goto("file://" + path.join(N, "comp.html")); await p.evaluate(() => window.ready);
  const t0 = Date.now();
  for (let i = 0; i < NF; i++) {
    await p.evaluate(t => render(t), i / FPS);
    const buf = await p.screenshot({ type: "jpeg", quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (i % 300 === 0) console.log("frame", i, Math.round((Date.now() - t0) / 1000) + "s");
  }
  ff.stdin.end(); await new Promise(r => ff.on("close", r)); await b.close(); console.log("selesai, error:", er);
})();
