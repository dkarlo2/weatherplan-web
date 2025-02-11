import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Box, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell} from "@mui/material";
import { fetchForecast } from "./services/forecastService";
import { getWeatherIcon, getSimplifiedTempColor } from "./weatherUtils";

const hourBatch = 3;

// create a list of start and end hours based on hourBatch
const hours = Array.from({ length: 24 / hourBatch }, (_, i) => {return {start: i * hourBatch, end: (i + 1) * hourBatch}});

const DailyForecastPopup = ({ open, onClose, day, place }) => {
  const [forecastData, setForecastData] = useState(null);

  useEffect(() => {
    if (open) {
        const fetchAndSet = async () => {
            const startTime = new Date(day.date);
            startTime.setHours(0, 0, 0, 0);
            const endTime = new Date(day.date);
            endTime.setHours(24, 0, 0, 0, 0);
            const response = await fetchForecast(place.latitude, place.longitude, startTime, endTime, hourBatch);
            setForecastData(response);
        };
        fetchAndSet();
    }
  }, [open, day.date, place.latitude, place.longitude]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent align="center">
        <Box mb={2}>
          <Typography color="primary" fontSize="14px">{day.title}</Typography>
          <Typography variant="caption" fontSize="12px">{day.subtitle}</Typography>
        </Box>
        <Paper sx={{ p: 0, mb: 3 }}>
            <TableContainer component={Paper} sx={{ width: "100%", margin: 0 }}>
            <Table size="small" sx={{ width: "100%", tableLayout: "fixed" }}>
                <TableHead>
                <TableRow>
                    {forecastData ? hours.map((h, i) => (
                    <TableCell
                        key={i}
                        align="center"
                        sx={{
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            padding: "1px",
                            backgroundColor: '#eeeeee'
                        }}
                        style={{
                          width: "67px"
                        }}
                    >
                        <Typography color="#7e761b" fontSize="14px">{h.start}-{h.end}</Typography>
                        <Box>
                          {getWeatherIcon(forecastData.weatherCode[i], forecastData.isDay[i], 25)}
                        </Box>
                        <Box>
                          <Typography color={getSimplifiedTempColor(Math.round((forecastData.minTemp[i] + forecastData.maxTemp[i]) / 2))} fontSize="14px">
                            {Math.round((forecastData.minTemp[i] + forecastData.maxTemp[i]) / 2)}°C
                          </Typography>
                        </Box>
                        <Box>
                          <Typography color="primary" fontSize="12px">
                            {forecastData.totalPrecip[i]}mm
                          </Typography>
                        </Box>
                    </TableCell>
                    )) : <></>}
                </TableRow>
                </TableHead>
            </Table>
            </TableContainer>
        </Paper>
        <Box align="center" mb={2}>
          <Typography fontSize="16px">{place.name}</Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DailyForecastPopup;
