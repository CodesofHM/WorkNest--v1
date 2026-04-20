import { getAuth } from "firebase/auth";

const API_URL = "http://localhost:5000";

export const uploadFile = async (file) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be logged in to upload files.");
  }

  // Validate file before uploading
  if (!file) {
    throw new Error("No file selected.");
  }

  if (file.size > 1024 * 1024) {
    throw new Error("File size exceeds 1MB limit.");
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    throw new Error("Only JPG and PNG files are allowed.");
  }

  const token = await user.getIdToken();
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      // Try to parse the error response from the server
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `Upload failed with status: ${response.status}` };
      }
      
      throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // Re-throw the error with context
    if (error instanceof TypeError) {
      throw new Error(`Network error: ${error.message}. Make sure the server is running at ${API_URL}`);
    }
    throw error;
  }
};