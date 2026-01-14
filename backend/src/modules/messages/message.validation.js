import { FILE_MIME_TYPES, IMAGE_MIME_TYPES, MESSAGE_LIMITS } from "./message.constants.js";

export const validateMessagePayload = ({ type, content, fileInfo }) => {
  switch (type) {
    case "text":
      if (!content || !content.trim()) {
        throw new Error("Text message cannot be empty");
      }
      if (content.length > MESSAGE_LIMITS.text) {
        throw new Error("Text message too long");
      }
      break;

    case "emoji":
      if (!content || content.length > MESSAGE_LIMITS.emoji) {
        throw new Error("Invalid emoji message");
      }
      break;

    case "image":
      if (!fileInfo) {
        throw new Error("Image file is required");
      }
      if (!IMAGE_MIME_TYPES.includes(fileInfo.mimeType)) {
        throw new Error("Invalid image type");
      }
      if (fileInfo.size > MESSAGE_LIMITS.image) {
        throw new Error("Image file too large");
      }
      break;

    case "file":
      if (!fileInfo) {
        throw new Error("File is required");
      }
      if (!FILE_MIME_TYPES.includes(fileInfo.mimeType)) {
        throw new Error("Invalid file type");
      }
      if (fileInfo.size > MESSAGE_LIMITS.file) {
        throw new Error("File too large");
      }
      break;

    default:
      throw new Error("Unsupported message type");
  }
};
