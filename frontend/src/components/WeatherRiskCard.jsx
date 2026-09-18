import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { CloudRain, Sun, Thermometer, Wind, AlertTriangle, ShieldCheck, Activity } from "lucide-react";

/**
 * WeatherRiskCard - Fetches and displays weather-related risks for a specific well.
 * @param {string} wellId - The ID of the well to check risks for.
 */
const WeatherRiskCard = ({ wellId }) => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherRisk = async () => {
      try {
        setLoading(true);
        // GET /api/maintenance/weather-risk/:wellId
        const response = await api.get(`/maintenance/weather-risk/${wellId}`);
        console.log("Weather Risk API Response:", response.data);
        setRiskData(response.data);
      } catch (err) {
        console.error("Weather Risk Fetch Error:", err);
        setError(`Unable to load weather risk data: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (wellId) {
      fetchWeatherRisk();
    }
  }, [wellId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-100 rounded"></div>
          <div className="h-8 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !riskData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">{error || "No data available"}</p>
      </div>
    );
  }

  const { weather, riskLevel, recommendation } = riskData;

  const getRiskStyles = (level) => {
    switch (level) {
      case "High":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        };
      case "Medium":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-700",
          icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        };
      default:
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-700",
          icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
        };
    }
  };

  const riskStyle = getRiskStyles(riskLevel);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center">
          <Sun className="w-4 h-4 mr-2 text-orange-500" />
          Field Weather Insights
        </h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}>
          {riskLevel} Risk
        </span>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="flex items-center">
            <Thermometer className="w-8 h-8 text-orange-400 mr-3" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Temperature</p>
              <p className="text-lg font-black text-gray-800">{weather.temp}°C</p>
            </div>
          </div>
          <div className="flex items-center">
            <CloudRain className="w-8 h-8 text-blue-400 mr-3" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Humidity</p>
              <p className="text-lg font-black text-gray-800">{weather.humidity}%</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border flex items-start gap-3 ${riskStyle.bg} ${riskStyle.border}`}>
          {riskStyle.icon}
          <div>
            <p className={`text-sm font-bold mb-1 ${riskStyle.text}`}>Risk Assessment</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {recommendation}
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400 font-medium">
          <span className="flex items-center">
            <Wind className="w-3 h-3 mr-1" /> Wind: {weather.windSpeed} km/h
          </span>
          <span className="italic uppercase">Real-time Sync</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherRiskCard;
