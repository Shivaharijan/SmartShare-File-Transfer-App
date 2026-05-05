import { Capacitor } from "@capacitor/core";

const androidIp = "10.203.66.78"; // Wi-Fi IP of your PC for Android

// Use the real PC IP on Android device, localhost on browser
const baseUrl = Capacitor.isNativePlatform()
    ? `http://${androidIp}:5000`
    : `http://localhost:5000`;

const config = {
    API_URL: baseUrl
};

export default config;
