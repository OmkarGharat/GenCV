import { useState } from "react";
import { MdPictureAsPdf, MdTextSnippet } from "react-icons/md";
import { saveAs } from "file-saver";

const WinPrint = () => {
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // ─── TRUE TEXT-LAYER PDF via Puppeteer API ───────────────────────────────
  // window.print() produces an image-based PDF (text not selectable = ATS fails).
  // This sends the resume HTML to a server-side Puppeteer instance that
  // generates a proper text-layer PDF — ATS reads it perfectly.
  const downloadPdf = async () => {
    setIsPdfLoading(true);
    try {
      // 1. Grab the rendered resume HTML
      const previewEl = document.getElementById("preview-section");
      if (!previewEl) throw new Error("Preview section not found");
      const html = previewEl.innerHTML;

      // 2. Collect all page styles so Puppeteer can render faithfully
      //    (Tailwind injects a <style> tag; we grab it + any <link> stylesheets)
      const styleTags = Array.from(document.querySelectorAll("style"))
        .map((s) => `<style>${s.innerHTML}</style>`)
        .join("\n");

      const linkTags = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]')
      )
        .map((l) => `<link rel="stylesheet" href="${l.href}" />`)
        .join("\n");

      const styles = `${linkTags}\n${styleTags}`;

      // 3. POST to the Next.js API route — returns base64-encoded PDF.
      //    We use base64 JSON instead of raw binary to avoid ERR_CONNECTION_RESET
      //    caused by Next.js 15 App Router's binary streaming behaviour.
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, styles }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "PDF generation failed");
      }

      // Decode base64 → Uint8Array → Blob → download
      const byteChars = atob(data.pdf);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteArr[i] = byteChars.charCodeAt(i);
      }
      const blob = new Blob([byteArr], { type: "application/pdf" });
      saveAs(blob, "resume.pdf");
    } catch (err) {
      console.error("PDF download error:", err);
      alert(`Could not generate PDF: ${err.message}`);
    } finally {
      setIsPdfLoading(false);
    }
  };

  // ─── DOCX download (unchanged) ───────────────────────────────────────────
  const downloadDocx = async () => {
    try {
      const htmlDocx =
        (await import("html-docx-js/dist/html-docx")).default ||
        (await import("html-docx-js/dist/html-docx"));

      const clone = document.getElementById("preview-section").cloneNode(true);

      const wrapper = clone.querySelector("#resume-cols-wrapper");
      const leftCol = clone.querySelector("#resume-left-col");
      const rightCol = clone.querySelector("#resume-right-col");

      if (wrapper && leftCol && rightCol) {
        wrapper.outerHTML = `
          <table style="width: 100%; border-collapse: collapse; border: none;">
            <tr>
              <td style="width: 35%; vertical-align: top; padding-right: 20px; border: none;">
                ${leftCol.innerHTML}
              </td>
              <td style="width: 65%; vertical-align: top; border: none;">
                ${rightCol.innerHTML}
              </td>
            </tr>
          </table>
        `;
      }

      const content = clone.innerHTML;
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Resume</title></head><body>${content}</body></html>`;
      const converted = htmlDocx.asBlob(html, { orientation: "portrait" });
      saveAs(converted, "resume.docx");
    } catch (err) {
      console.error("Error creating DOCX:", err);
    }
  };

  return (
    <div className="exclude-print fixed bottom-5 right-10 flex flex-col gap-3">
      {/* DOCX button */}
      <button
        aria-label="Download Resume as DOCX"
        className="font-bold rounded-full bg-white text-blue-600 shadow-lg border-2 border-white p-2"
        onClick={downloadDocx}
      >
        <MdTextSnippet className="w-10 h-10" title="Download Resume as DOCX" />
      </button>

      {/* PDF button — now uses Puppeteer for true text-layer PDF */}
      <button
        aria-label="Download Resume as PDF"
        className="font-bold rounded-full bg-white text-black shadow-lg border-2 border-white p-2 relative"
        onClick={downloadPdf}
        disabled={isPdfLoading}
      >
        {isPdfLoading ? (
          <svg
            className="w-10 h-10 animate-spin text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : (
          <MdPictureAsPdf
            className="w-10 h-10"
            title="Download Resume as PDF"
          />
        )}
      </button>
    </div>
  );
};

export default WinPrint;