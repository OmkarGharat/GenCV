import WorkExperiences from "./workExperience/ui/WorkExperiences";
import Projects from "./projects/ui/Projects";

const RightSide = ({resumeData}) => {
  return (
    <div className="space-y-2">
      {resumeData.workExperience.length > 0 && (
        <WorkExperiences/>
      )}
      {resumeData.projects.length > 0 && (
        <Projects/>
      )}
    </div>
  );
};

export default RightSide;
