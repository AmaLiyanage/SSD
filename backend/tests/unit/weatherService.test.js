import { jest } from '@jest/globals';

jest.unstable_mockModule('axios', () => ({
  default: {
    get: jest.fn(),
  },
}));

const { default: axios } = await import('axios');
const { checkRainfall } = await import('../../services/weatherService.js');

describe("Weather Service - checkRainfall", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return heavyRainfall: true if precipitation > 10mm", async () => {
    // Mock the API response to simulate 15.5mm of rain
    axios.get.mockResolvedValueOnce({
      data: {
        daily: {
          precipitation_sum: [15.5]
        }
      }
    });

    const result = await checkRainfall(6.9271, 79.8612); // Example coordinates (Colombo)
    
    expect(result.heavyRainfall).toBe(true);
    expect(result.precipitation).toBe(15.5);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("should return heavyRainfall: false if precipitation <= 10mm", async () => {
    // Mock the API response to simulate 5.0mm of rain
    axios.get.mockResolvedValueOnce({
      data: {
        daily: {
          precipitation_sum: [5.0]
        }
      }
    });

    const result = await checkRainfall(6.9271, 79.8612);
    
    expect(result.heavyRainfall).toBe(false);
    expect(result.precipitation).toBe(5.0);
  });

  it("should handle empty or missing precipitation data safely", async () => {
    // Mock the API response to simulate no data
    axios.get.mockResolvedValueOnce({
      data: {}
    });

    const result = await checkRainfall(6.9271, 79.8612);
    
    expect(result.heavyRainfall).toBe(false);
    expect(result.precipitation).toBe(0);
  });

  it("should throw an error if the API request fails", async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    await expect(checkRainfall(6.9271, 79.8612)).rejects.toThrow("Could not fetch weather data");
    
    consoleSpy.mockRestore();
  });
});
