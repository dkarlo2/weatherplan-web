import axios from "axios";

const API_BASE_URL = "http://192.168.1.188:5100"; // TODO
const API_TOKEN = "test-token"; // TODO

export const fetchForecast = async (latitude, longitude, startTime, endTime, batch_hours = null) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/forecast/`, {
      params: {
        latitude,
        longitude,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        batch_hours,
      },
      headers: {
         "x-api-token": API_TOKEN,
      },
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
