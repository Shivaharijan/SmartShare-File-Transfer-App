import React, { useState, useEffect } from "react";
import axios from "axios";
import download from "downloadjs";
import config from "../config";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { FileOpener } from "@capacitor-community/file-opener";
import "../stylesheets/home.css";

// Helper: Blob → Base64
const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
});

const SharedFiles = () => {
    const [sharedFiles, setSharedFiles] = useState([]);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        const storedFiles = JSON.parse(localStorage.getItem("sharedWithMe") || "[]");
        setSharedFiles(storedFiles);
    }, []);

    const clearHistory = () => {
        if (window.confirm("Are you sure you want to clear your shared history?")) {
            localStorage.removeItem("sharedWithMe");
            setSharedFiles([]);
        }
    };

    const handleDownload = async (file) => {
        if (!file._id) {
            alert("Cannot download: file ID missing.");
            return;
        }
        setDownloading(file._id);
        try {
            const response = await axios.get(
                `${config.API_URL}/api/file/${file._id}`,
                { responseType: "blob" }
            );

            let filename = file.file_name || "downloaded_file";
            const disposition = response.headers["content-disposition"];
            if (disposition && disposition.indexOf("filename=") !== -1) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, "");
                }
            }
            const mimeType = response.headers["content-type"];

            if (Capacitor.isNativePlatform()) {
                const base64Data = await blobToBase64(response.data);
                const savedFile = await Filesystem.writeFile({
                    path: filename,
                    data: base64Data.split(",")[1],
                    directory: Directory.Documents,
                    recursive: true
                });
                await FileOpener.open({
                    filePath: savedFile.uri,
                    contentType: mimeType
                });
                alert(`"${filename}" saved to Documents!`);
            } else {
                download(response.data, filename, mimeType);
            }
        } catch (err) {
            console.error("Download failed:", err);
            alert("Download failed: " + (err.message || "Unknown error"));
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h2 style={{ color: "var(--text-primary)", margin: 0 }}>Shared With Me</h2>
                {sharedFiles.length > 0 && (
                    <button
                        onClick={clearHistory}
                        style={{
                            background: "rgba(255, 77, 77, 0.1)",
                            color: "var(--danger)",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            cursor: "pointer"
                        }}
                    >
                        Clear History
                    </button>
                )}
            </div>

            {sharedFiles.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "50px" }}>
                    <i className="fas fa-inbox" style={{ fontSize: "48px", color: "var(--text-secondary)", marginBottom: "20px" }}></i>
                    <h3 style={{ color: "var(--text-primary)" }}>No files received yet</h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                        Files you download via code will appear here.
                    </p>
                </div>
            ) : (
                <div className="card" style={{ padding: "0" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                        <colgroup>
                            <col style={{ width: "38%" }} />
                            <col style={{ width: "26%" }} />
                            <col style={{ width: "20%" }} />
                            <col style={{ width: "16%" }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th style={thStyle}>File Name</th>
                                <th style={thStyle}>Sender</th>
                                <th style={thStyle}>Size</th>
                                <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sharedFiles.map((file, index) => (
                                <tr key={index} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                    <td style={{ ...tdStyle, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <div className={`file-icon icon-${file.file_mimetype ? file.file_mimetype.split("/")[1] : "default"}`}>
                                                <i className="fas fa-file-alt"></i>
                                            </div>
                                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "12px" }}>
                                                {file.file_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            background: "rgba(45, 96, 255, 0.1)",
                                            color: "var(--accent-blue)",
                                            padding: "3px 8px",
                                            borderRadius: "12px",
                                            fontSize: "11px",
                                            fontWeight: "600",
                                            display: "inline-block",
                                            maxWidth: "100%",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}>
                                            {file.sender_name || "Anon"}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: "12px" }}>
                                        {(file.file_size / 1024).toFixed(1)} KB
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: "center" }}>
                                        <button
                                            className="action-btn download-btn"
                                            onClick={() => handleDownload(file)}
                                            disabled={downloading === file._id}
                                            title="Download file"
                                            style={{ margin: "0 auto" }}
                                        >
                                            {downloading === file._id ? (
                                                <span style={{ fontSize: "12px" }}>…</span>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" fill="currentColor" />
                                                </svg>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const thStyle = {
    padding: "12px 8px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    borderBottom: "1px solid var(--border-color)",
    background: "var(--card-bg)"
};

const tdStyle = {
    padding: "12px 8px",
    color: "var(--text-primary)",
    verticalAlign: "middle"
};

export default SharedFiles;
