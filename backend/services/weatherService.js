import axios from "axios";

export const checkRainfall = async (lat, lng) => {
  try {
    // We use Open-Meteo free API to fetch current weather and today's precipitation
    const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: lat,
        longitude: lng,
        current: "temperature_2m,relative_humidity_2m,wind_speed_10m",
        daily: "precipitation_sum",
        timezone: "auto",
        forecast_days: 1
      },
    });

    const precipitations = response.data.daily?.precipitation_sum;
    const todayPrecipitation = (precipitations && precipitations.length > 0) ? precipitations[0] : 0;
    const current = response.data.current || {};

    return {
      heavyRainfall: todayPrecipitation > 10,
      precipitation: todayPrecipitation,
      temp: current.temperature_2m ?? 28,
      humidity: current.relative_humidity_2m ?? 65,
      windSpeed: current.wind_speed_10m ?? 12
    };
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    // Return safe fallbacks instead of crashing
    return {
      heavyRainfall: false,
      precipitation: 0,
      temp: 28,
      humidity: 65,
      windSpeed: 10
    };
  }
};