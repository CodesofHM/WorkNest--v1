import { getAuth } from "firebase/auth";

const API_URL = "http://localhost:5000";

export const uploadFile = async (file) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be logged in to upload files.");
  }

  const token = await user.getIdToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  // 💡 START OF CHANGE
  if (!response.ok) {
    // Try to parse the error response from the server
    const errorData = await response.json();
    // Throw an error with the specific message from the server
    throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
  }
  // 💡 END OF CHANGE

  return response.json();
};