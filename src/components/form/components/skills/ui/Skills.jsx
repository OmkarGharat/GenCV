import React, {useContext} from 'react';
import {ResumeContext} from "../../../../builder";
import SkillsGroup from "../components/SkillsGroup";

const Skills = () => {
  const {resumeData, setResumeData} = useContext(ResumeContext);

  return (
    <>
      {
        resumeData.skills.map((skill, index) => (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100" key={index}>
            <SkillsGroup
              title={skill.title}
            />
          </div>
        ))
      }
    </>
  );
};

export default Skills;
