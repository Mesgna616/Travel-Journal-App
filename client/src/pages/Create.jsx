import React, { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../authContext";
import "../styles/create.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Create = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [info, setInfo] = useState({});

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prevFiles)=>
    [...prevFiles, ...newFiles]);
  };

  const handleClick = async (e) => {
    e.preventDefault();

    const list = await Promise.all(
        files.map(async (file) => {
            const data = new FormData();
            data.append("file", file);
            data.append("upload_preset", "mesgna");

            try {
                const uploadRes = await axios.post(
                    "https://api.cloudinary.com/v1_1/mesgna/image/upload",
                    data,
                    { withCredentials: false }
                );

                const { url } = uploadRes.data;
                return url;
            } catch (uploadErr) {
                console.error("Error uploading file:", uploadErr);
                throw uploadErr;  // Ensure that we don't proceed if upload fails
            }
        })
    );

    const newEntry = {
        ...info,
        author: user._id,
        photos: list,
    };

    try {
        console.log("Sending new entry:", newEntry);
        const response = await axios.post(
            "http://localhost:5500/api/entries/",
            newEntry,
            {
                withCredentials: false,
            }
        );

        console.log("Entry created successfully:", response.data);
        navigate(`/view/${response.data._id}`);
    } catch (err) {
        console.error("Error creating new entry:", err.response ? err.response.data : err.message);

        // Optional: Show a user-friendly error message
        alert(`Failed to create entry: ${err.response ? err.response.data : err.message}`);
    }
};


  return (
    <div className="create">
      <Navbar />
      <div className="createContainer">
        <div className="picsContainer">
          <div className="formInput">
            <h2>Upload Images (Max 3)</h2>
            <label htmlFor="file">
              <FontAwesomeIcon className="icon" icon={faPlusCircle} />
            </label>
            <input
              type="file"
              id="file"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
          <div className="uploadedPictures">
            {Array.from(files).map((file, index) => (
              <div className="upload_pic" key={index}>
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  height="80px"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="input">
          <label htmlFor="title">Title</label>
          <input
            onChange={handleChange}
            type="text"
            id="title"
            placeholder="Enter Title"
          />
        </div>
        <div className="input">
          <label htmlFor="location">Location</label>
          <input
            onChange={handleChange}
            type="text"
            id="location"
            placeholder="Enter Location"
          />
        </div>

        <div className="input">
          <label htmlFor="date">What is the Date</label>
          <input
            onChange={handleChange}
            type="date"
            id="date"
            placeholder="Choose Date"
          />
        </div>

        <div className="input">
          <label htmlFor="entry">Write your thoughts..</label>
          <textarea
            name="entry"
            id="text"
            cols="150"
            rows="25"
            onChange={handleChange}
            autoFocus
          ></textarea>
        </div>

        <button className="createBtn" onClick={handleClick}>
          Create Entry
        </button>
      </div>
    </div>
  );
};

export default Create;
