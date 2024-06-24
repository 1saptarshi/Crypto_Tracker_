document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'https://api.coingecko.com/api/v3/coins/markets';
    const params = new URLSearchParams({
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 10,
      page: 1,
      sparkline: false
    });
  
    const searchInput = document.getElementById('search-input');
    const cryptoContainer = document.getElementById('crypto-container');
    const cryptoModal = document.getElementById('crypto-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModal = document.getElementById('close-modal');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIcon = document.getElementById('dark-mode-icon');
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
    // Function to fetch data from API
    async function fetchData(query = '') {
      const url = `${API_URL}?${params}&ids=${query}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        displayData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  
    // Function to display data
    function displayData(data) {
      cryptoContainer.innerHTML = data.map(coin => `
        <div class="bg-white p-4 rounded-lg shadow cursor-pointer" onclick="showDetails('${coin.id}')">
          <div class="flex items-center">
            <img src="${coin.image}" alt="${coin.name}" class="w-10 h-10 mr-4">
            <div>
              <h2 class="text-lg font-bold">${coin.name}</h2>
              <p class="text-gray-600">${coin.symbol.toUpperCase()}</p>
            </div>
            <button class="ml-auto p-1 rounded-full ${favorites.includes(coin.id) ? 'text-yellow-500' : 'text-gray-400'}" onclick="toggleFavorite(event, '${coin.id}')">
              <i class="fas fa-star"></i>
            </button>
          </div>
          <div class="mt-4">
            <p class="text-lg font-semibold">$${coin.current_price}</p>
            <p class="${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}">
              ${coin.price_change_percentage_24h.toFixed(2)}%
              <i class="fas ${coin.price_change_percentage_24h >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
            </p>
          </div>
        </div>
      `).join('');
    }
  
    // Function to show details in modal
    async function showDetails(id) {
      const url = `https://api.coingecko.com/api/v3/coins/${id}`;
      try {
        const response = await fetch(url);
        const coin = await response.json();
        modalContent.innerHTML = `
          <h2 class="text-2xl font-bold mb-2">${coin.name}</h2>
          <p>Symbol: ${coin.symbol.toUpperCase()}</p>
          <p>Current Price: $${coin.market_data.current_price.usd}</p>
          <p>Market Cap: $${coin.market_data.market_cap.usd}</p>
          <p>24h Change: ${coin.market_data.price_change_percentage_24h}%</p>
          <p>Description: ${coin.description.en.split('. ')[0]}</p>
        `;
        cryptoModal.classList.remove('hidden');
      } catch (error) {
        console.error('Error fetching details:', error);
      }
    }
  
    // Function to close modal
    closeModal.addEventListener('click', () => {
      cryptoModal.classList.add('hidden');
    });
  
    // Function to toggle favorite
    function toggleFavorite(event, id) {
      event.stopPropagation();
      if (favorites.includes(id)) {
        favorites = favorites.filter(fav => fav !== id);
      } else {
        favorites.push(id);
      }
      localStorage.setItem('favorites', JSON.stringify(favorites));
      fetchData();
    }
  
    // Function to toggle dark mode
    darkModeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      darkModeIcon.classList.toggle('fa-sun', isDark);
      darkModeIcon.classList.toggle('fa-moon', !isDark);
      localStorage.setItem('darkMode', isDark);
    });
  
    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark');
      darkModeIcon.classList.add('fa-sun');
    }
  
    // Search functionality
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      fetchData(query);
    });
  
    // Fetch initial data
    fetchData();
  
    // Live updates every minute
    setInterval(fetchData, 60000);
  });
  
  // Global functions for inline event handlers
  window.showDetails = showDetails;
  window.toggleFavorite = toggleFavorite;
  