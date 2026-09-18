import axios from "axios";

const API_URL = "http://localhost:5000/api/reports";

// Get token from localStorage (if you store login token)
const getToken = () => {
  return localStorage.getItem("token");
};

// Get all reports
export const getReports = async () => {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data;
};