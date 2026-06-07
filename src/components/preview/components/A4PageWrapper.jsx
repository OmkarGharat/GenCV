import React from 'react';

const A4PageWrapper = ({children}) => {

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
