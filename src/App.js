import React, { useState, useEffect, use } from "react";
import { Container, Typography, Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Snackbar, Tooltip } from "@mui/material";
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

const getTemperatureGradient = (minTemp, maxTemp) => {
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

  const min = Math.max(minTemp, -30);
  const max = Math.min(maxTemp, 40);

  if (min == max) {
    return getInterpolatedColor(colors, min);
  }

  let gradientColors = [];

  // Include interpolated start color
  gradientColors.push({ value: min, color: getInterpolatedColor(colors, min) });

  // Add all stops in between
  for (const stop of colors) {
      if (stop.value > min && stop.value < max) {
        gradientColors.push(stop);
      }
  }

  // Include interpolated end color
  gradientColors.push({ value: max, color: getInterpolatedColor(colors, max) });

  // Convert to gradient CSS format
  const gradientString = gradientColors.map(({ value, color }) => {
      const percentage = ((value - min) / (max - min)) * 100;
      return `${color} ${percentage.toFixed(2)}%`;
  }).join(", ");

  return `linear-gradient(to right, ${gradientString})`;
};

function getInterpolatedColor(colors, value) {
  for (let i = 0; i < colors.length - 1; i++) {
      const start = colors[i];
      const end = colors[i + 1];

      if (value >= start.value && value <= end.value) {
          const ratio = (value - start.value) / (end.value - start.value);
          return interpolateColor(start.color, end.color, ratio);
      }
  }
  return colors[colors.length - 1].color; // Default fallback
}

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

const getWindColor = (speed, gust) => {
  const colors = [ // white and then 4 shades of red
    { value: 0, color: "#ffffff" },
    { value: 25, color: "#ffcccc" },
    { value: 50, color: "#ff9999" },
    { value: 75, color: "#ff3333" },
    { value: 100, color: "#ff0000" }
  ];
  const minSpeed = 0;
  const maxSpeed = 30;
  const maxGust = 50;
  const percentage = Math.max(
    (Math.max(minSpeed, Math.min(maxSpeed, speed)) - minSpeed) / (maxSpeed - minSpeed),
    (Math.max(minSpeed, Math.min(maxGust, gust)) - minSpeed) / (maxGust - minSpeed),
  ) * 100;
  // choose the closest shade (without interpolation)
  for (let i = 0; i < colors.length - 1; i++) {
    if (percentage < (colors[i].value + colors[i + 1].value) / 2) {
      return colors[i].color;
    }
  }
  return colors[colors.length - 1].color;
};

const getSunshineColor = (hours) => {
  const colors = [ // white and 4 shades of yellow
    { value: 0, color: "#ffffff" },
    { value: 25, color: "#fff5bb" },
    { value: 50, color: "#ffea77" },
    { value: 75, color: "#ffdf33" },
    { value: 100, color: "#ffd800" }
  ];
  const minHours = 0;
  const maxHours = 12;
  const percentage = (Math.max(minHours, Math.min(maxHours, hours)) - minHours) / (maxHours - minHours) * 100;
  // choose the closest shade (without interpolation)
  for (let i = 0; i < colors.length - 1; i++) {
    if (percentage < (colors[i].value + colors[i + 1].value) / 2) {
      return colors[i].color;
    }
  }
  return colors[colors.length - 1].color;
};

function formatDate(date) {
  const options = { month: "short", day: "numeric" };
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const [{ value: month }, , { value: day }] = formatter.formatToParts(date);

  return `${month}, ${getOrdinalSuffix(day)}`;
}

function getOrdinalSuffix(day) {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1: return `${day}st`;
    case 2: return `${day}nd`;
    case 3: return `${day}rd`;
    default: return `${day}th`;
  }
}

const createForecastDays = () => {
  const storageForecastDays = JSON.parse(localStorage.getItem("forecastDays")) || [];
  const storageDates = storageForecastDays.filter((d) => d.selected).map((d) => d.date);
  const nDays = 10;
  const days = [];
  for (let i = 0; i < nDays; i++) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + i);
    const dayTitle = i == 0 ? 'Today' : i == 1 ? 'Tomorrow' : date.toLocaleDateString("en-US", { weekday: "long" });
    days.push({
      key: i,
      title: dayTitle,
      subtitle: formatDate(date),
      date: date,
      selected: storageDates.length > 0 ? storageDates.includes(date.toISOString()) : i == 0
    });
  }
  return days;
};

const WeatherDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [places, setPlaces] = useState([]);
  const [forecastData, setForecastData] = useState(JSON.parse(localStorage.getItem("forecastData")) || []);
  const [startDateTime, setStartDateTime] = useState(loadStoredPeriod().startDateTime);
  const [endDateTime, setEndDateTime] = useState(loadStoredPeriod().endDateTime);
  const [forecastDays, setForecastDays] = useState(createForecastDays());
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("forecastData", JSON.stringify(forecastData));
  }, [forecastData]);

  useEffect(() => {
    localStorage.setItem("startDateTime", startDateTime.toISOString());
    localStorage.setItem("endDateTime", endDateTime.toISOString());
  }, [startDateTime, endDateTime]);

  useEffect(() => {
    localStorage.setItem("forecastDays", JSON.stringify(forecastDays));
  }, [forecastDays]);

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

  const handleSelectDay = (day) => {
    setForecastDays((prev) => {
      if (day.selected) {
        return prev.map((d) => ({ ...d, selected: d.key === day.key }));
      }
      prev = prev.map((d) => ({ ...d, selected: d.key === day.key ? !d.selected : d.selected }));
      const minSelectedDate = prev.reduce((min, d) => (d.selected && (!min || d.date < min) ? d.date : min), null);
      const maxSelectedDate = prev.reduce((max, d) => (d.selected && (!max || d.date > max) ? d.date : max), null);
      return prev.map((d) => ({ ...d, selected: d.date >= minSelectedDate && d.date <= maxSelectedDate }));
    });
  };

  // TODO select coming days (up to 10 days in future) instead of date-time range. show per day forecast in the table (each row one day). allow setting time range for each day?
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

        <Paper sx={{ p: 0, mb: 3 }}>
          <TableContainer component={Paper} sx={{ width: "100%", overflow: "hidden", margin: 0 }}>
            <Table size="small" sx={{ width: "100%", tableLayout: "fixed" }}>
              <TableHead>
                <TableRow>
                  {forecastDays.map((day) => (
                    <TableCell
                      key={day.key}
                      align="center"
                      onClick={() => handleSelectDay(day)}
                      sx={{
                        cursor: "pointer", // Show pointer cursor
                        backgroundColor: day.selected ? "#c9bb2b" : "transparent",
                        "&:hover": { backgroundColor: "#c9bb2b" }, // Highlight on hover
                        transition: "background-color 0.3s",
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                        padding: "1px",
                        minWidth: "auto", // Prevent extra spacing
                      }}
                    >
                      <Typography color="primary" fontSize="0.9rem">{day.title}</Typography>
                      <Typography variant="caption" fontSize="0.75rem">{day.subtitle}</Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" color="primary">Forecast</Typography>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Location</TableCell>
                  <TableCell align="center"><Tooltip title="Min Temp (°C)" placement="top">Low</Tooltip></TableCell>
                  <TableCell align="center"><Tooltip title="Max Temp (°C)" placement="top">High</Tooltip></TableCell>
                  <TableCell align="center"><Tooltip title="Total Precipitation (mm)" placement="top">Rain</Tooltip></TableCell>
                  <TableCell align="center"><Tooltip title="Wind speed (gusts) (m/s)" placement="top">Wind</Tooltip></TableCell>
                  <TableCell align="center"><Tooltip title="Sunshine (h)" placement="top">Sun</Tooltip></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forecastData.map((data, i) => (
                  <TableRow key={data.location} sx={i < forecastData.length - 1 ? { '& td, & th': { borderBottom: '1px solid #186eba' } } : {}}>
                    <TableCell sx={{fontWeight: 700}}>{data.location}</TableCell>
                    <TableCell sx={{background: getTemperatureGradient(data.minTemp, (data.minTemp + data.maxTemp) / 2)}} align="center">{data.minTemp}</TableCell>
                    <TableCell sx={{background: getTemperatureGradient((data.minTemp + data.maxTemp) / 2, data.maxTemp)}} align="center">{data.maxTemp}</TableCell>
                    <TableCell sx={{background: getPrecipitationGradient(data.totalPrecip)}} align="center">{data.totalPrecip} ({data.precipProb}%)</TableCell>
                    <TableCell sx={{background: getWindColor(data.windSpeed, data.windGusts)}} align="center">{data.windSpeed} ({data.windGusts})</TableCell>
                    <TableCell sx={{background: getSunshineColor(data.sunshine)}} align="center">{data.sunshine}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleRemovePlace(data.location)}>
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
