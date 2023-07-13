const apiKey = '8c95e0a5ca137d1c963e38c8d776b2ce';
let weatherData = null;

function fetchWeatherData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

  return fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      weatherData = processWeatherData(data);
      return weatherData;
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
    });
}

function processWeatherData(data) {
  const city = data.city.name;
  const currentWeather = data.list[0];
  const date = currentWeather.dt_txt;
  const icon = currentWeather.weather[0].icon;
  const temperature = currentWeather.main.temp;
  const humidity = currentWeather.main.humidity;
  const windSpeed = currentWeather.wind.speed;

  const forecastData = data.list.slice(0, 40); // Adjusted to retrieve 40 forecast items (8 per day for 5 days)
  const forecast = [];

  for (let i = 0; i < forecastData.length; i += 8) {
    const forecastItem = forecastData[i];
    const forecastDate = forecastItem.dt_txt.split(' ')[0]; // Extracting the date from dt_txt
    const dayOfWeek = getDayOfWeek(new Date(forecastItem.dt_txt).getDay());
    const forecastTemperature = forecastItem.main.temp;
    const forecastIcon = forecastItem.weather[0].icon;
    const forecastHumidity = forecastItem.main.humidity;
    const forecastWindSpeed = forecastItem.wind.speed;
    forecast.push({
      dayOfWeek,
      date: forecastDate, // Adding the date property
      icon: forecastIcon,
      temperature: forecastTemperature,
      humidity: forecastHumidity,
      windSpeed: forecastWindSpeed
    });
  }

  return {
    city,
    date,
    icon,
    temperature,
    humidity,
    windSpeed,
    forecast
  };
}

function getDayOfWeek(dayIndex) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return daysOfWeek[dayIndex];
}

function formatDate(date) {
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

function displayCurrentWeather(data) {
  const currentWeatherSection = document.getElementById('current-weather');
  const dateTimeElement = document.createElement('span');
  const emojiElement = document.createElement('span');

  currentWeatherSection.innerHTML = `
    <h2>Current Weather</h2>
    <div class="weather-details">
      <div class="weather-details-item">
        <span class="label">City:</span>
        <span class="value">${data.city}</span>
      </div>
      <div class="weather-details-item">
        <span class="label">Date & Time:</span>
        <span class="value" id="date-time"></span>
      </div>
      <div class="weather-details-item">
        <span class="emoji">${getWeatherEmoji(data.icon)}</span>
      </div>
      <div class="weather-details-item">
        <span class="label">Temperature:</span>
        <span class="value">${convertToCelsius(data.temperature)}°F</span>
      </div>
      <div class="weather-details-item">
        <span class="label">Humidity:</span>
        <span class="value">${data.humidity}%</span>
      </div>
      <div class="weather-details-item">
        <span class="label">Wind Speed:</span>
        <span class="value">${data.windSpeed} km/h</span>
      </div>
    </div>
  `;

  const dateTimeContainer = document.getElementById('date-time');
  dateTimeContainer.appendChild(dateTimeElement);
  dateTimeContainer.appendChild(emojiElement);

  updateLiveTime(dateTimeElement);
}

function updateLiveTime(dateTimeElement) {
  setInterval(() => {
    const currentDate = new Date();
    const dateTime = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
    dateTimeElement.textContent = dateTime;

    // Check if it's a new day and refresh forecast if true
    if (currentDate.getHours() === 0 && currentDate.getMinutes() === 0 && currentDate.getSeconds() === 0) {
      refreshForecast();
    }
  }, 1000);
}

function refreshForecast() {
  if (weatherData !== null) {
    const city = weatherData.city;
    fetchWeatherData(city)
      .then(weatherData => {
        displayForecast(weatherData);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

function displayForecast(data) {
  const futureWeatherSection = document.getElementById('future-weather');
  futureWeatherSection.innerHTML = `
    <h2>5-Day Forecast</h2>
    <ul class="forecast-list">
      <!-- Forecast items will be dynamically generated here -->
    </ul>
  `;

  const forecastList = document.querySelector('.forecast-list');
  forecastList.innerHTML = ''; // Clear previous forecast items

  data.forecast.forEach(forecast => {
    const forecastItem = `
      <li class="forecast-item">
        <div class="day-of-week">${forecast.dayOfWeek}</div>
        <div class="date">${forecast.date}</div> <!-- Added the date -->
        <div class="icon">${getWeatherEmoji(forecast.icon)}</div>
        <div class="temperature">${convertToCelsius(forecast.temperature)}°F</div>
        <div class="humidity">${forecast.humidity}% Humidity</div>
        <div class="wind-speed">${forecast.windSpeed} km/h Wind Speed</div>
      </li>
    `;
    forecastList.insertAdjacentHTML('beforeend', forecastItem);
  });
}

function getWeatherEmoji(icon) {
  switch (icon) {
    case '01d':
      return '☀️'; // Clear sky (day)
    case '01n':
      return '🌙'; // Clear sky (night)
    case '02d':
    case '02n':
      return '🌤️'; // Few clouds
    case '03d':
    case '03n':
      return '🌥️'; // Scattered clouds
    case '04d':
    case '04n':
      return '☁️'; // Broken clouds
    case '09d':
    case '09n':
      return '🌧️'; // Shower rain
    case '10d':
    case '10n':
      return '🌦️'; // Rain
    case '11d':
    case '11n':
      return '⛈️'; // Thunderstorm
    case '13d':
    case '13n':
      return '❄️'; // Snow
    case '50d':
    case '50n':
      return '🌫️'; // Mist
    default:
      return '❓'; // Unknown
  }
}

function convertToCelsius(temperature) {
  return Math.round((temperature * 9) / 5 + 32);
}

function handleFormSubmit(event) {
  event.preventDefault();

  const cityInput = document.getElementById('city-input');
  const city = cityInput.value.trim();

  if (city) {
    fetchWeatherData(city)
      .then(weatherData => {
        displayCurrentWeather(weatherData);
        displayForecast(weatherData);
        addToSearchHistory(city);
        cityInput.value = '';
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

function handleSearchHistoryClick(event) {
  const clickedCity = event.target.textContent;
  fetchWeatherData(clickedCity)
    .then(weatherData => {
      displayCurrentWeather(weatherData);
      displayForecast(weatherData);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function addToSearchHistory(city) {
  const searchHistory = document.getElementById('search-history');
  const listItem = document.createElement('li');
  listItem.textContent = city;
  listItem.addEventListener('click', handleSearchHistoryClick);
  searchHistory.appendChild(listItem);
}

const searchForm = document.getElementById('search-form');
searchForm.addEventListener('submit', handleFormSubmit);














  