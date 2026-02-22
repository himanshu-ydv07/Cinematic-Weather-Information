// DOM Elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const errorMsg = document.getElementById("errorMsg");
const weatherCard = document.getElementById("weatherCard");
const bgImage = document.getElementById("bgImage");
const bgImg = document.getElementById("bgImg");
const effectsLayer = document.getElementById("effectsLayer");
const starsContainer = document.getElementById("starsContainer");

// Generate stars on load
for (let i = 0; i < 10; i++) {
  const star = document.createElement("div");
  star.className = "tiny-star";
  star.style.top = (5 + Math.random() * 30) + "%";
  star.style.left = Math.random() * 100 + "%";
  star.style.animationDelay = (Math.random() * 4) + "s";
  starsContainer.appendChild(star);
}

// Enter key triggers search
cityInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") searchWeather();
});

/* =========================
   Weather Effect Helpers
========================= */

function getEffect(id) {
  if (id >= 200 && id < 300) return "thunder";
  if (id >= 300 && id < 600) return "rain";
  if (id >= 600 && id < 700) return "snow";
  return null;
}

function clearEffects() {
  effectsLayer.innerHTML = "";
}

function renderRain() {
  for (let i = 0; i < 50; i++) {
    const drop = document.createElement("div");
    drop.className = "raindrop";
    drop.style.left = Math.random() * 100 + "%";
    drop.style.height = (15 + Math.random() * 20) + "px";
    drop.style.animationDelay = (Math.random() * 2) + "s";
    drop.style.animationDuration = (0.5 + Math.random() * 0.5) + "s";
    effectsLayer.appendChild(drop);
  }
}

function renderSnow() {
  for (let i = 0; i < 35; i++) {
    const flake = document.createElement("div");
    flake.className = "snowflake";
    flake.style.left = Math.random() * 100 + "%";
    const size = (4 + Math.random() * 5) + "px";
    flake.style.width = size;
    flake.style.height = size;
    flake.style.animationDelay = (Math.random() * 5) + "s";
    flake.style.animationDuration = (3 + Math.random() * 4) + "s";
    effectsLayer.appendChild(flake);
  }
}

function renderLightning() {
  const flash = document.createElement("div");
  flash.className = "lightning-flash";
  effectsLayer.appendChild(flash);
}

/* =========================
   Main Search Function
========================= */

async function searchWeather() {
  const city = cityInput.value.trim();
  if (!city) return;

  searchBtn.innerHTML = '<div class="spinner"></div>';
  searchBtn.disabled = true;
  errorMsg.style.display = "none";
  weatherCard.style.display = "none";
  bgImage.classList.remove("visible");

  try {
    // 🔹 Fetch weather from YOUR backend
    const res = await fetch(
      `http://localhost:5000/api/weather?city=${encodeURIComponent(city)}`
    );

    const d = await res.json();

    if (!res.ok) {
      throw new Error(d.error || "Failed to fetch weather");
    }

    if (!d.weather || !d.weather.length) {
      throw new Error("Weather data missing");
    }

    // Update weather card
    document.getElementById("cityName").textContent = d.name;
    document.getElementById("weatherDesc").textContent =
      d.weather[0].description;
    document.getElementById("weatherIcon").src =
      `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`;
    document.getElementById("weatherIcon").alt = d.weather[0].main;
    document.getElementById("tempValue").textContent =
      Math.round(d.main.temp) + "°";
    document.getElementById("feelsLike").textContent =
      Math.round(d.main.temp) + "°C";
    document.getElementById("humidity").textContent =
      d.main.humidity + "%";
    document.getElementById("windSpeed").textContent =
      Math.round(d.wind.speed * 3.6) + " km/h";

    weatherCard.style.display = "block";

    // Weather effects
    clearEffects();
    const effect = getEffect(d.weather[0].id);
    if (effect === "rain" || effect === "thunder") renderRain();
    if (effect === "thunder") renderLightning();
    if (effect === "snow") renderSnow();

    // 🔹 Fetch background from backend
    const bgRes = await fetch(
      `http://localhost:5000/api/background?city=${encodeURIComponent(d.name)}`
    );

    const bgData = await bgRes.json();

    if (bgData.results && bgData.results.length) {
      bgImg.src = bgData.results[0].urls.regular;
      bgImg.onload = function () {
        bgImage.classList.add("visible");
      };
    }

  } catch (e) {
    errorMsg.textContent = e.message;
    errorMsg.style.display = "block";
    clearEffects();
  } finally {
    searchBtn.innerHTML = "🔍";
    searchBtn.disabled = false;
  }
}