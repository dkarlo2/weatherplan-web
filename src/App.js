import React, { useState, useEffect } from "react";
import { Container, Typography, Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Snackbar, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RemoveIcon from "@mui/icons-material/Remove";
import { WiDaySunny, WiDayCloudyHigh, WiDayCloudy, WiCloud, WiFog, WiRainMix, WiSleet, WiRain, WiSnow, WiShowers, WiThunderstorm, WiNightClear, WiNightAltCloudyHigh, WiNightAltCloudy } from "weather-icons-react";
import { fetchPlaces } from "./services/placesService";
import { fetchForecast } from "./services/forecastService";
import TimeSelectionPopup from "./TimeSelectionPopup";

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

  if (min === max) {
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
  const maxPrecip = 30;
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
  const maxSpeed = 20;
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

const getWeatherIcon = (weatherCode, isDay, size) => {
  // https://open-meteo.com/en/docs
  switch (weatherCode) {
    case 0:
      return isDay ? (<WiDaySunny size={size} />) : (<WiNightClear size={size} />);
    case 1:
      return isDay ? (<WiDayCloudyHigh size={size} />) : (<WiNightAltCloudyHigh size={size} />);
    case 2:
      return isDay ? (<WiDayCloudy size={size} />) : (<WiNightAltCloudy size={size} />);
    case 3:
      return (<WiCloud size={size} />);
    case 45:
    case 48:
      return (<WiFog size={size} />);
    case 51:
    case 53:
    case 55:
      return (<WiRainMix size={size} />);
    case 56:
    case 57:
      return (<WiSleet size={size} />);
    case 61:
    case 63:
    case 65:
      return (<WiRain size={size} />);
    case 66:
    case 67:
      return (<WiSleet size={size} />);
    case 71:
    case 73:
    case 75:
      return (<WiSnow size={size} />);
    case 77:
      return (<WiSnow size={size} />);
    case 80:
    case 81:
    case 82:
      return (<WiShowers size={size} />);
    case 85:
    case 86:
      return (<WiSnow size={size} />);
    case 95:
      return (<WiThunderstorm size={size} />);
    case 96:
    case 99:
      return (<WiThunderstorm size={size} />);
    default:
      return weatherCode;
  }
};

const getDateGradient = (startHour, endHour) => {
  const startPercentage = (startHour / 24) * 100;
  const endPercentage = (endHour / 24) * 100;
  return `linear-gradient(to right, white 0%, white ${startPercentage}%, #186eba ${startPercentage}%, #186eba ${endPercentage}%, white ${endPercentage}%, white 100%)`;
}

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

const placesSerVersion = 1;

const storePlaces = (places) => {
  localStorage.setItem("places", JSON.stringify({
    version: placesSerVersion,
    places: places,
  }));
};

const loadPlaces = () => {
  const data = JSON.parse(localStorage.getItem("places"));
  if (data && data.version === placesSerVersion) {
    return data.places;
  }
  return [];
};

const forecastDaysSerVersion = 1;

const storeForecastDays = (forecastDays) => {
  localStorage.setItem("forecastDays", JSON.stringify({
    version: forecastDaysSerVersion,
    forecastDays: forecastDays,
  }));
};

const loadForecastDays = () => {
  const storedData = JSON.parse(localStorage.getItem("forecastDays"));
  const storedForecastDays = storedData && storedData.version === forecastDaysSerVersion ? storedData.forecastDays : [];
  const nDays = 10;
  const days = [];
  for (let i = 0; i < nDays; i++) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + i);
    const dayTitle = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString("en-US", { weekday: "long" });
    const storedDay = storedForecastDays.find((d) => d.date === date.toISOString());
    console.log(storedDay);
    days.push({
      key: i,
      title: dayTitle,
      subtitle: formatDate(date),
      date: date,
      selected: storedForecastDays.length > 0 ? storedDay.selected : i === 0,
      startHour: storedForecastDays.length > 0 && storedDay.selected ? storedDay?.startHour || 0 : 0,
      endHour: storedForecastDays.length > 0 && storedDay.selected ? storedDay?.endHour || 24 : 24
    });
  }
  return days;
};

const WeatherDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPlaces, setSearchPlaces] = useState([]);
  const [places, setPlaces] = useState(loadPlaces());
  const [forecastData, setForecastData] = useState([]);
  const [forecastDataRowSpan, setForecastDataRowSpan] = useState(1);
  const [forecastDays, setForecastDays] = useState(loadForecastDays());
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    storePlaces(places);
  }, [places]);

  useEffect(() => {
    storeForecastDays(forecastDays);
  }, [forecastDays]);

  useEffect(() => {
    const fetchForecasts = async () => {
      const forecastData = (await Promise.all(places.map(async (place) => await Promise.all(forecastDays.filter((day) => day.selected).map(async (day) => {
        try {
          const startDateTime = new Date(day.date);
          startDateTime.setHours(day.startHour, 0, 0, 0);
          const endDateTime = new Date(day.date);
          endDateTime.setHours(day.endHour, 0, 0, 0);
          const forecast = await fetchForecast(place.latitude, place.longitude, startDateTime, endDateTime); // TODO use cache
          return {...forecast, place: place, day: day};
        } catch (error) {
          console.log(error);
          setErrorMessage("Error loading forecast");
          return {};
        }
      }))))).flat();
      setForecastData(forecastData);
      setForecastDataRowSpan(forecastDays.filter((day) => day.selected).length);
    };
    fetchForecasts();
  }, [places, forecastDays]);

  const handleSearch = async () => {
    try {
      if (searchTerm.trim() !== "") {
        const results = await fetchPlaces(searchTerm);
        setSearchPlaces(results);
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
    if (places.some((p) => p.name === place.name)) {
      setErrorMessage("This place is already added to the forecast");
      return;
    }
    setPlaces((prev) => [...prev, place]);
  };

  const handleRemovePlace = (data) => {
    setPlaces((prev) => prev.filter((d) => d.name !== data.place.name));
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

  // TODO add weather icon (e.g. sun, cloud, rain) to the forecast table
  return (
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
          {searchPlaces.map((place) => (
            <Box key={place.name} sx={{ p: 1, cursor: "pointer", "&:hover": { backgroundColor: "#f0f0f0" } }} onClick={() => handleAddPlace(place)}>
              {place.name}
            </Box>
          ))}
        </Box>
      </Paper>

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

      <Paper sx={{ p: 0, mb: 3 }}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{backgroundColor: '#eeeeee'}}>
                <TableCell align="center" sx={{color: '#7e761b'}}>Location</TableCell>
                <TableCell align="center" sx={{color: '#7e761b', minWidth: '5rem'}}><Tooltip title="Day (selected time interval)" placement="top">Day</Tooltip></TableCell>
                <TableCell align="center" sx={{color: '#7e761b'}}>Weather</TableCell>
                <TableCell align="center" sx={{color: '#7e761b'}}><Tooltip title="Min Temp (°C)" placement="top">Low</Tooltip></TableCell>
                <TableCell align="center" sx={{color: '#7e761b'}}><Tooltip title="Max Temp (°C)" placement="top">High</Tooltip></TableCell>
                <TableCell align="center" sx={{color: '#7e761b', minWidth: '5rem'}}><Tooltip title="Total Precipitation (mm)" placement="top">Precipitation</Tooltip></TableCell>
                <TableCell align="center" sx={{color: '#7e761b', minWidth: '3rem'}}><Tooltip title="Wind speed (gusts) (m/s)" placement="top">Wind</Tooltip></TableCell>
                <TableCell align="center" sx={{color: '#7e761b'}}><Tooltip title="Sunshine (h)" placement="top">Sun</Tooltip></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forecastData.map((data, i) => (
                <>
                <TimeSelectionPopup
                  open={data.timePopupOpen}
                  onClose={() => setForecastData((prev) => prev.map((d) => ({ ...d, timePopupOpen: false })))}
                  onConfirm={(times) => {setForecastData((prev) => prev.map((d) => ({ ...d, timePopupOpen: false }))); setForecastDays((prev) => prev.map((d) => ({ ...d, startHour: d.key === data.day.key ? times.start : d.startHour, endHour: d.key === data.day.key ? times.end : d.endHour })))}}
                  day={data.day}
                />
                <TableRow key={`${data.place.name}-${data.day.key}`} sx={i < forecastData.length - 1 && forecastData[i+1].place.name !== data.place.name ? { '& td, & th': { borderBottom: '1px solid #186eba', p: 0.5 } } : {'& td, & th': { borderBottom: 0, p: 0.5 } }}>
                  {i === 0 || forecastData[i-1].place.name !== data.place.name ? (
                    <TableCell
                      align="center"
                      style={i < forecastData.length - forecastDataRowSpan  ? {borderBottom: '1px solid #186eba' } : {}}
                      rowSpan={forecastDataRowSpan}
                    >
                      {data.place.name}
                    </TableCell>)
                    : (<></>)
                  }
                  <TableCell
                    align="center"
                    onClick={() => setForecastData((prev) => prev.map((d) => ({ ...d, timePopupOpen: d.place.name === data.place.name && d.day.key === data.day.key })))}
                    sx={{
                      cursor: "pointer", // Show pointer cursor
                      "&:hover": { backgroundColor: "#eeeeee" }, // Highlight on hover
                    }}
                  >
                    <Typography color="primary" fontSize="0.75rem">
                      {data.day.title} ({data.day.startHour}-{data.day.endHour})
                    </Typography>
                    <Box
                      sx={{
                        position: 'relative',
                        bottom: 0,
                        background: getDateGradient(data.day.startHour, data.day.endHour),
                        height: '0.3rem',
                      }}
                    >
                    </Box>
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{
                      padding: 0
                    }}
                  >
                    {getWeatherIcon(data.weatherCode, data.isDay, 25)}
                  </TableCell>
                  <TableCell sx={{background: getTemperatureGradient(data.minTemp, (data.minTemp + data.maxTemp) / 2)}} align="center">{data.minTemp}</TableCell>
                  <TableCell sx={{background: getTemperatureGradient((data.minTemp + data.maxTemp) / 2, data.maxTemp)}} align="center">{data.maxTemp}</TableCell>
                  <TableCell sx={{background: getPrecipitationGradient(data.totalPrecip)}} align="center">{data.totalPrecip} ({data.precipProb}%)</TableCell>
                  <TableCell sx={{background: getWindColor(data.windSpeed, data.windGusts)}} align="center">{data.windSpeed} ({data.windGusts})</TableCell>
                  <TableCell sx={{background: getSunshineColor(data.sunshine)}} align="center">{data.sunshine}</TableCell>
                  {i === 0 || forecastData[i-1].place.name !== data.place.name ? (<TableCell align="center" style={i < forecastData.length - forecastDataRowSpan  ? {borderBottom: '1px solid #186eba' } : {}} rowSpan={forecastDataRowSpan}>
                    <Tooltip title="Remove location" placement="top">
                      <IconButton size="small" color="error" onClick={() => handleRemovePlace(data)}>
                        <RemoveIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>) : (<></>)}
                </TableRow>
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Snackbar open={!!errorMessage} autoHideDuration={4000} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} onClose={() => setErrorMessage("")} message={errorMessage} />
    </Container>
  );
};

export default WeatherDashboard;
