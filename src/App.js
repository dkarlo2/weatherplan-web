import React, { useState, useEffect } from "react";
import { Container, Typography, Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Snackbar, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RemoveIcon from "@mui/icons-material/Remove";
import { fetchPlaces } from "./services/placesService";
import { fetchForecast } from "./services/forecastService";
import TimeSelectionPopup from "./TimeSelectionPopup";
import { getWeatherIcon, getTemperatureGradient, getPrecipitationGradient, getSunshineColor, getWindColor } from "./weatherUtils";

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
    days.push({
      key: i,
      title: dayTitle,
      subtitle: formatDate(date),
      date: date,
      selected: storedForecastDays.length > 0 ? storedDay?.selected : i === 0,
      startHour: storedForecastDays.length > 0 && storedDay?.selected ? storedDay?.startHour || 0 : 0,
      endHour: storedForecastDays.length > 0 && storedDay?.selected ? storedDay?.endHour || 24 : 24
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
                <TableCell align="center" sx={{color: '#7e761b'}}><Tooltip title="Median weather conditioons" placement="top">Weather</Tooltip></TableCell>
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
                  <TableRow key={`${data.place.name}-${data.day.key}`} sx={i < forecastData.length - 1 && forecastData[i+1].place.name !== data.place.name ? { '& td, & th': { borderBottom: '1px solid #186eba', p: 0.5 } } : {'& td, & th': { borderBottom: 0, p: 0.5 } }}>
                    <TimeSelectionPopup
                      open={data.timePopupOpen}
                      onClose={() => setForecastData((prev) => prev.map((d) => ({ ...d, timePopupOpen: false })))}
                      onConfirm={(times) => {setForecastData((prev) => prev.map((d) => ({ ...d, timePopupOpen: false }))); setForecastDays((prev) => prev.map((d) => ({ ...d, startHour: d.key === data.day.key ? times.start : d.startHour, endHour: d.key === data.day.key ? times.end : d.endHour })))}}
                      day={data.day}
                      place={data.place}
                  />
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
                    <Tooltip title="Remove location" placement="right">
                      <IconButton size="small" color="error" onClick={() => handleRemovePlace(data)}>
                        <RemoveIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>) : (<></>)}
                </TableRow>
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
