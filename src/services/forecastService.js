import axios from "axios";
import { API_BASE_URL } from "./api";

export const fetchForecast = async (latitude, longitude, startTime, endTime, batch_hours = null) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/forecast/`, {
      params: {
        latitude,
        longitude,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        batch_hours,
      }
    });
    if (response.status !== 200) {
      console.error("Error fetching forecast:", response);
      return {};
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching forecast:", error);
    return {};
  }
};
