import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import { existsSync } from "fs";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

let globalBrowser = null;

async function getBrowserInstance() {
  if (process.env.NODE_ENV === "production") {
    // In production (Vercel), always launch fresh — stateless Lambda.
    // Caller is responsible for closing this browser when done.
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }

  // Reuse active browser instance in dev mode
  if (
    globalBrowser &&
    (typeof globalBrowser.isConnected === "function"
      ? globalBrowser.isConnected()
      : globalBrowser.connected)
  ) {
    return globalBrowser;
  }

  // Primary Default: Sigma → Firefox
  const candidates = [
    "C:\\Apps\\CR_618FA.tmp\\CHROME.PACKED\\chrome\\Chrome-bin\\sigma.exe",
    "C:\\Apps\\FirefoxPortable\\App\\Firefox64\\firefox.exe",
    "C:\\Apps\\FirefoxPortable\\App\\Firefox\\firefox.exe",
  ].filter(Boolean);

  const executablePath = candidates.find((p) => existsSync(p));
  if (!executablePath) {
    throw new Error("No Chrome, Firefox, or Edge found on this machine.");
  }

  console.log("[generate-pdf] Launching browser:", executablePath);

  const isFirefox = executablePath.toLowerCase().includes("firefox");

  globalBrowser = await puppeteer.launch({
    executablePath,
    headless: true,
    ...(isFirefox ? { product: "firefox" } : {}),
    args: isFirefox
      ? []
      : ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  return globalBrowser;
}

function buildFullHtml(html, styles) {
  return `<!DOCTYPE html>
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
}

async function generatePdfFromPage(browser, html, styles) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1 });
    await page.setContent(buildFullHtml(html, styles), { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: "0.4in", bottom: "0.4in", left: "0.4in", right: "0.4in" },
    });
    return { pdf: Buffer.from(pdfBuffer).toString("base64"), error: null };
  } finally {
    await page.close();
  }
}

export async function POST(request) {
  const body = await request.json();

  // ─── BATCH MODE ───────────────────────────────────────────────────────────
  // Payload: { batch: [{ html, styles, fileName }, ...] }
  // Returns: { results: [{ fileName, pdf (base64) | error }, ...] }
  if (body.batch && Array.isArray(body.batch)) {
    const { batch } = body;
    const isProduction = process.env.NODE_ENV === "production";
    let browser = null;

    try {
      browser = await getBrowserInstance();
      const results = [];

      for (const item of batch) {
        if (!item.html) {
          results.push({ fileName: item.fileName, error: "Missing html" });
          continue;
        }
        try {
          const { pdf } = await generatePdfFromPage(browser, item.html, item.styles);
          results.push({ fileName: item.fileName, pdf, error: null });
        } catch (err) {
          console.error("[generate-pdf] Batch item error:", item.fileName, err.message);
          results.push({ fileName: item.fileName, error: err.message });
        }
      }

      return NextResponse.json({ results });
    } catch (err) {
      console.error("[generate-pdf] Batch browser error:", err.message);
      return NextResponse.json(
        { error: "Browser launch failed", details: err.message },
        { status: 500 }
      );
    } finally {
      // In production: always close the browser to free /tmp resources.
      // In dev: keep the globalBrowser alive for reuse.
      if (isProduction && browser) {
        try { await browser.close(); } catch (_) {}
      }
    }
  }

  // ─── SINGLE MODE (backward compat — used by the single-resume builder) ────
  // Payload: { html, styles }
  // Returns: { pdf (base64) }
  const { html, styles } = body;
  if (!html) {
    return NextResponse.json({ error: "Missing html" }, { status: 400 });
  }

  const isProduction = process.env.NODE_ENV === "production";
  let browser = null;
  let page = null;

  try {
    browser = await getBrowserInstance();
    const { pdf } = await generatePdfFromPage(browser, html, styles);
    return NextResponse.json({ pdf });
  } catch (err) {
    console.error("[generate-pdf] Error:", err.message);
    return NextResponse.json(
      { error: "PDF generation failed", details: err.message },
      { status: 500 }
    );
  } finally {
    if (isProduction && browser) {
      try { await browser.close(); } catch (_) {}
    }
  }
}
