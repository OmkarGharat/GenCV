import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import { existsSync } from "fs";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function getBrowserInstance() {
  if (process.env.NODE_ENV === "production") {
    const chromium = require("@sparticuz/chromium");
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }

  // Local Windows dev — find system Chrome or Edge
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    process.env.LOCALAPPDATA
      ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
      : "",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean);

  const executablePath = candidates.find((p) => existsSync(p));
  if (!executablePath) {
    throw new Error("No Chrome or Edge found on this machine.");
  }

  console.log("[generate-pdf] Using browser:", executablePath);

  return puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
}

export async function POST(request) {
  let browser = null;

  try {
    const { html, styles } = await request.json();
    if (!html) {
      return NextResponse.json({ error: "Missing html" }, { status: 400 });
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Resume</title>
  ${styles || ""}
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .exclude-print { display: none !important; }
  </style>
</head>
<body>${html}</body>
</html>`;

    browser = await getBrowserInstance();
    const page = await browser.newPage();

    // Render at the template's natural width: 8.5in = 816px.
    // Puppeteer will then scale this down to fit A4's printable area
    // (A4 width minus 0.4in margins on each side) — exactly what Chrome
    // does in its print dialog. This preserves font sizes and proportions.
    await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1 });

    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
      // 0.4in = Chrome's exact "Default" margin setting.
      // Puppeteer scales viewport content to fit within these margins.
      margin: { top: "0.4in", bottom: "0.4in", left: "0.4in", right: "0.4in" },
    });

    await browser.close();
    browser = null;

    // Return as base64 JSON — avoids binary streaming issues in Next.js 15
    // App Router which can cause ERR_CONNECTION_RESET on large binary responses.
    const base64 = Buffer.from(pdfBuffer).toString("base64");

    return NextResponse.json({ pdf: base64 });

  } catch (err) {
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
    console.error("[generate-pdf] Error:", err.message);
    return NextResponse.json(
      { error: "PDF generation failed", details: err.message },
      { status: 500 }
    );
  }
}
