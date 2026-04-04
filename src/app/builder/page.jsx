"use client";
import React from 'react';
import dynamic from 'next/dynamic';

import LoadingScreen from '../../components/LoadingScreen';

const Builder = dynamic(() => import('../../components/builder'), { 
  ssr: false,
  loading: () => <LoadingScreen /> 
});

const Page = () => {
  return (
    <div>
      <Builder/>
    </div>
  );
};

export default Page;
