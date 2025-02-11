import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogActions, Button, Box, Slider, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell} from "@mui/material";
import { fetchForecast } from "./services/forecastService";
import { getWeatherIcon, getSimplifiedTempColor } from "./weatherUtils";

const hourBatch = 3;

// create a list of start and end hours based on hourBatch
const hours = Array.from({ length: 24 / hourBatch }, (_, i) => {return {start: i * hourBatch, end: (i + 1) * hourBatch}});

const TimeSelectionPopup = ({ open, onClose, onConfirm, day, place }) => {
  const [timeRange, setTimeRange] = useState([day.startHour, day.endHour]);
  const [forecastData, setForecastData] = useState(null);

  useEffect(() => {
    if (open) {
        setTimeRange([day.startHour, day.endHour]);
    }
  }, [day.startHour, day.endHour, open]);

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

  const handleSliderChange = (event, newValue) => {
    setTimeRange(newValue);
  };

  const handleConfirm = () => {
    if (timeRange[0] >= timeRange[1]) {
      return;
    }
    onConfirm({ start: timeRange[0], end: timeRange[1] });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent align="center">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography fontSize="16px">{place.name}</Typography>
          <Box sx={{minWidth: "80px"}}>
            <Typography color="primary" fontSize="14px">{day.title}</Typography>
            <Typography variant="caption" fontSize="12px">{day.subtitle}</Typography>
          </Box>
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

        <Typography color="primary" fontSize="14px">Day summary: {timeRange[0]}-{timeRange[1]}</Typography>
        <Box mt={1}>
          <Slider
            value={timeRange}
            onChange={handleSliderChange}
            valueLabelDisplay="auto"
            min={0}
            max={24}
            step={1}
            marks={[
              { value: 0, label: "0" },
              { value: 6, label: "6" },
              { value: 12, label: "12" },
              { value: 18, label: "18" },
              { value: 24, label: "24" }
            ]}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleConfirm} color="primary" variant="contained">Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeSelectionPopup;
