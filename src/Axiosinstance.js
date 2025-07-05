import axios from "axios";
import CryptoJS from "crypto-js";

const SECRET_KEY = "qwertyuiop";

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    // Check if the decrypted data is valid JSON
    if (!decryptedData) {
      throw new Error(
        "Decryption failed. Data may be corrupted or tampered with."
      );
    }

    return JSON.parse(decryptedData);
  } catch (error) {
    console.error("Error during decryption:", error.message);
    return null;
  }
};

const instance = axios.create({
  // baseURL: "https://zsrddfl2-8081.inc1.devtunnels.ms/",

  // baseURL: "https://w0vhrv2j-8081.inc1.devtunnels.ms/",
    baseURL: "https://zsrddfl2-8081.inc1.devtunnels.ms/",
  withCredentials: true,
  headers: {
    "Content-type": "application/json",
  },

});

export default instance;

export const logout = async () => {
  try {
    await instance.post("/auth/logout");
    sessionStorage.clear();
    console.log("Logged out successfully");
    document.title = "LIDER-ERP";
  } catch (error) {
    console.error("Logout failed:", error.response?.data || error.message);
  }
};

export function removeBracketedText(input) {
  if (!input) {
    return input;
  }
  return input.replace(/\s*\(.*?\)\s*/g, "");
}

export const formatType = (type) => {
  return type
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const renderDoc = (url) => {
  if (url.endsWith(".doc") || url.endsWith(".docx")) {
    window.open(
      `https://docs.google.com/viewer?url=${url}&embedded=true`,
      "_blank"
    );
  } else {
    window.open(url, "_blank");
  }
};
