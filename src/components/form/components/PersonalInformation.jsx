import React, {useContext} from "react";
import {ResumeContext} from "../../builder";
import {BsTrash3} from "react-icons/bs";

const PersonalInformation = ({}) => {
  const {resumeData, setResumeData, handleProfilePicture, handleChange} =
    useContext(ResumeContext);

  return (
    <div className="flex-col-gap-2">
      <h2 className="input-title">Personal Information</h2>
      <div className="grid-4">
        <input
          type="text"
          placeholder="Full Name"
          name="name"
          className="pi"
          value={resumeData.name}
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="Job Title"
          name="position"
          className="pi"
          value={resumeData.position}
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="Contact Information"
          name="contactInformation"
          className="pi"
          value={resumeData.contactInformation}
          onChange={handleChange}
          minLength="10"
          maxLength="15"
        />
        <input
          type="email"
          placeholder="Email"
          name="email"
          className="pi"
          value={resumeData.email}
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="Address"
          name="address"
          className="pi"
          value={resumeData.address}
          onChange={handleChange}
        />
        <div className="flex flex-col gap-2">
          <input
            type="file"
            name="profileImage"
            accept="image/*"
            className="profileInput"
            onChange={handleProfilePicture}
            placeholder="Profile Picture"
          />
          {resumeData.profilePicture && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 h-fit text-white bg-zinc-900 rounded text-xl"
                aria-label="Remove"
                onClick={() => {
                  setResumeData({ ...resumeData, profilePicture: "" });
                  const fileInput = document.querySelector('.profileInput');
                  if (fileInput) fileInput.value = '';
                }}
              >
                <BsTrash3/>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInformation;
