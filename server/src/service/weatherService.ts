import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}
// TODO: Define a class for the Weather object
interface Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
}

class WeatherService {
  private apiKey: string;
  private geocodeBaseUrl: string = 'http://api.openweathermap.org/geo/1.0/direct';
  private weatherBaseUrl: string = 'https://api.openweathermap.org/data/2.5/forecast';
  
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.error('OpenWeather API key is not set in environment variables');
    }
  } 
  
  // private async fetchLocationData(query: string) {}
   // Fetch location data from OpenWeather Geocoding API
  private async fetchLocationData(query: string): Promise<any> {
    try {
      const response = await axios.get(this.buildGeocodeQuery(query));
      return response.data;
    } catch (error) {
      console.error('Error fetching location data:', error);
      throw new Error('Failed to fetch location data');
    }
  }
   
  // Extract coordinates from location data
  private destructureLocationData(locationData: any[]): Coordinates {
    if (!locationData || locationData.length === 0) {
      throw new Error('Location not found');
    }
    
    const { lat, lon } = locationData[0];
    return { lat, lon };
  }
   
  private buildGeocodeQuery(city: string): string {
    return `${this.geocodeBaseUrl}?q=${encodeURIComponent(city)}&limit=1&appid=${this.apiKey}`;
  } 
 
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.weatherBaseUrl}?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
  }
  
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  //fetch weather data from Openweather API
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    try {
      const response = await axios.get(this.buildWeatherQuery(coordinates));
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  } 
  
  private parseCurrentWeather(city: string, weatherItem: any): Weather {
    return {
      city: city,
      date: new Date(weatherItem.dt * 1000).toLocaleDateString(),
      icon: weatherItem.weather[0].icon,
      iconDescription: weatherItem.weather[0].description,
      tempF: Math.round(weatherItem.main.temp),
      windSpeed: Math.round(weatherItem.wind.speed),
      humidity: weatherItem.main.humidity
    };
  }
 
  private buildForecastArray(city: string, weatherData: any): Weather[] {
    const forecastList = weatherData.list;

    // Filter to get data points at same time each day (one per day)
    // The OpenWeather API returns data in 3-hour intervals
    const dailyForecasts = forecastList
      .filter((_: any, index: number) => index % 8 === 0) // Every 8th item is roughly the same time each day
      .map((item: any) => this.parseCurrentWeather(city, item));
      
    return dailyForecasts;
  }

  // Main method to get weather data for a city
  async getWeatherForCity(city: string): Promise<Weather[]> {
    try {
      const coordinates = await this.fetchAndDestructureLocationData(city);
      const weatherData = await this.fetchWeatherData(coordinates);
      return this.buildForecastArray(city, weatherData);
    } catch (error) {
      console.error('Error getting weather for city:', error);
      throw error;
    }
  }
}
 
export default new WeatherService();
