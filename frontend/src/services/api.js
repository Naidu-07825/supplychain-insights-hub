import axios from "axios";

const API = axios.create({
  baseURL: "https://supplychain-insights-hub.onrender.com",
});

export default API;