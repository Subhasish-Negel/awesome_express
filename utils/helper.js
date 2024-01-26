import { supportedMimes } from "../config/filesystem.js";
import { v4 as uuidv4 } from "uuid";

export const bytesToMB = (bytes) => {
  return bytes / (1024 * 1024);
};

export const imageValidator = (size, mime) => {
  if (bytesToMB(size) > 2) {
    return "Image size must me under 2 MB";
  } else if (!supportedMimes.includes(mime)) {
    return "Image must be the type of png, jpg, jpeg, svg, webp";
  }

  return null;
};

export const generateRandomNum = () => {
  return uuidv4();
};
