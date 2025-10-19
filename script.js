const apiKey = "e0aeb5504ac946aeb5455620251710";
const baseUrl = "http://api.weatherapi.com/v1";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherInfo = document.getElementById("weatherInfo");
const details = document.getElementById("details");
const forecast = document.getElementById("forecast");
const hourlyForecast = document.getElementById("hourlyForecast");
const sunData = document.getElementById("sunData");
const loader = document.getElementById("loader");
const themeToggle = document.getElementById("themeToggle");
const unitToggle = document.getElementById("unitToggle");
const favList = document.getElementById("favList");

let isCelsius = true;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return alert("Please enter a city name!");
  getWeather(city);
});

unitToggle.addEventListener("click", () => {
  isCelsius = !isCelsius;
  unitToggle.textContent = isCelsius ? "°C / °F" : "°F / °C";
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

function setBackground(condition) {
  document.body.className = "";
  const type = condition.toLowerCase();
  if (type.includes("sun") || type.includes("clear")) document.body.classList.add("sunny");
  else if (type.includes("rain")) document.body.classList.add("rainy");
  else if (type.includes("thunder")) document.body.classList.add("thunder");
  else if (type.includes("snow")) document.body.classList.add("snowy");
  else document.body.classList.add("cloudy");
}

async function getWeather(city) {
  try {
    loader.classList.remove("hidden");
    const res = await fetch(`${baseUrl}/forecast.json?key=${apiKey}&q=${city}&days=5&aqi=yes&alerts=no`);
    const data = await res.json();
    loader.classList.add("hidden");

    if (data.error) {
      weatherInfo.innerHTML = `<p>City not found. Try again.</p>`;
      return;
    }

    renderWeather(data);
    setBackground(data.current.condition.text);
    updateFavorites(city);
  } catch (error) {
    loader.classList.add("hidden");
    weatherInfo.innerHTML = `<p>Error fetching data.</p>`;
  }
}

function renderWeather(data) {
  const temp = isCelsius ? `${data.current.temp_c}°C` : `${data.current.temp_f}°F`;
  weatherInfo.innerHTML = `
    <img src="https:${data.current.condition.icon}" alt="Weather Icon">
    <h2>${data.location.name}, ${data.location.country}</h2>
    <p><strong>${temp}</strong> - ${data.current.condition.text}</p>
  `;

  details.innerHTML = `
    <div class="detail-card"><i class="fa-solid fa-temperature-high"></i> Feels: ${isCelsius ? data.current.feelslike_c : data.current.feelslike_f}°</div>
    <div class="detail-card"><i class="fa-solid fa-droplet"></i> Humidity: ${data.current.humidity}%</div>
    <div class="detail-card"><i class="fa-solid fa-wind"></i>Wind: ${data.current.wind_kph} km/h</div>
    <div class="detail-card"><i class="fa-solid fa-chart-simple"></i> Pressure: ${data.current.pressure_mb} mb</div>
  `;

  sunData.innerHTML = `
    <p>🌅 Sunrise: ${data.forecast.forecastday[0].astro.sunrise}</p>
    <p>🌇 Sunset: ${data.forecast.forecastday[0].astro.sunset}</p>
  `;

  // Hourly Forecast
 hourlyForecast.innerHTML = data.forecast.forecastday[0].hour
  .slice(0, 6)
  .map(
      (hour) => `
      <div class="hourly-card">
        <p>${hour.time.split(" ")[1]}</p>
        <img src="https:${hour.condition.icon}" width="40">
        <p>${isCelsius ? hour.temp_c : hour.temp_f}°</p>
      </div>`
    ).join("");

  // 5-Day Forecast
forecast.innerHTML = data.forecast.forecastday
  .map(
      (day) => `
      <div class="forecast-day">
        <p>${day.date}</p>
        <img src="https:${day.day.condition.icon}" width="40">
        <p>${isCelsius ? day.day.avgtemp_c : day.day.avgtemp_f}°</p>
      </div>`
    ).join("");
}

function updateFavorites(city) {
  if (!favorites.includes(city)) favorites.push(city);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

function renderFavorites() {
  favList.innerHTML = favorites
    .map((city) => `<li onclick="getWeather('${city}')">${city}</li>`)
    .join("");
}

// Auto-detect location
window.onload = () => {
  renderFavorites();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      getWeather(`${latitude},${longitude}`);
    });
  }
};
