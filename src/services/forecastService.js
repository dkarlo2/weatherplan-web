import axios from "axios";
import { API_BASE_URL } from "./api";

export const fetchGroupForecast = async (groupForecastInput) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/forecast/group`, groupForecastInput);
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
