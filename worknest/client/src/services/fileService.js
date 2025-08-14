// File: worknest/client/src/services/fileService.js

const API_URL = 'http://localhost:5000'; // Your server URL

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file); // 'file' must match the key on your server's multer middleware

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data; // This should return { message: '...', url: '...' }
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error; // Re-throw the error to be caught by the component
  }
};