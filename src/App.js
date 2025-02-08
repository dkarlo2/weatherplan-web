import React, { useState } from "react";
import { Container, Typography, Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RemoveIcon from "@mui/icons-material/Remove";
import { DatePicker, TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { fetchPlaces } from "./services/placesService";

const WeatherDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [places, setPlaces] = useState([]);
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date());

  const forecastData = [
    { location: "Zagreb", minTemp: 0, maxTemp: 6, precipProb: 0, totalPrecip: 0, cloudCover: 70, windSpeed: 5, windGusts: 9 },
    { location: "Rijeka", minTemp: 4, maxTemp: 10, precipProb: 30, totalPrecip: 5, cloudCover: 98, windSpeed: 6, windGusts: 12 },
    { location: "Victoria", minTemp: 27, maxTemp: 27, precipProb: 11, totalPrecip: 8, cloudCover: 70, windSpeed: 1, windGusts: 3 },
    { location: "New York", minTemp: 20, maxTemp: 29, precipProb: 0, totalPrecip: 0, cloudCover: 0, windSpeed: 3, windGusts: 6 },
  ];

  const handleSearch = async () => {
    if (searchTerm.trim() !== "") {
      const results = await fetchPlaces(searchTerm);
      setPlaces(results);
    }
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
              <Box key={place.name} sx={{ p: 1, cursor: "pointer", "&:hover": { backgroundColor: "#f0f0f0" } }}>
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
                      <IconButton color="error">
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
