import './styles/jass.css';

// * All necessary DOM elements selected
const searchForm: HTMLFormElement = document.getElementById(
  'search-form'
) as HTMLFormElement;
const searchInput: HTMLInputElement = document.getElementById(
  'search-input'
) as HTMLInputElement;
const todayContainer = document.querySelector('#today') as HTMLDivElement;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById(
  'history'
) as HTMLDivElement;
const heading: HTMLHeadingElement = document.getElementById(
  'search-title'
) as HTMLHeadingElement;
const weatherIcon: HTMLImageElement = document.getElementById(
  'weather-img'
) as HTMLImageElement;
const tempEl: HTMLParagraphElement = document.getElementById(
  'temp'
) as HTMLParagraphElement;
const windEl: HTMLParagraphElement = document.getElementById(
  'wind'
) as HTMLParagraphElement;
const humidityEl: HTMLParagraphElement = document.getElementById(
  'humidity'
) as HTMLParagraphElement;

/*

API Calls

*/

const fetchWeather = async (cityName: string) => {
  try {
    const response = await fetch('/api/weather/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cityName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch weather data');
    }

    const weatherData = await response.json();
    console.log('weatherData: ', weatherData);

    renderCurrentWeather(weatherData[0]);
    renderForecast(weatherData.slice(1));
    
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    alert('Error: ' + (error instanceof Error ? error.message : 'Failed to fetch weather data'));
    throw error;
  }
};

const fetchSearchHistory = async () => {
  try {
    return await fetch('/api/weather/history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching search history:', error);
    alert('Error: Failed to fetch search history');
    throw error;
  }
};

