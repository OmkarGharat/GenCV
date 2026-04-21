/* eslint-disable react/jsx-no-undef */
import {FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaTwitter, FaYoutube, FaTelegramPlane,} from "react-icons/fa";
import {CgWebsite} from "react-icons/cg";
import React, {useContext, useState} from "react";
import {ResumeContext} from "../../builder";
import dynamic from "next/dynamic";
import ModalHighlightMenu from "../components/ModalHighlightMenu";
import Header from "../components/Header";
import LeftSide from "../components/LeftSide";
import RightSide from "../components/RightSide";
import A4PageWrapper from "../components/A4PageWrapper";
import {onDragEndHandler} from "../utils/onDrugEndHandler";

const DragDropContext = dynamic(
  () =>
    import("@hello-pangea/dnd").then((mod) => {
      return mod.DragDropContext;
    }),
  {ssr: false}
);

const Preview = () => {
  const {resumeData, setResumeData} = useContext(ResumeContext);
  const icons = [
    {name: "github", icon: <FaGithub/>},
    {name: "linkedin", icon: <FaLinkedin/>},
    {name: "twitter", icon: <FaTwitter/>},
    {name: "facebook", icon: <FaFacebook/>},
    {name: "instagram", icon: <FaInstagram/>},
    {name: "youtube", icon: <FaYoutube/>},
    {name: "telegram", icon: <FaTelegramPlane/>},
    {name: "website", icon: <CgWebsite/>},
  ];

  return (
    <div className="flex-1 sticky top-0 preview rm-padding-print p-6 md:overflow-y-scroll md:h-screen w-full">
      <A4PageWrapper>
        <ModalHighlightMenu/>
        <DragDropContext onDragEnd={onDragEndHandler}>
          <Header resumeData={resumeData} icons={icons}/>
          <hr className="border-dashed my-2"/>
          <div id="resume-cols-wrapper" className="grid grid-cols-5 gap-4">
            <div id="resume-left-col" className="col-span-2"><LeftSide resumeData={resumeData}/></div>
            <div id="resume-right-col" className="col-span-3"><RightSide resumeData={resumeData}/></div>
          </div>
        </DragDropContext>
      </A4PageWrapper>
    </div>
  );
};

export default Preview;
