import React, { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";

const NumberPicker = ({ open, min = 0, max = 24, selected, setSelected }) => {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef) {
        listRef.current.scrollTop = numbers.indexOf(selected) * 43 + 20;
    }
  }, [open, min, max]);

  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const handleScroll = () => {
    const index = Math.round((listRef.current.scrollTop - 20) / 43);
    setSelected(numbers[index]);
  };

  return (
    <Box
      ref={listRef}
      onScroll={handleScroll}
      sx={{
        width: "100px",
        height: "80px",
        overflowY: "auto",
        border: "2px solid gray",
        borderRadius: "10px",
        textAlign: "center",
        scrollSnapType: "y mandatory",
        overscrollBehavior: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {numbers.map((num, i) => (
        <Typography
          key={num}
          onClick={() => setSelected(num)}
          sx={{
            padding: "10px",
            cursor: "pointer",
            scrollSnapAlign: "center",
            transition: "background 0.3s ease",
            color: "#186eba",
            paddingBottom: i === numbers.length - 1 ? "28px" : "10px",
            paddingTop: i === 0 ? "28px" : "10px",
          }}
        >
          {num}
        </Typography>
      ))}
    </Box>
  );
};

export default NumberPicker;
