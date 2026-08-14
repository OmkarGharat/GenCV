"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { saveAs } from 'file-saver';
import dynamic from 'next/dynamic';
import { ResumeContext } from '../../components/builder';

// Dynamically load the Preview component to avoid SSR issues
const Preview = dynamic(() => import('../../components/preview/ui/Preview'), {
  ssr: false,
});

const DIRECTORY_MAPPINGS = {
  "1": "1_Accenture_Quality_Engineer",
  "2": "2_Accenture_Quality_Engineer",
  "3": "3_Wipro_Test_Engineer_L1",
  "4": "4_Wipro_Test_Engineer_L3",
  "5": "5_MUFG_Test_Analyst",
  "6": "6_NTT_Data_Sr_QA",
  "7": "7_Linedata_BA_Tester",
  "8": "8_QualityKiosk_Sr_Test_Engineer",
  "9": "9_QualityKiosk_Test_Engineer_R-0043338-01",
  "10": "10_QualityKiosk_Test_Engineer_R-0042705-02",
  "11": "11_CashFlo_QA_Tester",
  "12": "12_Fractal_Automation_Test_Engineer",
  "13": "13_ADR_Functional_Tester",
  "14": "14_Rebel_Foods_QA_Engineer_II",
  "15": "15_DoubleTick_QA_Engineer",
  "16": "16_Coverfox_QA_Engineer",
  "17": "17_Finacus_Software_Tester",
  "18": "18_MUFG_Test_Analyst_Pune",
};

const EXTRA_MAPPINGS = {
  "OMKAR GHARAT JPMC VERSION": "JPMorgan_Chase_Software_Engineer",
  "OMKAR GHARAT BNP TEST ANALYST VERSION": "BNP_Paribas_Test_Analyst",
  "OMKAR GHARAT BNP FUNCTIONAL TESTER VERSION": "BNP_Paribas_Functional_Tester",
  "OMKAR GHARAT BNP STE VERSION": "BNP_Paribas_STE",
  "OMKAR GHARAT FINAL UPDATED": "General_Resume",
};

const SAFE_DEFAULTS = {
  name: "",
  position: "",
  contactInformation: "",
  email: "",
  address: "",
  profilePicture: "",
  socialMedia: [],
  summary: "",
  education: [],
  workExperience: [],
  projects: [],
  skills: [],
  languages: [],
  certifications: [],
};

