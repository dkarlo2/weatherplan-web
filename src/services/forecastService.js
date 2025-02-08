import axios from "axios";

const API_BASE_URL = "http://localhost:5100"; // TODO
const API_TOKEN = "test-token"; // TODO

export const fetchForecast = async (latitude, longitude, startTime, endTime) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/forecast/`, {
      params: {
        latitude,
        longitude,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      },
      headers: {
         "x-api-token": API_TOKEN,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching forecast:", error);
    return {};
  }
};
