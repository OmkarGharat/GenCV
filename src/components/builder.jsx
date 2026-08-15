"use client"

import React, { createContext, useState } from "react";
import Meta from "../components/meta/Meta";
import FormCloseOpenBtn from "../components/FormCloseOpenBtn";
import Preview from "../components/preview/ui/Preview";
import DefaultResumeData from "../components/utility/DefaultResumeData";
import dynamic from "next/dynamic";
import Form from "../components/form/ui/Form";

const ResumeContext = createContext(DefaultResumeData);

// server side rendering false
const Print = dynamic(() => import("../components/utility/WinPrint"), {
  ssr: false,
});

export default function Builder() {
  // resume data
  const [resumeData, setResumeData] = useState(DefaultResumeData);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.loadResumeData = setResumeData;
    }
  }, []);

  // form hide/show
  const [formClose, setFormClose] = useState(false);

  // profile picture
  const handleProfilePicture = (e) => {
    const file = e.target.files[0];

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeData({ ...resumeData, profilePicture: event.target.result });
      };
      reader.readAsDataURL(file);
    } else {
      console.error("Invalid file type or no file selected");
    }
  };

  const handleChange = (e) => {
    setResumeData({ ...resumeData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <ResumeContext.Provider
        value={{
          resumeData,
          setResumeData,
          handleProfilePicture,
          handleChange,
        }}
      >
        <Meta
          title="GenCV | Get hired with an elegant resume"
          description="GenCV is a cutting-edge resume builder that helps job seekers create a professional, beautiful resume in minutes. Say goodbye to frustration and wasted time. Create your winning resume with GenCV today and get noticed by employers."
          keywords="ATS-friendly, Resume optimization, Keyword-rich resume, Applicant Tracking System, ATS resume builder, ATS resume templates, ATS-compliant resume, ATS-optimized CV, ATS-friendly format, ATS resume tips, Resume writing services, Career guidance, Job search in India, Resume tips for India, Professional resume builder, Cover letter writing, Interview preparation, Job interview tips, Career growth, Online job applications, resume builder, free resume builder, resume ats, best free resume builder, resume creator, resume cv, resume design, resume editor, resume maker"
        />
        <div className="flex flex-col md:flex-row max-w-7xl md:mx-auto md:h-screen overflow-hidden">
          <div
            className="transition-all duration-500 ease-in-out shrink-0 overflow-hidden"
            style={{
              width: formClose ? '0' : '40%',
              opacity: formClose ? 0 : 1,
            }}
          >
            {/* Inner wrapper with fixed width prevents content squishing */}
            <div className="w-[40vw] max-w-[512px]">
              <Form />
            </div>
          </div>
          <Preview />
        </div>
        <FormCloseOpenBtn formClose={formClose} setFormClose={setFormClose} />
        <Print />
      </ResumeContext.Provider>
    </>
  );
}
export { ResumeContext };
