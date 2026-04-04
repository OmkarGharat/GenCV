import React from 'react';
import LoadUnload from "../components/LoadUnload";
import PersonalInformation from "../components/PersonalInformation";
import SocialMedias from "../components/socialMedia/ui/SocialMedias";
import Summary from "../components/Summary";
import Educations from "../components/education/ui/Educations";
import WorkExperiences from "../components/workExperience/ui/WorkExperiences";
import Projects from "../components/projects/ui/Projects";
import Skills from "../components/skills/ui/Skills";
import Languages from "../components/languages/ui/Languages";
import TestsAndCertifications from "../components/testsAndCertifications/ui/TestsAndCertifications";

const Form = () => {
  return (
    <form className="p-8 bg-gradient-to-br from-zinc-50 to-zinc-100 exclude-print md:max-w-[40%] md:h-screen md:overflow-y-scroll space-y-8 border-r border-zinc-200 custom-scrollbar">
      <LoadUnload/>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><PersonalInformation/></div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><SocialMedias/></div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><Summary/></div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><Educations/></div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><WorkExperiences/></div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><Projects/></div>
      <Skills/>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><Languages/></div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><TestsAndCertifications/></div>
    </form>
  );
};

export default Form;
