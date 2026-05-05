import React, { useEffect, useState } from "react";

const RecentFiles = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const data =
      JSON.parse(localStorage.getItem("recentFiles")) || [];
    setFiles(data);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Recent Files</h2>

      {files.length === 0 && <p>No recent files</p>}

      {files.map((file, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <strong>{file.name}</strong>
          <br />
          <small>{file.size} | {file.time}</small>
        </div>
      ))}
    </div>
  );
};

export default RecentFiles;
