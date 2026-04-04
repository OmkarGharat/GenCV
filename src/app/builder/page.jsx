"use client";
import React from 'react';
import dynamic from 'next/dynamic';

const Builder = dynamic(() => import('../../components/builder'), { ssr: false });

const Page = () => {
  return (
    <div>
      <Builder/>
    </div>
  );
};

export default Page;
