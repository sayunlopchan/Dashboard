// filterModule.js

class FilterModule {
  constructor(baseApiUrl, endpoint) {
    this.BASE_API_URL = baseApiUrl;
    this.API_ENDPOINT = endpoint;
    this.API = this.BASE_API_URL + this.API_ENDPOINT;
  }

  async fetchData(filters = {}) {
    try {
      // Remove filters with value "all"
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "all")
      );

      const queryParams = new URLSearchParams(cleanedFilters).toString();
      const response = await fetch(`${this.API}/filter?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  applyFilter(filters, callback) {
    this.fetchData(filters).then(data => {
      callback(data);
    });
  }
}

export default FilterModule;