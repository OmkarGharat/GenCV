import { MdPictureAsPdf, MdTextSnippet } from "react-icons/md";
import { saveAs } from "file-saver";

const WinPrint = () => {

  const print = () => {
    window.print();
  };

  const downloadDocx = async () => {
    try {
      const htmlDocx = (await import('html-docx-js/dist/html-docx')).default || (await import('html-docx-js/dist/html-docx'));
      
      const clone = document.getElementById("preview-section").cloneNode(true);
      
      const wrapper = clone.querySelector('#resume-cols-wrapper');
      const leftCol = clone.querySelector('#resume-left-col');
      const rightCol = clone.querySelector('#resume-right-col');
      
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
      <button
        aria-label="Download Resume as DOCX"
        className="font-bold rounded-full bg-white text-blue-600 shadow-lg border-2 border-white p-2"
        onClick={downloadDocx}
      >
        <MdTextSnippet className="w-10 h-10" title="Download Resume as DOCX" />
      </button>

      <button
        aria-label="Download Resume as PDF"
        className="font-bold rounded-full bg-white text-black shadow-lg border-2 border-white p-2"
        onClick={print}
      >
        <MdPictureAsPdf className="w-10 h-10" title="Download Resume as PDF" />
      </button>
    </div>
  );
};

export default WinPrint;