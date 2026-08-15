"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function AtsChecker() {
  const [activeTab, setActiveTab] = useState('batch'); // 'batch' or 'matcher'
  const [resumes, setResumes] = useState([]);
  const [jdText, setJdText] = useState('');
  const [selectedResumeIdx, setSelectedResumeIdx] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Clean text helper
  const cleanText = (txt) => {
    if (!txt) return '';
    return txt.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ').replace(/\s+/g, ' ');
  };

  // Word counter
  const countWords = (txt) => {
    if (!txt) return 0;
    return txt.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  // Single Resume Evaluator
  const evaluateResumeData = (fileName, data) => {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error("File content is not a valid JSON object");
      }

      const allText = [
        data.name || '',
        data.position || '',
        data.summary || '',
        data.address || '',
        (data.education || []).map(e => `${e.degree || ''} ${e.school || ''}`).join(' '),
        (data.workExperience || []).map(w => `${w.company || ''} ${w.position || ''} ${w.keyAchievements || ''}`).join(' '),
        (data.projects || []).map(p => `${p.name || ''} ${p.description || ''} ${p.keyAchievements || ''}`).join(' '),
        (data.skills || []).map(s => `${s.title || ''} ${(s.skills || []).join(' ')}`).join(' '),
        (data.certifications || []).join(' ')
      ].join(' ');

      const cleaned = cleanText(allText);
      const totalWords = countWords(allText);

      const defaultKeywords = ['selenium', 'cucumber', 'java', 'rest assured', 'postman', 'jira', 'git', 'sql', 'agile'];
      const matchedKeywords = defaultKeywords.filter(kw => cleaned.includes(kw));
      const keywordPct = Math.round((matchedKeywords.length / defaultKeywords.length) * 100);

      let score = 0;
      // Section presence (30 pts)
      const sections = [data.summary, data.workExperience, data.skills, data.education, data.projects, data.certifications].filter(Boolean).length;
      score += (sections / 6) * 30;

      // Contact info (10 pts)
      if (data.email && data.contactInformation) score += 10;
      else if (data.email || data.contactInformation) score += 5;

      // Word count optimization (20 pts)
      if (totalWords >= 350 && totalWords <= 550) score += 20;
      else if (totalWords >= 300 && totalWords <= 600) score += 15;
      else if (totalWords > 0) score += 10;

      // Keyword match (40 pts)
      score += (keywordPct / 100) * 40;
      score = Math.round(score);

      const warnings = [];
      if (totalWords > 550) warnings.push(`Word count (${totalWords}) is slightly high. Risk of single-page overflow.`);
      if (totalWords < 300) warnings.push(`Word count (${totalWords}) is low. Expand achievements.`);
      if (!data.position) warnings.push("Missing professional headline/position.");

      return {
        name: fileName,
        data,
        status: 'success',
        score,
        totalWords,
        keywordPct,
        matchedKeywords,
        missingKeywords: defaultKeywords.filter(kw => !matchedKeywords.includes(kw)),
        warnings,
        error: null
      };
    } catch (err) {
      return {
        name: fileName,
        data,
        status: 'error',
        score: 0,
        totalWords: 0,
        keywordPct: 0,
        matchedKeywords: [],
        missingKeywords: [],
        warnings: [err.message],
        error: err.message
      };
    }
  };

  const handleFileUpload = (e) => {
    if (!e.target.files) return;
    const filesArr = Array.from(e.target.files);

    const promises = filesArr.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const json = JSON.parse(ev.target.result);
            resolve(evaluateResumeData(file.name, json));
          } catch (err) {
            resolve({
              name: file.name,
              data: null,
              status: 'error',
              score: 0,
              totalWords: 0,
              keywordPct: 0,
              matchedKeywords: [],
              missingKeywords: [],
              warnings: ["Invalid JSON syntax"],
              error: err.message
            });
          }
        };
        reader.readAsText(file);
      });
    });

    Promise.all(promises).then(evaluatedList => {
      setResumes(prev => {
        const combined = [...prev, ...evaluatedList];
        // Sort numerically by prefix (1_, 2_, 3_...)
        combined.sort((a, b) => {
          const numA = parseInt((a.name.match(/^(\d+)_/) || [])[1] || 0, 10);
          const numB = parseInt((b.name.match(/^(\d+)_/) || [])[1] || 0, 10);
          if (numA !== numB) return numA - numB;
          return a.name.localeCompare(b.name);
        });
        return combined;
      });
    });
  };

  const retrySingleResume = (index) => {
    const item = resumes[index];
    if (item && item.data) {
      const reEvaluated = evaluateResumeData(item.name, item.data);
      setResumes(prev => prev.map((r, i) => i === index ? reEvaluated : r));
    } else {
      alert("Please re-upload a valid JSON file for this resume.");
    }
  };

  // Live JD Matcher Calculation
  const calculateJdMatch = () => {
    if (!jdText.trim() || !resumes[selectedResumeIdx] || !resumes[selectedResumeIdx].data) return null;

    const currentResume = resumes[selectedResumeIdx].data;
    const allText = [
      currentResume.name, currentResume.position, currentResume.summary,
      (currentResume.workExperience || []).map(w => `${w.company} ${w.position} ${w.keyAchievements}`).join(' '),
      (currentResume.skills || []).map(s => `${s.title} ${(s.skills || []).join(' ')}`).join(' ')
    ].join(' ');

    const cleanedResume = cleanText(allText);
    const cleanedJd = cleanText(jdText);

    // Extract common tech keywords from JD
    const techGlossary = ['java', 'selenium', 'cucumber', 'bdd', 'testng', 'rest assured', 'postman', 'api', 'sql', 'jira', 'git', 'maven', 'cypress', 'playwright', 'appium', 'python', 'pytest', 'uat', 'regression', 'agile', 'scrum', 'jenkins', 'ci/cd', 'devops'];

    const jdKeywords = techGlossary.filter(kw => cleanedJd.includes(kw));
    const matched = jdKeywords.filter(kw => cleanedResume.includes(kw));
    const missing = jdKeywords.filter(kw => !cleanedResume.includes(kw));

    const matchPct = jdKeywords.length > 0 ? Math.round((matched.length / jdKeywords.length) * 100) : 100;

    return {
      totalJdKeywords: jdKeywords.length,
      matchedCount: matched.length,
      matchPct,
      matched,
      missing
    };
  };

  const jdMatchResult = calculateJdMatch();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between p-6 md:px-12 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-lg">G</span>
            </div>
            <span className="text-xl font-black text-black tracking-tighter">GenCV.</span>
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-100 px-2 py-1 rounded">ATS Checker UI</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/bulk-builder" className="text-sm font-bold text-gray-500 hover:text-black transition-colors">
            Bulk Engine ⚡
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
      <div className="max-w-6xl w-full px-6 pt-10 pb-4 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              ATS Score & Resume Matcher
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Verify layout rules, single-page word counts, ATS compatibility scores, and job description keyword coverage.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center bg-gray-200/80 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'batch' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
                }`}
            >
              Mode A: Batch Resume Scorer ({resumes.length})
            </button>
            <button
              onClick={() => setActiveTab('matcher')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'matcher' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
                }`}
            >
              Mode B: Live JD Matcher
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 pb-20 mt-4">

        {/* Mode A: Batch Resume Scorer */}
        {activeTab === 'batch' && (
          <div className="space-y-6">
            {/* Upload Zone */}
            <div className="bg-white border-2 border-dashed border-gray-200 hover:border-zinc-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
              <input
                type="file"
                multiple
                accept=".json"
                onChange={handleFileUpload}
                id="ats-file-input"
                className="hidden"
              />
              <label htmlFor="ats-file-input" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-gray-400 mb-3 group-hover:scale-105 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                  🔍
                </div>
                <span className="text-sm font-bold text-gray-900 mb-1">Upload Pending JSON Resumes</span>
                <span className="text-xs text-gray-500">Evaluate word counts, ATS scores, and formatting warnings</span>
              </label>
            </div>

            {/* Resume Evaluation Cards */}
            {resumes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Evaluated Resumes ({resumes.length})</h2>
                  <button
                    onClick={() => setResumes([])}
                    className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resumes.map((res, idx) => (
                    <div
                      key={idx}
                      className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 transition-all ${res.status === 'error' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
                        }`}
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="overflow-hidden">
                          <h3 className="text-sm font-bold text-gray-900 truncate">{res.name}</h3>
                          <p className="text-xs text-gray-500">{res.totalWords} words (Target: 350 - 550)</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-xl text-xs font-black ${res.score >= 95 ? 'bg-emerald-100 text-emerald-800' :
                            res.score >= 80 ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {res.score}/100
                          </div>
                          {res.status === 'error' && (
                            <button
                              onClick={() => retrySingleResume(idx)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition-colors"
                              title="Retry evaluating this resume"
                            >
                              ↻ Retry
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Warnings / Errors */}
                      {res.warnings.length > 0 ? (
                        <div className="space-y-1">
                          {res.warnings.map((w, wIdx) => (
                            <p key={wIdx} className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 flex items-center space-x-1">
                              <span>⚠️</span>
                              <span>{w}</span>
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center space-x-1">
                          <span>✅</span>
                          <span>Fully clean. Ready for single-page compile!</span>
                        </p>
                      )}

                      {/* Keyword Matches */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Matched Keywords ({res.keywordPct}%)</span>
                        <div className="flex flex-wrap gap-1">
                          {res.matchedKeywords.map((kw, kIdx) => (
                            <span key={kIdx} className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode B: Live JD Matcher */}
        {activeTab === 'matcher' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: JD Input (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Paste Target Job Description (JD)</h2>
                <textarea
                  rows={12}
                  placeholder="Paste JD text here (e.g. Seeking QA Engineer with Java, Selenium WebDriver, REST Assured, Cucumber BDD, SQL...)"
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-black text-gray-900 text-sm rounded-xl p-4 focus:outline-none transition-colors font-mono text-xs"
                />
              </div>
            </div>

            {/* Right Column: Match Analysis (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Select Resume to Compare</h2>

                {resumes.length === 0 ? (
                  <p className="text-xs text-gray-500">Please upload at least one JSON resume in Mode A first.</p>
                ) : (
                  <select
                    value={selectedResumeIdx}
                    onChange={(e) => setSelectedResumeIdx(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs font-bold rounded-xl p-3 focus:outline-none"
                  >
                    {resumes.map((r, i) => (
                      <option key={i} value={i}>{r.name} ({r.score}/100)</option>
                    ))}
                  </select>
                )}

                {jdMatchResult && (
                  <div className="space-y-4 border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">JD Match Score</span>
                      <span className={`text-xl font-black ${jdMatchResult.matchPct >= 80 ? 'text-emerald-600' :
                        jdMatchResult.matchPct >= 60 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                        {jdMatchResult.matchPct}%
                      </span>
                    </div>

                    {/* Missing Keywords list */}
                    {jdMatchResult.missing.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Missing JD Keywords ({jdMatchResult.missing.length})</span>
                        <div className="flex flex-wrap gap-1">
                          {jdMatchResult.missing.map((m, mIdx) => (
                            <span key={mIdx} className="text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded">
                              + {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl">
                        🎉 Perfect Keyword Match! All JD tech skills present in resume.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
