const express = require('express');
const puppeteer = require('puppeteer');

// 明示的にChromeの実行パスを直接記述（Fly.io 用パス）
const executablePath = '/app/.cache/puppeteer/chrome/linux-127.0.6533.88/chrome-linux64/chrome';
console.log('Puppeteer executable path:', executablePath);

const app = express();
const PORT = process.env.PORT || 8080; // Fly.io 推奨ポート

app.get('/scrape', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing ?url= parameter.');
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.goto(targetUrl, {
      waitUntil: 'networkidle2',  // より緩やかなネットワーク待機条件
      timeout: 60000              // タイムアウト60秒に延長
    });
    const content = await page.content();
    res.send(content);
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  } finally {
    await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
