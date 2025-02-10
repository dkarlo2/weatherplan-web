import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Slider, Typography } from "@mui/material";

const TimeSelectionPopup = ({ open, onClose, onConfirm, day }) => {
  const [timeRange, setTimeRange] = useState([day.startHour, day.endHour]);

  useEffect(() => {
    setTimeRange([day.startHour, day.endHour]);
  }, [day.startHour, day.endHour]);

  const handleSliderChange = (event, newValue) => {
    setTimeRange(newValue);
  };

  const handleConfirm = () => {
    onConfirm({ start: timeRange[0], end: timeRange[1] });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent align="center">
        <Typography color="primary" fontSize="0.9rem">{day.title}</Typography>
        <Typography variant="caption" fontSize="0.75rem">{day.subtitle}</Typography>
        <Typography color="primary" fontSize="0.9rem">{timeRange[0]}-{timeRange[1]}</Typography>
        <Box mt={1}>
          <Slider
            value={timeRange}
            onChange={handleSliderChange}
            valueLabelDisplay="auto"
            min={0}
            max={24}
            step={1}
            marks={[
              { value: 0, label: "0:00" },
              { value: 6, label: "6:00" },
              { value: 12, label: "12:00" },
              { value: 18, label: "18:00" },
              { value: 24, label: "24:00" }
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
