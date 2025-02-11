import axios from "axios";

const API_BASE_URL = "http://192.168.1.188:5100"; // TODO
const API_TOKEN = "test-token"; // TODO

export const fetchPlaces = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/places/`, {
      params: { query },
      headers: {
        "x-api-token": API_TOKEN,
      },
    });
    if (response.status !== 200) {
      console.error("Error fetching places:", response);
      return [];
    }
    return response.data; // Expected format: [{ name, latitude, longitude }, ...]
  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
};
