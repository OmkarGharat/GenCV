"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import hrDatabase from '../../data/hr_database.json';

const CopyIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
);

const TrainIcon = () => (
  <svg className="w-4 h-4 text-emerald-600 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
  </svg>
);

export default function HrOutreach() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, has_email, has_commute
  const [copiedText, setCopiedText] = useState(null);
  const [limit, setLimit] = useState(30);

  // Convert JSON database to array
  const companiesList = useMemo(() => {
    return Object.values(hrDatabase);
  }, []);

  // Filter list based on search and selected filter type
  const filteredCompanies = useMemo(() => {
    return companiesList.filter(item => {
      const companyMatch = item.company.toLowerCase().includes(searchTerm.toLowerCase());

      // Check if any recruiter name/title/email matches search term
      const recruiterMatch = item.recruiters.some(r =>
        (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.title || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesSearch = companyMatch || recruiterMatch;

      if (!matchesSearch) return false;

      if (filterType === 'has_email') {
        return item.recruiters.some(r => r.email && r.email.includes('@'));
      }
      if (filterType === 'has_commute') {
        return item.commute && item.commute.metro;
      }
      return true;
    });
  }, [companiesList, searchTerm, filterType]);

  const displayedCompanies = useMemo(() => {
    return filteredCompanies.slice(0, limit);
  }, [filteredCompanies, limit]);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getLinkedInInvite = (recruiterName, company) => {
    const rName = recruiterName && recruiterName !== "Talent Partner" ? recruiterName.split(' ')[0] : "there";
    return `Hi ${rName}, I saw you lead QA hiring at ${company}. I'm a QA Automation Tester with 3.8+ years of experience in ERP modules, Java, Selenium, & API testing. I'd love to connect and share my resume for open QA positions at your company. Thanks, Omkar`;
  };

  const getColdEmail = (recruiterName, company) => {
    const rName = recruiterName && recruiterName !== "Talent Partner" ? recruiterName : "Recruitment Team";
    return `Subject: QA Automation / Software Tester Application - Omkar Gharat

Dear ${rName},

I hope this email finds you well.

My name is Omkar Gharat, and I am a professional Software Tester with 3.8+ years of hands-on experience in both manual and automation testing. I specialize in testing core enterprise ERP modules (Inventory, Supply Chain, Sales, Manufacturing) and building robust Java-based Selenium BDD automation frameworks.

I noticed that ${company} is scaling its quality assurance team and wanted to reach out regarding open QA Automation or Manual Tester roles. I'd love to discuss how my experience in end-to-end testing, REST Assured API testing, and compliance automation can add value to your team.

I have attached my resume for your review. I would appreciate the opportunity to connect and discuss potential alignments.

Best regards,
Omkar Gharat
LinkedIn: https://linkedin.com/in/omkargharat`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center" suppressHydrationWarning>
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between p-6 md:px-12 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-lg">Z</span>
            </div>
            <span className="text-xl font-black text-black tracking-tighter">ZenCV.</span>
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-100 px-2 py-1 rounded">Outreach Hub</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/builder" className="text-sm font-bold text-gray-500 hover:text-black transition-colors">
            Resume Builder
          </Link>
          <Link href="/" className="text-sm font-bold text-gray-500 hover:text-black transition-colors">
            Home
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-6xl w-full px-6 pt-12 pb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Recruiter & Referral Outreach Database
        </h1>
        <p className="text-gray-600 mt-2">
          Instantly search 2,400+ verified recruiters, copy personalized templates, and review target company commute info.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-6xl w-full px-6 pb-20 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Database Filter</h3>

            <div className="flex flex-col space-y-2">
              <button
                onClick={() => { setFilterType('all'); setLimit(30); }}
                className={`text-left px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filterType === 'all'
                    ? 'bg-zinc-900 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                All Companies ({companiesList.length})
              </button>
              <button
                onClick={() => { setFilterType('has_email'); setLimit(30); }}
                className={`text-left px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filterType === 'has_email'
                    ? 'bg-zinc-900 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Verified HR Emails
              </button>
              <button
                onClick={() => { setFilterType('has_commute'); setLimit(30); }}
                className={`text-left px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filterType === 'has_commute'
                    ? 'bg-zinc-900 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Target Commute Details
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl text-white shadow-xl space-y-3">
            <h4 className="font-bold text-lg">💡 Quick Tip</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              LinkedIn connections with a message under 300 characters have a 3x higher response rate. Use the **Copy LinkedIn Note** button below for direct templates.
            </p>
          </div>
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Bar */}
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex items-center px-4">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search by company name, recruiter name, designation, or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setLimit(30); }}
              className="w-full text-gray-800 placeholder-gray-400 focus:outline-none font-medium bg-transparent py-1"
              suppressHydrationWarning
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs font-semibold text-gray-400 hover:text-black mr-2 bg-gray-100 px-2 py-1 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center px-2">
            <span className="text-sm font-bold text-gray-500">
              Found {filteredCompanies.length} matches
            </span>
            {copiedText && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-bounce">
                Copied {copiedText} successfully!
              </span>
            )}
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {displayedCompanies.map((item) => (
              <div key={item.company} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 hover:border-zinc-300 transition-colors">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">{item.company}</h2>
                    {item.commute && item.commute.metro && (
                      <div className="text-xs font-semibold text-zinc-500 mt-1 flex items-center">
                        <TrainIcon />
                        <span>{item.commute.metro} {item.commute.address ? `| ${item.commute.address}` : ''}</span>
                      </div>
                    )}
                  </div>
                  {item.commute && item.commute.salary && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full self-start">
                      Est. Salary: {item.commute.salary}
                    </span>
                  )}
                </div>

                {/* Recruiters Info */}
                {item.recruiters.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Recruiter Contacts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {item.recruiters.map((r, rIdx) => (
                        <div key={rIdx} className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex flex-col justify-between space-y-3">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{r.name}</h4>
                            <p className="text-gray-500 text-xs font-semibold">{r.title}</p>

                            {r.email && (
                              <div className="mt-2 flex items-center justify-between text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-100">
                                <span className="truncate mr-2">{r.email}</span>
                                <button
                                  onClick={() => handleCopy(r.email, 'Email')}
                                  className="text-zinc-600 hover:text-black p-1 hover:bg-zinc-100 rounded"
                                  title="Copy Email"
                                >
                                  <CopyIcon />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 pt-2">
                            {r.link && (
                              <a
                                href={r.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                View Profile
                              </a>
                            )}
                            <button
                              onClick={() => handleCopy(getLinkedInInvite(r.name, item.company), 'LinkedIn Note')}
                              className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition-all"
                            >
                              LinkedIn Note
                            </button>
                            {r.email && (
                              <button
                                onClick={() => handleCopy(getColdEmail(r.name, item.company), 'Cold Email')}
                                className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-colors"
                                title="Copy Cold Email Pitch"
                              >
                                Email Pitch
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-400 text-xs italic">No verified direct recruiters found yet. Use cold outreach via general recruitment page.</p>
                )}
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {filteredCompanies.length > limit && (
            <div className="flex justify-center pt-6">
              <button
                onClick={() => setLimit(prev => prev + 30)}
                className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-full text-sm font-bold text-gray-700 shadow-sm transition-all"
              >
                Show More Companies
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