const deleteCityFromHistory = async (id: string) => {
  try {
    const response = await fetch(`/api/weather/history/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete city from history');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting city:', error);
    alert('Error: Failed to delete city from history');
    throw error;
  }
};

/*

Render Functions

*/

const renderCurrentWeather = (currentWeather: any): void => {
  if (!currentWeather) {
    console.error('No current weather data provided');
    return;
  }

  const { city, date, icon, iconDescription, tempF, windSpeed, humidity } =
    currentWeather;

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  // Create a new container to hold all elements
  const newContainer = document.createElement('div');
  newContainer.classList.add('card-body');
  newContainer.id = 'today';
  
  // Append elements to the new container
  newContainer.appendChild(heading);
  newContainer.appendChild(tempEl);
  newContainer.appendChild(windEl);
  newContainer.appendChild(humidityEl);
  
  // Replace the old container with the new one
  if (todayContainer && todayContainer.parentNode) {
    todayContainer.parentNode.replaceChild(newContainer, todayContainer);
  }
};

const renderForecast = (forecast: any[]): void => {
  if (!forecast || !Array.isArray(forecast)) {
    console.error('Invalid forecast data');
    return;
  }

  if (!forecastContainer) {
    console.error('Forecast container not found');
    return;
  }

  forecastContainer.innerHTML = '';

  const headingCol = document.createElement('div');
  const heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);
  forecastContainer.append(headingCol);

  for (let i = 0; i < forecast.length; i++) {
    renderForecastCard(forecast[i]);
  }
};

const renderForecastCard = (forecast: any) => {
  if (!forecast) return;

  const { date, icon, iconDescription, tempF, windSpeed, humidity } = forecast;

  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } =
    createForecastCard();

  // Add content to elements
  cardTitle.textContent = date;
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (forecastContainer) {
    forecastContainer.append(col);
  }
};

const renderSearchHistory = async (searchHistory: Response) => {
  try {
    if (!searchHistoryContainer) {
      console.error('Search history container not found');
      return;
    }

    const historyList = await searchHistory.json();
    searchHistoryContainer.innerHTML = '';

    if (!historyList.length) {
      searchHistoryContainer.innerHTML =
        '<p class="text-center">No Previous Search History</p>';
      return;
    }

    // * Start at end of history array and count down to show the most recent cities at the top.
    for (let i = historyList.length - 1; i >= 0; i--) {
      const historyItem = buildHistoryListItem(historyList[i]);
      searchHistoryContainer.append(historyItem);
    }
  } catch (error) {
    console.error('Error rendering search history:', error);
    searchHistoryContainer.innerHTML = '<p class="text-center text-danger">Error loading search history</p>';
  }
};

/*

Helper Functions

*/

const createForecastCard = () => {
  const col = document.createElement('div');
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h5');
  const weatherIcon = document.createElement('img');
  const tempEl = document.createElement('p');
  const windEl = document.createElement('p');
  const humidityEl = document.createElement('p');

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add('col-auto');
  card.classList.add(
    'forecast-card',
    'card',
    'text-white',
    'bg-primary',
    'h-100'
  );
  cardBody.classList.add('card-body', 'p-2');
  cardTitle.classList.add('card-title');
  tempEl.classList.add('card-text');
  windEl.classList.add('card-text');
  humidityEl.classList.add('card-text');

  return {
    col,
    cardTitle,
    weatherIcon,
    tempEl,
    windEl,
    humidityEl,
  };
};

const createHistoryButton = (city: string) => {
  const btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-controls', 'today forecast');
  btn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  btn.textContent = city;

  return btn;
};

const createDeleteButton = () => {
  const delBtnEl = document.createElement('button');
  delBtnEl.setAttribute('type', 'button');
  delBtnEl.classList.add(
    'fas',
    'fa-trash-alt',
    'delete-city',
    'btn',
    'btn-danger',
    'col-2'
  );

  delBtnEl.addEventListener('click', handleDeleteHistoryClick);
  return delBtnEl;
};

const createHistoryDiv = () => {
  const div = document.createElement('div');
  div.classList.add('display-flex', 'gap-2', 'col-12', 'm-1');
  return div;
};

const buildHistoryListItem = (city: any) => {
  const newBtn = createHistoryButton(city.name);
  const deleteBtn = createDeleteButton();
  deleteBtn.dataset.city = JSON.stringify(city);
  const historyDiv = createHistoryDiv();
  historyDiv.append(newBtn, deleteBtn);
  return historyDiv;
};

/*

Event Handlers

*/

const handleSearchFormSubmit = (event: Event): void => {
  event.preventDefault();

  if (!searchInput || !searchInput.value) {
    alert('Please enter a city name');
    return;
  }

  const search: string = searchInput.value.trim();
  fetchWeather(search)
    .then(() => {
      getAndRenderHistory();
      searchInput.value = '';
    })
    .catch(error => {
      console.error('Search error:', error);
    });
};

const handleSearchHistoryClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (target && target.matches('.history-btn')) {
    const city = target.textContent;
    if (city) {
      fetchWeather(city)
        .then(getAndRenderHistory)
        .catch(error => {
          console.error('History search error:', error);
        });
    }
  }
};

const handleDeleteHistoryClick = (event: Event) => {
  event.stopPropagation();
  const target = event.target as HTMLElement;
  
  if (!target.dataset.city) {
    console.error('No city data found on delete button');
    return;
  }
  
  try {
    const cityData = JSON.parse(target.dataset.city);
    deleteCityFromHistory(cityData.id)
      .then(getAndRenderHistory)
      .catch(error => {
        console.error('Delete error:', error);
      });
  } catch (error) {
    console.error('Error parsing city data for deletion:', error);
  }
};

/*

Initial Render

*/

const getAndRenderHistory = () =>
  fetchSearchHistory()
    .then(renderSearchHistory)
    .catch(error => {
      console.error('Error getting history:', error);
    });

// Add event listeners
if (searchForm) {
  searchForm.addEventListener('submit', handleSearchFormSubmit);
} else {
  console.error('Search form not found');
}

if (searchHistoryContainer) {
  searchHistoryContainer.addEventListener('click', handleSearchHistoryClick);
} else {
  console.error('Search history container not found');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Weather Dashboard initialized');
  getAndRenderHistory();
});