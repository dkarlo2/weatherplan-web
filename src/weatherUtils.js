import { WiDaySunny, WiDayCloudy, WiCloud, WiFog, WiRain, WiSnow, WiThunderstorm, WiNightClear, WiNightAltCloudy, WiDayRain, WiDaySnow } from "weather-icons-react";

const sanitizeRain = (totalPrecip, sunshine, size) => {
  if (totalPrecip === 0) {
    if (sunshine === 0) {
      return (<WiCloud size={size} />);
    } else {
      return (<WiDayCloudy size={size} />);
    }
  }
  if (sunshine === 0) {
    return (<WiRain size={size} />);
  } else {
    return (<WiDayRain size={size} />);
  }
}

const sanitizeSnow = (totalPrecip, sunshine, size) => {
  if (totalPrecip === 0) {
    if (sunshine === 0) {
      return (<WiCloud size={size} />);
    } else {
      return (<WiDayCloudy size={size} />);
    }
  }
  if (sunshine === 0) {
    return (<WiSnow size={size} />);
  } else {
    return (<WiDaySnow size={size} />);
  }
}

const sanitizeCloudy = (totalPrecip, sunshine, size) => {
  return sanitizeRain(totalPrecip, sunshine, size);
}

const sanitizeSunny = (totalPrecip, sunshine, isDay, size) => {
  if (totalPrecip === 0) {
    if (sunshine === 0) {
      return (<WiCloud size={size} />);
    } else {
      return isDay ? (<WiDaySunny size={size} />) : (<WiNightClear size={size} />);
    }
  } else {
    return sanitizeRain(totalPrecip, sunshine, size);
  }
}

const sanitizePartlyCloudy = (totalPrecip, sunshine, isDay, size) => {
  if (totalPrecip === 0) {
    if (sunshine === 0) {
      return (<WiCloud size={size} />);
    } else {
      return isDay ? (<WiDayCloudy size={size} />) : (<WiNightAltCloudy size={size} />);
    }
  } else {
    return sanitizeRain(totalPrecip, sunshine, size);
  }
}

export const getWeatherIcon = (weatherCode, isDay, totalPrecip, sunshine, size) => {
    // https://open-meteo.com/en/docs
    switch (weatherCode) {
      case 0:
        return sanitizeSunny(totalPrecip, sunshine, isDay, size);
      case 1:
      case 2:
        return sanitizePartlyCloudy(totalPrecip, sunshine, isDay, size);
      case 3:
        return sanitizeCloudy(totalPrecip, sunshine, size);
      case 45:
      case 48:
        return (<WiFog size={size} />);
      case 51:
      case 53:
      case 55:
      case 56:
      case 57:
      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
        return sanitizeRain(totalPrecip, sunshine, size);
      case 71:
      case 73:
      case 75:
      case 77:
        return sanitizeSnow(totalPrecip, sunshine, size);
      case 80:
      case 81:
      case 82:
        return sanitizeRain(totalPrecip, sunshine, size);
      case 85:
      case 86:
        return sanitizeSnow(totalPrecip, sunshine, size);
      case 95:
      case 96:
      case 99:
        return (<WiThunderstorm size={size} />);
      default:
        return weatherCode;
    }
  };

export const temperatureColors = [
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

export const getSimplifiedTempColor = (value) => {
    if (value <= 0) {
        return "#1e90ff";
    } else {
        return "#8b0000";
    }
}

export const getTemperatureGradient = (minTemp, maxTemp) => {

  const min = Math.max(minTemp, -30);
  const max = Math.min(maxTemp, 40);

  if (min === max) {
    return getInterpolatedColor(temperatureColors, min);
  }

  let gradientColors = [];

  // Include interpolated start color
  gradientColors.push({ value: min, color: getInterpolatedColor(temperatureColors, min) });

  // Add all stops in between
  for (const stop of temperatureColors) {
      if (stop.value > min && stop.value < max) {
        gradientColors.push(stop);
      }
  }

  // Include interpolated end color
  gradientColors.push({ value: max, color: getInterpolatedColor(temperatureColors, max) });

  // Convert to gradient CSS format
  const gradientString = gradientColors.map(({ value, color }) => {
      const percentage = ((value - min) / (max - min)) * 100;
      return `${color} ${percentage.toFixed(2)}%`;
  }).join(", ");

  return `linear-gradient(to right, ${gradientString})`;
};

export function getInterpolatedColor(temperatureColors, value) {
  for (let i = 0; i < temperatureColors.length - 1; i++) {
      const start = temperatureColors[i];
      const end = temperatureColors[i + 1];

      if (value >= start.value && value <= end.value) {
          const ratio = (value - start.value) / (end.value - start.value);
          return interpolateColor(start.color, end.color, ratio);
      }
  }
  return temperatureColors[temperatureColors.length - 1].color; // Default fallback
}

// Function to interpolate between two colors
export const interpolateColor = (color1, color2, ratio) => {
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

export const getPrecipitationGradient = (value) => {
  const precipColor = getPrecipitationColor(value);
  const percentage = getPrecipitationPercentage(value);
  const percentageExp = Math.pow(percentage / 100, 0.6) * 100;
  return `linear-gradient(to top,${precipColor} 0%, transparent ${percentageExp}%)`;
};

export const getPrecipitationPercentage = (value) => {
  const minPrecip = 0;
  const maxPrecip = 30;
  return (Math.max(minPrecip, Math.min(maxPrecip, value)) - minPrecip) / (maxPrecip - minPrecip) * 100;
}

export const getPrecipitationColor = (value) => {
  const percentage = getPrecipitationPercentage(value);
  return `color-mix(in hsl, cyan ${100 - percentage}%, #0571f5 ${percentage}%)`;
}

export const getWindColor = (speed, gust) => {
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

export const getSunshineColor = (hours) => {
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
