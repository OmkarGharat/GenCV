import { FaCloudUploadAlt, FaCloudDownloadAlt } from "react-icons/fa";
import React, { useContext } from "react";
import {ResumeContext} from "../../builder";

const LoadUnload = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext);

  // load backup resume data
  const handleLoad = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const resumeData = JSON.parse(event.target.result);
      setResumeData(resumeData);
    };
    reader.readAsText(file);
  };

  // download resume data
  const handleDownload = (data, filename, event) => {
    event.preventDefault();
    const jsonData = JSON.stringify(data);
    const blob = new Blob([jsonData], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6 justify-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-0 z-10">
      <label className="flex items-center gap-2 px-6 py-3 bg-white text-black border-2 border-black rounded-full cursor-pointer hover:bg-zinc-100 transition-all shadow-sm font-bold">
        <FaCloudUploadAlt className="text-xl" />
        <span>Load Backup</span>
        <input
          aria-label="Load Data"
          type="file"
          className="hidden"
          onChange={(e) => {
             handleLoad(e);
             alert("Data Successfully Loaded!");
          }}
          accept=".json"
        />
      </label>

      <button
        aria-label="Save Data"
        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-zinc-900 transition-all shadow-sm font-bold"
        onClick={(event) => {
          handleDownload(
            resumeData,
            resumeData.name + " by ZenCV.json",
            event
          );
        }}
      >
        <FaCloudDownloadAlt className="text-xl" />
        <span>Save Backup</span>
      </button>
    </div>
  );
};

export default LoadUnload;
