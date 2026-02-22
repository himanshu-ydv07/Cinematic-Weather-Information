
require("dotenv").config();

console.log("Loaded Weather Key:", process.env.OPENWEATHER_API_KEY);

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* =========================
   WEATHER ROUTE
========================= */
app.get("/api/weather", async (req, res) => {
  try {
    const city = req.query.city;

    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    const weatherRes = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          units: "metric",
          appid: process.env.OPENWEATHER_API_KEY,
        },
      }
    );

    res.json(weatherRes.data);

  } catch (err) {
    console.log("OpenWeather error:", err.response?.data);

    res.status(400).json({
      error: err.response?.data?.message || "Failed to fetch weather",
    });
  }
});

/* =========================
   BACKGROUND ROUTE
========================= */
app.get("/api/background", async (req, res) => {
  try {
    const city = req.query.city;

    const bgRes = await axios.get(
      "https://api.unsplash.com/search/photos",
      {
        params: {
          query: `${city} city skyline`,
          per_page: 1,
          orientation: "landscape",
        },
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    res.json(bgRes.data);

  } catch (err) {
    console.log("Unsplash error:", err.response?.data);

    res.status(500).json({
      error: "Failed to fetch background image",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});