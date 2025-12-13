import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${API_BASE}/api/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data;
};

export const uploadLogo = async (file) => {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await axios.post(`${API_BASE}/api/upload-logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data;
};

export const analyzeImage = async (filename) => {
  const response = await axios.post(`${API_BASE}/api/analyze-image`, {
    image_filename: filename
  });

  return response.data;
};

export const generateLayout = async (payload) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/generate-layout`,
      payload
    );
    return response.data;
  } catch (err) {
    // 🔑 VERY IMPORTANT: return backend JSON even on 400
    if (err.response && err.response.data) {
      return err.response.data;
    }
    throw err;
  }
};

// ---------- Color Palette APIs ----------

export const getFrequentPalettes = async () => {
  const response = await axios.get(`${API_BASE}/api/palettes/frequent`);
  return response.data;
};


