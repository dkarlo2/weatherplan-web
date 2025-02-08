import React, { useState } from "react";
import { Container, Typography, Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RemoveIcon from "@mui/icons-material/Remove";
import { DatePicker, TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { fetchPlaces } from "./services/placesService";
import { fetchForecast } from "./services/forecastService";

const WeatherDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [places, setPlaces] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date());

  const handleSearch = async () => {
    if (searchTerm.trim() !== "") {
      const results = await fetchPlaces(searchTerm);
      setPlaces(results);
    }
  };

  const handleAddPlace = async (place) => {
    const forecast = await fetchForecast(place.latitude, place.longitude, startDateTime, endDateTime);
    setForecastData((prev) => [...prev, { ...forecast, location: place.name }]);
  };

  const handleRemovePlace = (location) => {
    setForecastData((prev) => prev.filter((data) => data.location !== location));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Typography variant="h6">Select Date and Time</Typography>
          <Box display="flex" gap={2} mt={1}>
            <DatePicker label="Start Date" value={startDateTime} onChange={setStartDateTime} />
            <TimePicker label="Start Time" value={startDateTime} onChange={setStartDateTime} />
            <DatePicker label="End Date" value={endDateTime} onChange={setEndDateTime} />
            <TimePicker label="End Time" value={endDateTime} onChange={setEndDateTime} />
          </Box>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField fullWidth placeholder="Search places" variant="outlined" size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>Forecast</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Location</TableCell>
                  <TableCell>Min Temp (°C)</TableCell>
                  <TableCell>Max Temp (°C)</TableCell>
                  <TableCell>Precip Prob (%)</TableCell>
                  <TableCell>Total Precip (mm)</TableCell>
                  <TableCell>Cloud Cover (%)</TableCell>
                  <TableCell>Wind Speed (m/s)</TableCell>
                  <TableCell>Wind Gusts (m/s)</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forecastData.map((data) => (
                  <TableRow key={data.location}>
                    <TableCell>{data.location}</TableCell>
                    <TableCell>{data.minTemp}</TableCell>
                    <TableCell>{data.maxTemp}</TableCell>
                    <TableCell>{data.precipProb}</TableCell>
                    <TableCell>{data.totalPrecip}</TableCell>
                    <TableCell>{data.cloudCover}</TableCell>
                    <TableCell>{data.windSpeed}</TableCell>
                    <TableCell>{data.windGusts}</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleRemovePlace(data.location)}>
                        <RemoveIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default WeatherDashboard;
