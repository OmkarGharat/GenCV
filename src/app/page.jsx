import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'ZenCV | The Ultimate Architect',
  description: 'Beat the ATS Algorithms with pristine code',
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center relative">
      <nav className="w-full flex items-center justify-between p-6 md:px-12 top-0 z-50 absolute">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center drop-shadow-md">
               <span className="text-white font-black text-2xl">Z</span>
            </div>
            <span className="text-2xl font-black text-black tracking-tighter">ZenCV.</span>
        </div>
        <Link href="/builder" className="text-sm font-bold text-gray-500 hover:text-black transition-colors">
            Go to Workspace →
        </Link>
      </nav>

      <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-8 mt-32 p-6">
        <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight">
          Beat the <span className="text-black">ATS Algorithms.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Stop wasting hours on formatting issues. Our high-performance resume builder 
          automatically structures your experience perfectly for Applicant Tracking Systems. No fluff, just results.
        </p>
        
        <Link 
          href="/builder" 
          prefetch={true}
          className="mt-8 px-10 py-5 bg-zinc-900 hover:bg-zinc-800 text-zinc-50 rounded-full text-xl font-extrabold shadow-2xl transition-all hover:scale-105 active:scale-95"
        >
          Build Your Resume Now
        </Link>
        
        <div className="mt-20 w-full max-w-5xl mx-auto drop-shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-2xl overflow-hidden border-8 border-gray-100 bg-white group">
          {/* PLACEHOLDER FOR REAL PRODUCT GIF */}
          <div className="h-12 bg-gray-100 flex items-center px-4 space-x-2 border-b border-gray-200">
             <div className="w-3 h-3 rounded-full bg-red-400 opacity-50"></div>
             <div className="w-3 h-3 rounded-full bg-amber-400 opacity-50"></div>
             <div className="w-3 h-3 rounded-full bg-green-400 opacity-50"></div>
          </div>
          
          <div className="relative w-full aspect-video bg-zinc-50 flex flex-col items-center justify-center border-t border-zinc-200 p-8 text-center text-zinc-400">
             <Image 
                src="/product_demo.png" 
                alt="Product Demo" 
                width={1200} 
                height={800} 
                className="w-full h-auto transform group-hover:scale-[1.01] transition-transform duration-700" 
                unoptimized
             />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