function getOutputFolderName(fileName) {
  const baseName = fileName.replace(/\.json$/i, '');

  const match = baseName.match(/^(\d+)_/);
  if (match && DIRECTORY_MAPPINGS[match[1]]) {
    return DIRECTORY_MAPPINGS[match[1]];
  }

  for (const key of Object.keys(EXTRA_MAPPINGS)) {
    if (baseName.toUpperCase().includes(key.toUpperCase())) {
      return EXTRA_MAPPINGS[key];
    }
  }

  return baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export default function BulkBuilder() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [files, setFiles] = useState([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(-1);
  const [activeResumeData, setActiveResumeData] = useState(SAFE_DEFAULTS);
  const [zipLibLoaded, setZipLibLoaded] = useState(false);
  const JSZipRef = useRef(null);

  // Load JSZip dynamically to prevent next.js SSR failures
  useEffect(() => {
    import('jszip').then((mod) => {
      JSZipRef.current = mod.default || mod;
      setZipLibLoaded(true);
    }).catch(err => {
      console.error("Failed to load jszip library", err);
    });

    // Prefill contact details from localStorage
    if (typeof window !== 'undefined') {
      setEmail(localStorage.getItem('bulk_email') || '');
      setPhone(localStorage.getItem('bulk_phone') || '');
    }
  }, []);

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    
    const filePromises = selectedFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target.result);
            resolve({
              name: file.name,
              data: json,
              status: 'pending', // pending, compiling, completed, failed
              error: null,
              folder: getOutputFolderName(file.name)
            });
          } catch (err) {
            resolve({
              name: file.name,
              data: null,
              status: 'failed',
              error: 'Invalid JSON file',
              folder: ''
            });
          }
        };
        reader.readAsText(file);
      });
    });

    Promise.all(filePromises).then(processedFiles => {
      setFiles(prev => [...prev, ...processedFiles]);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!e.dataTransfer.files) return;
    
    const selectedFiles = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.json'));
    const filePromises = selectedFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target.result);
            resolve({
              name: file.name,
              data: json,
              status: 'pending',
              error: null,
              folder: getOutputFolderName(file.name)
            });
          } catch (err) {
            resolve({
              name: file.name,
              data: null,
              status: 'failed',
              error: 'Invalid JSON file',
              folder: ''
            });
          }
        };
        reader.readAsText(file);
      });
    });

    Promise.all(filePromises).then(processedFiles => {
      setFiles(prev => [...prev, ...processedFiles]);
    });
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const saveContactToLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bulk_email', email);
      localStorage.setItem('bulk_phone', phone);
    }
  };

  const retryFailedFiles = () => {
    const nextFiles = files.map(f => f.status === 'failed' ? { ...f, status: 'pending', error: null } : f);
    setFiles(nextFiles);
    runBulkGeneration(nextFiles);
  };

  const retrySingleFile = (index) => {
    const nextFiles = files.map((f, idx) => idx === index ? { ...f, status: 'pending', error: null } : f);
    setFiles(nextFiles);
    runBulkGeneration(nextFiles);
  };

  const runBulkGeneration = async (overrideFiles = null) => {
    const listToProcess = overrideFiles || files;

    if (!email || !phone) {
      alert("Please fill in both Email and Phone details.");
      return;
    }
    if (listToProcess.filter(f => f.status === 'pending').length === 0) {
      alert("Please upload at least one valid pending JSON resume.");
      return;
    }
    if (!zipLibLoaded || !JSZipRef.current) {
      alert("JSZip library is still loading, please wait a moment.");
      return;
    }

    saveContactToLocalStorage();
    setIsCompiling(true);
    
    const zip = new JSZipRef.current();

    let completedCount = 0;

    // Iterate through files
    for (let i = 0; i < listToProcess.length; i++) {
      if (listToProcess[i].status !== 'pending') continue;

      setCurrentFileIndex(i);
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'compiling' } : f));

      try {
        // 1. Prepare and merge data
        const mergedData = {
          ...SAFE_DEFAULTS,
          ...listToProcess[i].data,
          email: email,
          contactInformation: phone
        };

        // 2. Set as active data for Preview component
        setActiveResumeData(mergedData);

        // 3. Wait for rendering cycle to finish and CSS to apply
        await new Promise(resolve => setTimeout(resolve, 800));

        // 4. Extract rendered HTML and stylesheets
        const previewEl = document.getElementById("preview-section");
        if (!previewEl) {
          throw new Error("Preview wrapper (#preview-section) not found in DOM");
        }
        
        const html = previewEl.innerHTML;
        const styleTags = Array.from(document.querySelectorAll("style"))
          .map((s) => `<style>${s.innerHTML}</style>`)
          .join("\n");
        const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
          .map((l) => `<link rel="stylesheet" href="${l.href}" />`)
          .join("\n");
        const styles = `${linkTags}\n${styleTags}`;

        // 5. Post HTML/Styles to server API (with auto-retry)
        let response;
        let data;
        let attempts = 0;
        
        while (attempts < 2) {
          try {
            attempts++;
            response = await fetch("/api/generate-pdf", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ html, styles }),
            });
            data = await response.json();
            if (response.ok) break;
          } catch (fetchErr) {
            if (attempts >= 2) throw fetchErr;
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        }

        if (!response || !response.ok) {
          throw new Error(data?.details || data?.error || "Server-side PDF compile failed");
        }

        // 6. Decode PDF base64 and write into JSZip structure
        const byteCharacters = atob(data.pdf);
        const byteNumbers = new Array(byteCharacters.length);
        for (let j = 0; j < byteCharacters.length; j++) {
          byteNumbers[j] = byteCharacters.charCodeAt(j);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        // Add file inside folder: folderName/Omkar_Gharat_resume.pdf
        const folder = zip.folder(listToProcess[i].folder);
        folder.file("Omkar_Gharat_resume.pdf", blob);

        // Success
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'completed' } : f));
        completedCount++;
      } catch (err) {
        console.error("Compilation error on file:", listToProcess[i].name, err);
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'failed', error: err.message } : f));
      }

      // Short wait between files
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // 7. Download Zip File (Only if at least 1 file completed successfully)
    if (completedCount > 0) {
      try {
        const content = await zip.generateAsync({ type: "blob" });
        
        let savedViaPicker = false;
        if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
          try {
            const handle = await window.showSaveFilePicker({
              suggestedName: "Omkar_Gharat_Resumes.zip",
              startIn: 'downloads',
              types: [{
                description: 'ZIP Archive',
                accept: { 'application/zip': ['.zip'] }
              }]
            });
            const writable = await handle.createWritable();
            await writable.write(content);
            await writable.close();
            savedViaPicker = true;
          } catch (pickerErr) {
            if (pickerErr.name === 'AbortError') {
              savedViaPicker = true; // User cancelled save prompt intentionally
            }
          }
        }

        if (!savedViaPicker) {
          saveAs(content, "Omkar_Gharat_Resumes.zip");
        }
      } catch (zipErr) {
        alert("Failed to build ZIP file: " + zipErr.message);
      }
    } else {
      alert("No resumes were successfully compiled into PDF. Please fix errors and click Retry.");
    }

    setIsCompiling(false);
    setCurrentFileIndex(-1);
  };

  const removeCompletedFiles = () => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans selection:bg-zinc-800 selection:text-white" suppressHydrationWarning>
      {/* Invisible render area for extracting resume HTML */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '816px', visibility: 'hidden', overflow: 'hidden' }}>
        <ResumeContext.Provider value={{ resumeData: activeResumeData, setResumeData: () => {} }}>
          <Preview />
        </ResumeContext.Provider>
      </div>

      {/* Navbar (Matches HR Outreach) */}
      <nav className="w-full flex items-center justify-between p-6 md:px-12 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-lg">Z</span>
            </div>
            <span className="text-xl font-black text-black tracking-tighter">ZenCV.</span>
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-100 px-2 py-1 rounded">Bulk Engine</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/hr-outreach" className="text-sm font-bold text-gray-500 hover:text-black transition-colors">
            Recruiter Search 🔍
          </Link>
          <Link href="/builder" className="text-sm font-bold text-gray-500 hover:text-black transition-colors">
            Resume Builder
          </Link>
          <Link href="/" className="text-sm font-bold text-gray-500 hover:text-black transition-colors">
            Home
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-6xl w-full px-6 pt-12 pb-6 mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Bulk Resume Compile Engine
        </h1>
        <p className="text-gray-600 mt-2">
          Upload multiple JSON template files, merge your private contact credentials, and bundle them into organized folders.
        </p>
      </div>

      {/* Main Grid Layout */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Contact Form and Upload Zone (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Credentials Box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              Private Contact Details
            </h2>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              These details are merged in-memory and cached in your browser's localStorage. They are never transmitted or stored on any server.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. omkar.gharat@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200 focus:border-black text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91XXXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200 focus:border-black text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
                  suppressHydrationWarning
                />
              </div>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="bg-white border-2 border-dashed border-gray-200 hover:border-zinc-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
          >
            <input
              type="file"
              multiple
              accept=".json"
              onChange={handleFileChange}
              id="file-input"
              className="hidden"
            />
            <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-gray-400 mb-4 group-hover:scale-105 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-900 mb-1">Drag & Drop Resumes here</span>
              <span className="text-xs text-gray-500">or click to browse your JSON templates</span>
            </label>
          </div>
        </div>

        {/* Right Side: Selected Files List and Actions (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Queue Box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Queue List</h2>
                <span className="text-xs text-gray-500">{files.length} {files.length === 1 ? 'file' : 'files'} in queue</span>
              </div>
              <div className="flex items-center space-x-2">
                {files.some(f => f.status === 'completed') && (
                  <button
                    onClick={removeCompletedFiles}
                    disabled={isCompiling}
                    className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg disabled:opacity-50 transition-colors focus:outline-none flex items-center space-x-1"
                    title="Remove successful files from queue to leave only failed JSONs for retry"
                  >
                    <span>✓ Clear Successful ({files.filter(f => f.status === 'completed').length})</span>
                  </button>
                )}
                {files.some(f => f.status === 'failed') && (
                  <button
                    onClick={retryFailedFiles}
                    disabled={isCompiling}
                    className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg disabled:opacity-50 transition-colors focus:outline-none flex items-center space-x-1"
                  >
                    <span>↻ Retry Failed ({files.filter(f => f.status === 'failed').length})</span>
                  </button>
                )}
                {files.length > 0 && (
                  <button
                    onClick={clearAll}
                    disabled={isCompiling}
                    className="text-xs font-semibold text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors focus:outline-none"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Empty State */}
            {files.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
                <svg className="w-16 h-16 mb-4 opacity-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p className="text-sm font-semibold">No files uploaded yet.</p>
                <p className="text-xs text-gray-500 mt-1">Upload templates to start compiling.</p>
              </div>
            ) : (
              /* Files Table / Scroll Container */
              <div className="flex-1 overflow-y-auto max-h-[350px] pr-2 space-y-3">
                {files.map((file, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      idx === currentFileIndex 
                        ? 'bg-zinc-50 border-zinc-400 shadow-sm' 
                        : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        file.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                        file.status === 'failed' ? 'bg-red-50 text-red-800 border border-red-100' :
                        file.status === 'compiling' ? 'bg-amber-50 text-amber-800 border border-amber-100 animate-pulse' :
                        'bg-zinc-50 text-zinc-600 border border-zinc-100'
                      }`}>
                        {file.status === 'completed' ? '✓' : file.status === 'failed' ? '✗' : idx + 1}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                        {file.folder && (
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5">📂 {file.folder}</p>
                        )}
                        {file.error && (
                          <p className="text-[10px] text-red-600 truncate mt-0.5">{file.error}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 ml-4">
                      {file.status === 'pending' && (
                        <button
                          onClick={() => removeFile(idx)}
                          disabled={isCompiling}
                          className="w-7 h-7 hover:bg-zinc-100 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 disabled:opacity-50 transition-all focus:outline-none"
                        >
                          ✕
                        </button>
                      )}
                      {file.status === 'compiling' && (
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider animate-pulse">Compiling...</span>
                      )}
                      {file.status === 'completed' && (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Ready</span>
                      )}
                      {file.status === 'failed' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => retrySingleFile(idx)}
                            disabled={isCompiling}
                            className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-md transition-colors flex items-center space-x-1 focus:outline-none"
                            title="Retry compilation for this file"
                          >
                            <span>↻ Retry</span>
                          </button>
                          <button
                            onClick={() => removeFile(idx)}
                            disabled={isCompiling}
                            className="w-6 h-6 hover:bg-zinc-100 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 disabled:opacity-50 transition-all focus:outline-none text-xs"
                            title="Remove from queue"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions Footer */}
            {files.length > 0 && (
              <div className="border-t border-gray-100 pt-5 mt-5">
                {files.filter(f => f.status === 'pending').length > 0 ? (
                  <button
                    onClick={() => runBulkGeneration()}
                    disabled={isCompiling}
                    className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2 text-sm"
                  >
                    {isCompiling ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Compiling ({files.filter(f => f.status === 'completed').length}/{files.length})...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate & Download Resumes (ZIP)</span>
                      </>
                    )}
                  </button>
                ) : files.some(f => f.status === 'failed') ? (
                  <button
                    onClick={retryFailedFiles}
                    disabled={isCompiling}
                    className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2 text-sm"
                  >
                    <span>↻ Retry Failed Resumes ({files.filter(f => f.status === 'failed').length})</span>
                  </button>
                ) : (
                  <div className="text-center text-xs font-bold text-emerald-600 bg-emerald-50 py-3 rounded-xl border border-emerald-100">
                    ✓ All resumes processed successfully!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
