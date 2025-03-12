import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../db/searchHistory.sjon');

// TODO: Define a City class with name and id properties
interface City {
  id: string;
  name:string;
  createdAt: string;
}

// TODO: Complete the HistoryService class
class HistoryService {
  // Read from the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is empty, return empty array
      return [];
    }
  }

  // Write to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(dbPath), { recursive: true });
      await fs.writeFile(dbPath, JSON.stringify(cities, null, 2));
    } catch (error) {
      console.error('Error writing to history file:', error);
      throw new Error('Failed to save search history');
    }
  }

  // Get all cities
  async getCities(): Promise<City[]> {
    return this.read();
  }

  // Add city to the search history
  async addCity(cityName: string): Promise<City> {
    const cities = await this.read();
    
    // Check if city already exists (case insensitive)
    const normalizedName = cityName.trim().toLowerCase();
    const existingCity = cities.find(city => city.name.toLowerCase() === normalizedName);
    
    if (existingCity) {
      // Update timestamp for existing city
      existingCity.createdAt = new Date().toISOString();
      await this.write(cities);
      return existingCity;
    }
    
    // Create new city object
    const newCity: City = {
      id: uuidv4(),
      name: cityName.trim(),
      createdAt: new Date().toISOString()
    };
    
    // Add to history and save
    cities.push(newCity);
    await this.write(cities);
    
    return newCity;
  }

  // Remove city from search history
  async removeCity(id: string): Promise<void> {
    const cities = await this.read();
    const filteredCities = cities.filter(city => city.id !== id);
    
    // If no cities were removed, the ID doesn't exist
    if (cities.length === filteredCities.length) {
      throw new Error('City not found');
    }
    
    await this.write(filteredCities);
  }
}

export default new HistoryService();

  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  // private async write(cities: City[]) {}
  // Get all cities
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  // async getCities() {}
  
  // TODO Define an addCity method that adds a city to the searchHistory.json file
  // async addCity(city: string) {}
  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  // async removeCity(id: string) {}
 

