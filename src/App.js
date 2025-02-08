import React, { useState } from "react";
import { Container, Typography, Box, Button, Checkbox, FormControlLabel, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const WeatherDashboard = () => {
  const [selectedPlaces, setSelectedPlaces] = useState([
    "Rogla",
    "Krvavec",
    "Kranjska gora",
    "New York",
  ]);

  const places = [
    "Rogla",
    "Krvavec",
    "Golte",
    "Kranjska gora",
  ];

  const previousSearches = ["New York"];

  const forecastData = [
    { location: "Zagreb", minTemp: 0, maxTemp: 6, precipProb: 0, totalPrecip: 0, cloudCover: 70, windSpeed: 5, windGusts: 9 },
    { location: "Rijeka", minTemp: 4, maxTemp: 10, precipProb: 30, totalPrecip: 5, cloudCover: 98, windSpeed: 6, windGusts: 12 },
    { location: "Victoria", minTemp: 27, maxTemp: 27, precipProb: 11, totalPrecip: 8, cloudCover: 70, windSpeed: 1, windGusts: 3 },
    { location: "New York", minTemp: 20, maxTemp: 29, precipProb: 0, totalPrecip: 0, cloudCover: 0, windSpeed: 3, windGusts: 6 },
  ];

  const togglePlace = (place) => {
    setSelectedPlaces((prev) =>
      prev.includes(place)
        ? prev.filter((p) => p !== place)
        : [...prev, place]
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">February 7th 2025, 08:00-16:00</Typography>
        <Button variant="contained">+</Button>
      </Box>

      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>Places</Typography>
          <TextField fullWidth placeholder="Skiing in Slovenia" variant="outlined" size="small" margin="dense" />
          <Box maxHeight={160} overflow="auto">
            {places.map((place) => (
              <FormControlLabel
                key={place}
                control={<Checkbox checked={selectedPlaces.includes(place)} onChange={() => togglePlace(place)} />}
                label={place}
              />
            ))}
          </Box>
          <Typography variant="subtitle1" mt={2}>Previous Searches</Typography>
          {previousSearches.map((place) => (
            <FormControlLabel
              key={place}
              control={<Checkbox checked={selectedPlaces.includes(place)} onChange={() => togglePlace(place)} />}
              label={place}
            />
          ))}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
      
      <Box textAlign="center" mt={4}>
        <Button variant="contained">Open Map</Button>
      </Box>
    </Container>
  );
};

export default WeatherDashboard;
