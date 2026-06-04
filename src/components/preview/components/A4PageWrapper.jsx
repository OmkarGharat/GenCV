import React, { useEffect } from 'react';

const A4PageWrapper = ({children}) => {
  useEffect(() => {
    const el = document.getElementById("preview-section");
    if (el) {
      const style = window.getComputedStyle(el);
      console.log("=== RESUME BUILDER DEBUG LOGS ===");
      console.log("Computed Font Family:", style.fontFamily);
      console.log("Computed Width:", style.width);
      console.log("Class List:", el.className);
      console.log("=================================");
    }
  }, []);

  const alertA4Size = () => {
    const preview = document.querySelector(".preview");
    const previewHeight = preview.offsetHeight;
    console.log("Preview Height:", previewHeight);
    if (previewHeight > 1122) {
      alert("A4 size exceeded");
    }
  };

  return (
    <div className="w-8.5in" id="preview-section" onLoad={alertA4Size}>
      {children}
    </div>
  );
};

export default A4PageWrapper;
