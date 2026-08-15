import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-zinc-900 font-black text-xl">G</span>
        </div>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <h2 className="text-2xl font-black text-black tracking-tighter">GenCV.</h2>
        <p className="text-zinc-500 font-medium animate-pulse text-sm">Preparing your workspace...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
