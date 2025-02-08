import axios from "axios";

const API_BASE_URL = "http://localhost:5100"; // TODO
const API_TOKEN = "test-token"; // TODO

export const fetchPlaces = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/places/`, {
      params: { query },
      headers: {
        "x-api-token": API_TOKEN,
      },
    });
    return response.data; // Expected format: [{ name, latitude, longitude }, ...]
  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
};
