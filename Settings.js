import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import "../stylesheets/home.css";
import { useLanguage } from "../context/LanguageContext";
import { Capacitor, CapacitorHttp } from "@capacitor/core";

// Helper: use CapacitorHttp on Android native (avoids WebView SSL issues), axios on browser
const apiRequest = async (method, url, data = null) => {
    if (Capacitor.isNativePlatform()) {
        const options = {
            method: method.toUpperCase(),
            url,
            headers: { "Content-Type": "application/json" },
            ...(data ? { data } : {})
        };
        const res = await CapacitorHttp.request(options);
        if (res.status >= 400) throw { response: { data: res.data } };
        return res.data;
    } else {
        const res = await axios({ method, url, data });
        return res.data;
    }
};

const Settings = ({ logout }) => {
    const { t, changeLanguage, language } = useLanguage();
    const [theme, setTheme] = useState("dark");
    const [user, setUser] = useState({});

    // Profile State
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [photo, setPhoto] = useState("");
    const [profileMsg, setProfileMsg] = useState("");

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");

    // Appearance State
    const [fontSize, setFontSize] = useState("medium");

    useEffect(() => {
        // Theme Init
        const storedTheme = localStorage.getItem("theme") || "dark";
        setTheme(storedTheme);
        document.documentElement.setAttribute("data-theme", storedTheme);

        // User Init
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
            setUsername(storedUser.username || "");
            setEmail(storedUser.email || "");
            setMobile(storedUser.mobile || "");
            setPhoto(storedUser.photo || "");
        }

        // Appearance Init
        const storedFontSize = localStorage.getItem("fontSize") || "medium";
        setFontSize(storedFontSize);

        // Apply Font Size
        const fontSizes = { small: "85%", medium: "100%", large: "115%" };
        document.documentElement.style.fontSize = fontSizes[storedFontSize] || "100%";
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    const changeFontSize = (size) => {
        setFontSize(size);
        localStorage.setItem("fontSize", size);
        const fontSizes = { small: "85%", medium: "100%", large: "115%" };
        document.documentElement.style.fontSize = fontSizes[size];
    };

    const handleLanguageChange = (lang) => {
        changeLanguage(lang);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileMsg("");
        try {
            const data = await apiRequest("PUT", `${config.API_URL}/api/auth/update`, {
                id: user.id,
                username,
                email,
                mobile,
                photo
            });
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
            setProfileMsg(t("success"));
        } catch (err) {
            setProfileMsg(err.response?.data?.msg || err.message || t("error"));
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordMsg("");
        try {
            const data = await apiRequest("POST", `${config.API_URL}/api/auth/change-password`, {
                id: user.id,
                currentPassword,
                newPassword
            });
            setPasswordMsg(data.msg || t("success"));
            setCurrentPassword("");
            setNewPassword("");
        } catch (err) {
            setPasswordMsg(err.response?.data?.msg || err.message || t("error"));
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            try {
                await apiRequest("DELETE", `${config.API_URL}/api/auth/delete`, { id: user.id });
                alert("Account deleted.");
                logout();
            } catch (err) {
                alert("Failed to delete account");
            }
        }
    };

    const containerStyle = {
        padding: "20px",
        color: "var(--text-primary)"
    };

    const sectionStyle = {
        background: "var(--card-bg)",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "20px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
    };

    const inputStyle = {
        width: "100%",
        padding: "10px",
        margin: "10px 0",
        borderRadius: "5px",
        border: "1px solid var(--border-color)",
        background: "var(--bg-dark)",
        color: "var(--text-primary)"
    };

    const btnStyle = {
        padding: "10px 20px",
        borderRadius: "5px",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold",
        marginTop: "10px"
    };

    return (
        <div style={containerStyle}>
            <h2 style={{ marginBottom: "20px", fontSize: "22px" }}>{t("settings")}</h2>

            {/* Account / Profile Settings */}
            <div style={sectionStyle}>
                <h3 style={{ marginBottom: "15px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", fontSize: "18px" }}>
                    <i className="fas fa-user-circle" style={{ marginRight: "10px", color: "var(--text-primary)" }}></i>
                    {t("accountSettings")}
                </h3>

                <form onSubmit={handleUpdateProfile}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                        <div>
                            <label>{t("name")}</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label>Mobile</label>
                            <input
                                type="text"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                style={inputStyle}
                                placeholder="+91 9876543210"
                            />
                        </div>
                        <div>
                            <label>Photo</label>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        setProfileMsg("Uploading...");
                                        try {
                                            let photoUrl;
                                            if (Capacitor.isNativePlatform()) {
                                                // Android: read as base64, send via CapacitorHttp (no WebView SSL issues)
                                                const base64 = await new Promise((resolve, reject) => {
                                                    const reader = new FileReader();
                                                    reader.onload = () => resolve(reader.result.split(",")[1]);
                                                    reader.onerror = reject;
                                                    reader.readAsDataURL(file);
                                                });
                                                const res = await CapacitorHttp.request({
                                                    method: "POST",
                                                    url: `${config.API_URL}/api/auth/upload-photo-base64`,
                                                    headers: { "Content-Type": "application/json" },
                                                    data: { base64, filename: file.name, mimetype: file.type }
                                                });
                                                if (res.status >= 400) throw new Error(res.data?.msg || "Upload failed");
                                                photoUrl = res.data.photoUrl;
                                            } else {
                                                // Browser: standard multipart upload
                                                const formData = new FormData();
                                                formData.append("photo", file);
                                                const res = await axios.post(
                                                    `${config.API_URL}/api/auth/upload-photo`,
                                                    formData,
                                                    { headers: { "Content-Type": "multipart/form-data" } }
                                                );
                                                photoUrl = res.data.photoUrl;
                                            }
                                            const fullUrl = `${config.API_URL}/uploads/${photoUrl}`;
                                            setPhoto(fullUrl);
                                            setProfileMsg("Photo uploaded! Click Update Profile to save.");
                                        } catch (err) {
                                            const errMsg = err.response?.data?.msg || err.message || "Unknown error";
                                            setProfileMsg("Upload failed: " + errMsg);
                                            console.error("Photo upload error:", err);
                                        }
                                    }}
                                    style={{ ...inputStyle, padding: "5px" }}
                                />
                            </div>
                            {/* Hidden Input for manual URL override if needed, or just rely on state */}
                            {/* <input type="text" value={photo} onChange={e => setPhoto(e.target.value)} style={inputStyle} placeholder="Or enter URL" /> */}
                        </div>
                    </div>

                    {/* Photo Preview if URL exists */}
                    {photo && (
                        <div style={{ margin: "10px 0" }}>
                            <img src={photo} alt="Profile" style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }} />
                        </div>
                    )}

                    <button type="submit" style={{ ...btnStyle, background: "var(--accent-blue)", color: "white" }}>
                        {t("updateProfile")}
                    </button>
                    {profileMsg && <p style={{ marginTop: "10px", color: profileMsg.includes("success") || profileMsg === t("success") ? "var(--success)" : "red" }}>{profileMsg}</p>}
                </form>
            </div>

            {/* Change Password */}
            <div style={sectionStyle}>
                <h3 style={{ marginBottom: "15px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", fontSize: "18px" }}>
                    <i className="fas fa-lock" style={{ marginRight: "10px", color: "var(--text-primary)" }}></i>
                    {t("changePassword")}
                </h3>
                <form onSubmit={handleChangePassword}>
                    <input
                        type="password"
                        placeholder={t("currentPassword")}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        style={inputStyle}
                        required
                    />
                    <input
                        type="password"
                        placeholder={t("newPassword")}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={inputStyle}
                        required
                        minLength={6}
                    />
                    <button type="submit" style={{ ...btnStyle, background: "#f39c12", color: "white" }}>
                        {t("changePassword")}
                    </button>
                    {passwordMsg && <p style={{ marginTop: "10px", color: passwordMsg.includes("success") || passwordMsg === t("success") ? "var(--success)" : "red" }}>{passwordMsg}</p>}
                </form>
            </div>

            {/* Appearance */}
            <div style={sectionStyle}>
                <h3 style={{ marginBottom: "15px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", fontSize: "18px" }}>
                    <i className="fas fa-paint-brush" style={{ marginRight: "10px", color: "var(--text-primary)" }}></i>
                    {t("appearance")}
                </h3>

                {/* Theme Mode */}
                <div className="setting-item">
                    <div className="setting-label">
                        <h4>{t("themeMode")}</h4>
                        <p>{t("switchTheme")}</p>
                    </div>
                    <div className="setting-control">
                        <button onClick={toggleTheme} style={{ ...btnStyle, margin: 0, width: "100%", background: theme === "dark" ? "#444" : "#ddd", color: theme === "dark" ? "white" : "black" }}>
                            {theme === "dark" ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>} {theme === "dark" ? t("darkMode") : t("lightMode")}
                        </button>
                    </div>
                </div>

                {/* Font Size */}
                <div className="setting-item">
                    <div className="setting-label">
                        <h4>{t("fontSize")}</h4>
                        <p>{t("adjustFontSize")}</p>
                    </div>
                    <div className="setting-control">
                        {["small", "medium", "large"].map((size) => (
                            <button
                                key={size}
                                onClick={() => changeFontSize(size)}
                                style={{
                                    ...btnStyle,
                                    margin: 0,
                                    padding: "10px",
                                    background: fontSize === size ? "var(--accent-blue)" : "transparent",
                                    color: fontSize === size ? "white" : "var(--text-primary)",
                                    border: fontSize === size ? "none" : "1px solid var(--border-color)",
                                    textTransform: "capitalize"
                                }}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Language */}
                <div className="setting-item">
                    <div className="setting-label">
                        <h4>{t("language")}</h4>
                        <p>{t("selectLanguage")}</p>
                    </div>
                    <div className="setting-control">
                        {[
                            { code: "en", label: "English" },
                            { code: "hi", label: "Hindi (हिंदी)" },
                            { code: "ta", label: "Tamil (தமிழ்)" },
                            { code: "mr", label: "Marathi (मराठी)" },
                            { code: "bn", label: "Bengali (বাংলা)" },
                            { code: "te", label: "Telugu (తెలుగు)" }
                        ].map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                style={{
                                    ...btnStyle,
                                    margin: 0,
                                    padding: "10px",
                                    background: language === lang.code ? "var(--accent-blue)" : "transparent",
                                    color: language === lang.code ? "white" : "var(--text-primary)",
                                    border: language === lang.code ? "none" : "1px solid var(--border-color)",
                                }}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div style={{ ...sectionStyle, border: "1px solid red" }}>
                <h3 style={{ marginBottom: "15px", color: "red", borderBottom: "1px solid red", paddingBottom: "10px", fontSize: "18px" }}>
                    <i className="fas fa-exclamation-triangle" style={{ marginRight: "10px" }}></i>
                    {t("dangerZone")}
                </h3>

                <div style={{ display: "flex", gap: "20px" }}>
                    <button onClick={logout} style={{ ...btnStyle, background: "#555", color: "white" }}>
                        <i className="fas fa-sign-out-alt"></i> {t("logout")}
                    </button>

                    <button onClick={handleDeleteAccount} style={{ ...btnStyle, background: "red", color: "white" }}>
                        <i className="fas fa-trash"></i> {t("deleteAccount")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
