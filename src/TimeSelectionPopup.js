import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Box, Typography } from "@mui/material";
import NumberPicker from "./NumberPicker";

const TimeSelectionPopup = ({ open, onClose, day }) => {
  const [start, setStart] = useState(day.startHour);
  const [end, setEnd] = useState(day.endHour);

  useEffect(() => {
    if (open) {
        setStart(day.startHour);
        setEnd(day.endHour);
    }
  }, [day.startHour, day.endHour, open]);

  return (
    <Dialog open={open} onClose={() => onClose({start, end})} maxWidth="sm">
      <DialogContent align="center">
        <Box>
          <Typography color="primary" fontSize="14px">{day.title}</Typography>
          <Typography variant="caption" fontSize="12px">{day.subtitle}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-around" alignItems="center">
          <NumberPicker open={open} min={0} max={end - 1} selected={start} setSelected={(value) => setStart(value)} />
          <Typography variant="h6" color="primary" sx={{padding: 4}}>-</Typography>
          <NumberPicker open={open} min={start + 1} max={24} selected={end} setSelected={(value) => setEnd(value)} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TimeSelectionPopup;
