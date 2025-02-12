import axios from "axios";
import { API_BASE_URL } from "./api";

export const fetchPlaces = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/places/`, {
      params: { query }
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
