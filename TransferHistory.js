import React, { useEffect, useState } from "react";
import axios from "axios";

const baseURL = process.env.REACT_APP_BASEURL || "http://localhost:5000";

const TransferHistory = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        axios
            .get(`${baseURL}/api/file/history`)
            .then((res) => setData(res.data))
            .catch(() => setError("Failed to load transfer history"));
    }, []);

    if (error) return <p>{error}</p>;
    if (!data) return <p>Loading...</p>;

    return (
        <div style={{ padding: "20px" }}>
            <h2>File Transfer History</h2>

            <div style={{ marginBottom: "20px" }}>
                <p><strong>Total Files Transferred:</strong> {data.totalFiles}</p>
                <p><strong>Total Data Transferred:</strong> {data.totalSizeMB} MB</p>
            </div>

            <table border="1" width="100%" cellPadding="10">
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th>Size (MB)</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {data.files.map((file) => (
                        <tr key={file._id}>
                            <td>{file.file_name}</td>
                            <td>{(file.file_size / (1024 * 1024)).toFixed(2)}</td>
                            <td>{new Date(file.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransferHistory;
