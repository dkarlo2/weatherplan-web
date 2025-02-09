import React, { useState, useEffect } from "react";
import { Container, Typography, Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Snackbar } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RemoveIcon from "@mui/icons-material/Remove";
import { DatePicker, TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { fetchPlaces } from "./services/placesService";
import { fetchForecast } from "./services/forecastService";

const getTomorrowAt = (hour) => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const loadStoredPeriod = () => {
  const defaultStartDateTime = getTomorrowAt(8);
  const defaultEndDateTime = getTomorrowAt(17);
  const parsedStartDate = new Date(localStorage.getItem("startDateTime") || defaultStartDateTime.toISOString());
  const parsedEndDate = new Date(localStorage.getItem("endDateTime") || defaultEndDateTime.toISOString());
  if (parsedStartDate > new Date() && parsedEndDate > new Date() && parsedEndDate > parsedStartDate) {
    return { startDateTime: parsedStartDate, endDateTime: parsedEndDate };
  }
  return { startDateTime: defaultStartDateTime, endDateTime: defaultEndDateTime };
};

const getTemperatureColor = (temp) => {
  const colors = [
    { value: -30, color: "#00008b" },  // Dark Blue (Very Cold)
    { value: -10, color: "#1e90ff" },  // Dodger Blue
    { value: 0, color: "#87ceeb" },    // Sky Blue
    { value: 10, color: "#ffff99" },   // Light Yellow
    { value: 15, color: "#ffd700" },   // Gold
    { value: 20, color: "#ffa500" },   // Orange
    { value: 25, color: "#ff4500" },   // Red-Orange
    { value: 35, color: "#8b0000" },   // Dark Red
    { value: 40, color: "#4b0000" }    // Deep Red (Extreme Heat)
  ];

  // Find the closest two colors for interpolation
  for (let i = 0; i < colors.length - 1; i++) {
    if (temp >= colors[i].value && temp <= colors[i + 1].value) {
      const ratio = (temp - colors[i].value) / (colors[i + 1].value - colors[i].value);
      return interpolateColor(colors[i].color, colors[i + 1].color, ratio);
    }
  }

  return temp < -30 ? colors[0].color : colors[colors.length - 1].color; // Out-of-range cases
};

// Function to interpolate between two colors
const interpolateColor = (color1, color2, ratio) => {
  const hexToRgb = (hex) =>
    hex.match(/\w\w/g).map((x) => parseInt(x, 16));

  const rgbToHex = (r, g, b) =>
    `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;

  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);

  return rgbToHex(r, g, b);
};

const getPrecipitationGradient = (value) => {
  const minPrecip = 0;
  const maxPrecip = 100;
  const percentage = (Math.max(minPrecip, Math.min(maxPrecip, value)) - minPrecip) / (maxPrecip - minPrecip) * 100;
  const precipColor = `color-mix(in hsl, cyan ${100 - percentage}%, blue ${percentage}%)`;
  return `linear-gradient(to top,${precipColor} 0%, transparent ${percentage}%)`;
};

const WeatherDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [places, setPlaces] = useState([]);
  const [forecastData, setForecastData] = useState(JSON.parse(localStorage.getItem("forecastData")) || []);
  const [startDateTime, setStartDateTime] = useState(loadStoredPeriod().startDateTime);
  const [endDateTime, setEndDateTime] = useState(loadStoredPeriod().endDateTime);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("forecastData", JSON.stringify(forecastData));
  }, [forecastData]);

  useEffect(() => {
    localStorage.setItem("startDateTime", startDateTime.toISOString());
    localStorage.setItem("endDateTime", endDateTime.toISOString());
  }, [startDateTime, endDateTime]);

  useEffect(() => {
    forecastData.forEach(async (data) => {
      try {
        const updatedForecast = await fetchForecast(data.latitude, data.longitude, startDateTime, endDateTime);
        setForecastData((prev) =>
          prev.map((item) => (item.location === data.location ? { ...updatedForecast, location: data.location, latitude: data.latitude, longitude: data.longitude } : item))
        );
      } catch (error) {
        setErrorMessage("Error loading forecast");
      }
    });
  }, [startDateTime, endDateTime]);

  const handleStartDateTimeChange = (newValue) => {
    newValue.setMinutes(0);
    if (newValue < new Date()) {
      newValue = new Date();
      newValue.setHours(newValue.getHours() + 1);
      newValue.setMinutes(0);
      if (newValue > endDateTime) {
        setEndDateTime(newValue);
      }
    } else if (newValue > endDateTime) {
      setEndDateTime(newValue);
    }
    setStartDateTime(newValue);
  };

  const handleEndDateTimeChange = (newValue) => {
    newValue.setMinutes(0);
    if (newValue < new Date()) {
      newValue = new Date();
      newValue.setHours(newValue.getHours() + 1);
      newValue.setMinutes(0);
      if (newValue < startDateTime) {
        setStartDateTime(newValue);
      }
    } else if (newValue <= startDateTime) {
      setStartDateTime(newValue);
    }
    setEndDateTime(newValue);
  };

  const handleSearch = async () => {
    try {
      if (searchTerm.trim() !== "") {
        const results = await fetchPlaces(searchTerm);
        setPlaces(results);
      }
    } catch (error) {
      setErrorMessage("Error performing search");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleAddPlace = async (place) => {
    if (forecastData.some((data) => data.location === place.name)) {
      setErrorMessage("This place is already added to the forecast");
      return;
    }
    try {
      const forecast = await fetchForecast(place.latitude, place.longitude, startDateTime, endDateTime);
      setForecastData((prev) => [...prev, { ...forecast, location: place.name, latitude: place.latitude, longitude: place.longitude }]);
    } catch (error) {
      setErrorMessage("Error loading forecast");
    }
  };

  const handleRemovePlace = (location) => {
    setForecastData((prev) => prev.filter((data) => data.location !== location));
  };

  const handleClearForecast = () => {
    setForecastData([]);
  };

  // TODO use DateTimeRangePicker
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box component="img" src="/title.png" sx={{width: 300}}></Box>
          <Box component="img" src="/logo.png" sx={{width: 50, height: 50}}></Box>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              fullWidth
              placeholder="Search places"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <IconButton color="primary" onClick={handleSearch}>
              <SearchIcon />
            </IconButton>
          </Box>
          <Box maxHeight={160} overflow="auto" mt={2}>
            {places.map((place) => (
              <Box key={place.name} sx={{ p: 1, cursor: "pointer", "&:hover": { backgroundColor: "#f0f0f0" } }} onClick={() => handleAddPlace(place)}>
                {place.name}
              </Box>
            ))}
          </Box>
        </Paper>

        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Box display="flex" gap={2} mt={1}>
            <DatePicker label="Start Date" value={startDateTime} onChange={handleStartDateTimeChange} disablePast />
            <TimePicker label="Start Hour" ampm={false} views={['hours']} value={startDateTime} onChange={handleStartDateTimeChange} />
            <DatePicker label="End Date" value={endDateTime} onChange={handleEndDateTimeChange} disablePast />
            <TimePicker label="End Hour" ampm={false} views={['hours']} value={endDateTime} onChange={handleEndDateTimeChange} />
          </Box>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" color="primary">Forecast</Typography>
            <Button variant="contained" color="secondary" size="small" onClick={handleClearForecast}>Clear All</Button>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Location</TableCell>
                  <TableCell>Min Temp (°C)</TableCell>
                  <TableCell>Max Temp (°C)</TableCell>
                  <TableCell>Total Precip (mm)</TableCell>
                  <TableCell>Wind Speed (m/s)</TableCell>
                  <TableCell>Wind Gusts (m/s)</TableCell>
                  <TableCell>Sunshine (h)</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forecastData.map((data) => (
                  <TableRow key={data.location}>
                    <TableCell>{data.location}</TableCell>
                    <TableCell sx={{backgroundColor: getTemperatureColor(data.minTemp)}}>{data.minTemp}</TableCell>
                    <TableCell sx={{backgroundColor: getTemperatureColor(data.maxTemp)}}>{data.maxTemp}</TableCell>
                    <TableCell sx={{background: getPrecipitationGradient(data.totalPrecip)}}>{data.totalPrecip} ({data.precipProb}%)</TableCell>
                    <TableCell>{data.windSpeed}</TableCell>
                    <TableCell>{data.windGusts}</TableCell>
                    <TableCell>{data.sunshine}</TableCell>
                    <TableCell>
                      <IconButton color="secondary" onClick={() => handleRemovePlace(data.location)}>
                        <RemoveIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <Snackbar open={!!errorMessage} autoHideDuration={4000} onClose={() => setErrorMessage("")} message={errorMessage} />
      </Container>
    </LocalizationProvider>
  );
};

export default WeatherDashboard;
