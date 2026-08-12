// App State
const state = {
  activeTab: 'beverages',
  theme: 'dark',
  data: {
    drinks: [],
    storesSummary: {},
    storesLocations: [] // Loaded lazily
  },
  filters: {
    search: '',
    categories: [],
    preps: [],
    countries: [],
    calories: 500,
    sugar: 100,
    caffeine: 450
  },
  sorting: {
    bev: { column: 'name', direction: 'asc' },
    store: { column: '0', direction: 'asc' }
  },
  pagination: {
    bev: { page: 1, pageSize: 10 },
    store: { page: 1, pageSize: 10 }
  },
  map: null,
  mapMarkersLayer: null,
  mapCountriesLayer: null,
  charts: {},
  builder: {
    category: '',
    beverage: '',
    prep: '',
    addons: {
      shot: false,
      whip: false,
      vanilla: false,
      caramel: false,
      protein: false
    }
  }
};

// Major Country Centroids for Zoomed-Out Map Circles
const COUNTRY_CENTROIDS = {
  'United States': [37.0902, -95.7129],
  'China': [35.8617, 104.1954],
  'Canada': [56.1304, -106.3468],
  'Japan': [36.2048, 138.2529],
  'South Korea': [35.9078, 127.7669],
  'United Kingdom': [55.3781, -3.4360],
  'Mexico': [23.6345, -102.5528],
  'Taiwan': [23.6978, 120.9605],
  'Turkey': [38.9637, 35.2433],
  'Philippines': [12.8797, 121.7740],
  'Thailand': [15.8700, 100.9925],
  'Germany': [51.1657, 10.4515],
  'Malaysia': [4.2105, 101.9758],
  'Singapore': [1.3521, 103.8198],
  'France': [46.2276, 2.2137],
  'Spain': [40.4637, -3.7492],
  'Indonesia': [-0.7893, 113.9213],
  'Brazil': [-14.2350, -51.9253],
  'Russia': [61.5240, 105.3188],
  'United Arab Emirates': [23.4241, 53.8478],
  'Chile': [-35.6751, -71.5430],
  'Peru': [-9.1900, -75.0152],
  'Saudi Arabia': [23.8859, 45.0792],
  'Netherlands': [52.1326, 5.2913],
  'Argentina': [-38.4161, -63.6167],
  'Poland': [51.9194, 19.1451],
  'Colombia': [4.5709, -74.2973],
  'Ireland': [53.4129, -8.2439],
  'Switzerland': [46.8182, 8.2275],
  'New Zealand': [-40.9006, 174.8860],
  'India': [20.5937, 78.9629],
  'Vietnam': [14.0583, 108.2772],
  'Belgium': [50.5039, 4.4699],
  'Romania': [45.9432, 24.9668],
  'Greece': [39.0742, 21.8243],
  'Austria': [47.5162, 14.5501],
  'Sweden': [60.1282, 18.6435],
  'Portugal': [39.3999, -8.2245],
  'Denmark': [56.2639, 9.5018],
  'Norway': [60.4720, 8.4689],
  'Hungary': [47.1625, 19.5033],
  'Czech Republic': [49.8175, 15.4730],
  'Egypt': [26.8206, 30.8025],
  'Morocco': [31.7917, -7.0926],
  'Kuwait': [29.3117, 47.4818],
  'Qatar': [25.3548, 51.1839],
  'Oman': [21.5126, 55.9233],
  'Bahrain': [26.0667, 50.5577],
  'Jordan': [30.5852, 36.2384],
  'Lebanon': [33.8547, 35.8623],
  'El Salvador': [13.7942, -88.8965],
  'Costa Rica': [9.7489, -83.7534],
  'Panama': [8.5380, -80.7821],
  'Guatemala': [15.7835, -90.2308],
  'Honduras': [15.1999, -86.2419],
  'Bahamas': [25.0343, -77.3963],
  'Aruba': [12.5211, -69.9683],
  'Curaçao': [12.1696, -68.9900],
  'Trinidad and Tobago': [10.6918, -61.2225],
  'Jamaica': [18.1096, -77.2975],
  'Puerto Rico': [18.2208, -66.5901],
  'Finland': [61.9241, 25.7482],
  'Luxembourg': [49.8153, 6.1296],
  'Slovakia': [48.6690, 19.6990],
  'Bulgaria': [42.7339, 25.4858],
  'Cyprus': [35.1264, 33.4299],
  'Malta': [35.9375, 14.3754],
  'Italy': [41.8719, 12.5674],
  'South Africa': [-30.5595, 22.9375],
  'Australia': [-25.2744, 133.7751],
  'Macau': [22.1987, 113.5439],
  'Hong Kong': [22.3193, 114.1694],
  'Cambodia': [12.5657, 104.9910],
  'Brunei': [4.5353, 114.7277],
  'Bolivia': [-16.2902, -63.5887],
  'Uruguay': [-32.5228, -55.7658],
  'Paraguay': [-23.4425, -58.4438],
  'Ecuador': [-1.8312, -78.1834],
  'Venezuela': [6.4238, -66.5897],
  'Andorra': [42.5063, 1.5218],
  'Monaco': [43.7384, 7.4246],
  'Liechtenstein': [47.1410, 9.5209],
  'San Marino': [43.9424, 12.4578]
};

// Recommended Daily Intakes (RDI) reference values
const RDI = {
  calories: 2000,
  fat: 65,
  satFat: 20,
  cholesterol: 300,
  sodium: 2300,
  carbs: 300,
  fiber: 25,
  sugar: 50, // Added free sugars recommendation
  protein: 50
};

// Fun Facts database for drink builder
const DRINK_FUN_FACTS = [
  "Starbucks' signature green brand color (#006241) was chosen to evoke growth, prosperity, and the natural origin of coffee beans.",
  "Customizing with Oatmilk or Almondmilk generally reduces calories by 30-50% compared to whole milk, while preserving creaminess.",
  "An extra espresso shot adds about 75mg of caffeine but only 5 calories, making it a great energy booster without carbohydrate loading.",
  "Saturated fats from dairy toppings (like Whipped Cream) contribute significantly to your daily reference values. Use standard milk options to minimize saturated fat.",
  "Sugar content in flavored syrups quickly accumulates. A single pump of vanilla syrup contains roughly 5 grams of sugar (20 calories).",
  "Tea drinks like Matcha Green Tea Lattes contain powerful antioxidants called catechins, though standard menu preparations include sugar syrups.",
  "Caffeine intake of up to 400mg per day is considered safe for most healthy adults. That's equivalent to about two Ventis of Brewed Coffee.",
  "Standard espresso has a lower caffeine yield per volume than drip brewed coffee because espresso is brewed under pressure for a shorter duration."
];

// Document Elements
const elements = {
  navBtns: document.querySelectorAll('.nav-btn'),
  panels: document.querySelectorAll('.tab-panel'),
  tabTitle: document.getElementById('current-tab-title'),
  tabSubtitle: document.getElementById('current-tab-subtitle'),
  quickCountText: document.getElementById('quick-count-text'),
  themeToggle: document.getElementById('theme-toggle'),
  btnResetFilters: document.getElementById('btn-reset-filters'),
  
  // Filters Inputs
  searchInput: document.getElementById('search-input'),
  categoryTrigger: document.getElementById('category-trigger'),
  categoryDropdown: document.getElementById('category-dropdown'),
  categorySearch: document.getElementById('category-search'),
  categoryOptions: document.getElementById('category-options'),
  prepTrigger: document.getElementById('prep-trigger'),
  prepDropdown: document.getElementById('prep-dropdown'),
  prepOptions: document.getElementById('prep-options'),
  countryTrigger: document.getElementById('country-trigger'),
  countryDropdown: document.getElementById('country-dropdown'),
  countrySearch: document.getElementById('country-search'),
  countryOptions: document.getElementById('country-options'),
  filterCountryGroup: document.getElementById('filter-country-group'),
  beverageSliders: document.getElementById('beverage-sliders'),
  
  // Range Sliders
  sliderCalories: document.getElementById('slider-calories'),
  valCalories: document.getElementById('val-calories'),
  sliderSugar: document.getElementById('slider-sugar'),
  valSugar: document.getElementById('val-sugar'),
  sliderCaffeine: document.getElementById('slider-caffeine'),
  valCaffeine: document.getElementById('val-caffeine'),
  
  // Beverages Tab KPIs
  kpiBevVariants: document.getElementById('kpi-bev-variants'),
  kpiAvgCalories: document.getElementById('kpi-avg-calories'),
  kpiAvgSugars: document.getElementById('kpi-avg-sugars'),
  kpiAvgCaffeine: document.getElementById('kpi-avg-caffeine'),
  trendAvgCalories: document.getElementById('trend-avg-calories'),
  trendAvgSugars: document.getElementById('trend-avg-sugars'),
  trendAvgCaffeine: document.getElementById('trend-avg-caffeine'),
  
  // Beverages Table
  tableBevSearch: document.getElementById('table-bev-search'),
  bevPageSize: document.getElementById('bev-page-size'),
  bevTableBody: document.getElementById('bev-table-body'),
  bevPaginationInfo: document.getElementById('bev-pagination-info'),
  bevPaginationControls: document.getElementById('bev-pagination-controls'),
  bevTableHeaders: document.querySelectorAll('#table-beverages-list th'),
  
  // Stores Tab KPIs
  kpiStoreCount: document.getElementById('kpi-store-count'),
  kpiStoreCountries: document.getElementById('kpi-store-countries'),
  kpiStoreCities: document.getElementById('kpi-store-cities'),
  kpiStoreOwnership: document.getElementById('kpi-store-ownership'),
  
  // Stores Table & Map
  tableStoreSearch: document.getElementById('table-store-search'),
  storePageSize: document.getElementById('store-page-size'),
  storeTableBody: document.getElementById('store-table-body'),
  storePaginationInfo: document.getElementById('store-pagination-info'),
  storePaginationControls: document.getElementById('store-pagination-controls'),
  storeTableHeaders: document.querySelectorAll('#table-stores-list th'),
  mapLoader: document.getElementById('map-loader'),
  mapFitWorld: document.getElementById('map-fit-world'),
  
  // Builder Tab Inputs
  builderCategory: document.getElementById('builder-category'),
  builderBeverage: document.getElementById('builder-beverage'),
  builderPrep: document.getElementById('builder-prep'),
  builderResetBtn: document.getElementById('builder-reset-btn'),
  addonShot: document.getElementById('addon-shot'),
  addonWhip: document.getElementById('addon-whip'),
  addonVanilla: document.getElementById('addon-vanilla'),
  addonCaramel: document.getElementById('addon-caramel'),
  addonProtein: document.getElementById('addon-protein'),
  
  // Builder Tab FDA Label
  nfDrinkName: document.getElementById('nf-drink-display-name'),
  nfPrepName: document.getElementById('nf-prep-display-name'),
  nfCalories: document.getElementById('nf-calories'),
  nfFat: document.getElementById('nf-fat'),
  nfFatDv: document.getElementById('nf-fat-dv'),
  nfSatfat: document.getElementById('nf-satfat'),
  nfSatfatDv: document.getElementById('nf-satfat-dv'),
  nfTransfat: document.getElementById('nf-transfat'),
  nfCholesterol: document.getElementById('nf-cholesterol'),
  nfCholesterolDv: document.getElementById('nf-cholesterol-dv'),
  nfSodium: document.getElementById('nf-sodium'),
  nfSodiumDv: document.getElementById('nf-sodium-dv'),
  nfCarbs: document.getElementById('nf-carbs'),
  nfCarbsDv: document.getElementById('nf-carbs-dv'),
  nfFiber: document.getElementById('nf-fiber'),
  nfFiberDv: document.getElementById('nf-fiber-dv'),
  nfSugar: document.getElementById('nf-sugar'),
  nfProtein: document.getElementById('nf-protein'),
  nfProteinDv: document.getElementById('nf-protein-dv'),
  nfVitA: document.getElementById('nf-vit-a'),
  nfVitC: document.getElementById('nf-vit-c'),
  nfCalcium: document.getElementById('nf-calcium'),
  nfIron: document.getElementById('nf-iron'),
  nfCaffeine: document.getElementById('nf-caffeine'),
  
  // Builder RDI & Grade
  nfHealthGrade: document.getElementById('nf-health-grade'),
  nfHealthDesc: document.getElementById('nf-health-desc'),
  rdiBarCalories: document.getElementById('rdi-bar-calories'),
  rdiBarSugar: document.getElementById('rdi-bar-sugar'),
  rdiBarCaffeine: document.getElementById('rdi-bar-caffeine'),
  rdiPctCalories: document.getElementById('rdi-pct-calories'),
  rdiPctSugar: document.getElementById('rdi-pct-sugar'),
  rdiPctCaffeine: document.getElementById('rdi-pct-caffeine'),
  builderFactText: document.getElementById('builder-fact-text')
};

// Initial Setup & Application Launcher
window.addEventListener('DOMContentLoaded', async () => {
  // Initialize lucide icons
  lucide.createIcons();
  
  // Register basic event listeners
  setupTabEvents();
  setupFilterEvents();
  setupTableEvents();
  setupThemeEvents();
  setupBuilderEvents();

  // Load Initial Datasets
  try {
    const drinksRes = await fetch('data/drinks.json');
    state.data.drinks = await drinksRes.json();
    
    const summaryRes = await fetch('data/stores_summary.json');
    state.data.storesSummary = await summaryRes.json();
    
    // Initialize Dashboard UI & Charts
    populateFilterDropdowns();
    updateBeveragesDashboard();
    
    // Lazily fetch the heavy stores location file in the background (prevents blocking rendering)
    fetchStoresLocations();
  } catch (err) {
    console.error("Error loading Starbucks datasets: ", err);
  }
});

// Lazy loader for store coordinate lists
async function fetchStoresLocations() {
  try {
    const res = await fetch('data/stores_locations.json');
    state.data.storesLocations = await res.json();
    
    // Populate Country filter options
    populateCountryDropdown();
    
    // Hide map loader, enable actions
    elements.mapLoader.classList.add('hidden');
    
    // Initialize Leaflet Map
    initMap();
  } catch (err) {
    console.error("Error lazily fetching store locations: ", err);
    elements.mapLoader.innerHTML = "<span>Error loading store coordinates list.</span>";
  }
}

// ----------------------------------------------------
// UI TABS & NAVIGATION
// ----------------------------------------------------
function setupTabEvents() {
  elements.navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Update sidebar nav state
      elements.navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update visible tab panel
      elements.panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `panel-${targetTab}`) {
          panel.classList.add('active');
        }
      });

      // Update state & header titles
      state.activeTab = targetTab;
      updateHeaderTitles(targetTab);
      
      // Update context-dependent filters visibility
      if (targetTab === 'beverages') {
        elements.filterCountryGroup.classList.add('hidden');
        elements.beverageSliders.classList.remove('hidden');
        document.getElementById('filter-category-group').classList.remove('hidden');
        document.getElementById('filter-prep-group').classList.remove('hidden');
        updateBeveragesDashboard();
      } else if (targetTab === 'stores') {
        elements.filterCountryGroup.classList.remove('hidden');
        elements.beverageSliders.classList.add('hidden');
        document.getElementById('filter-category-group').classList.add('hidden');
        document.getElementById('filter-prep-group').classList.add('hidden');
        updateStoresDashboard();
      } else if (targetTab === 'builder') {
        elements.filterCountryGroup.classList.add('hidden');
        elements.beverageSliders.classList.add('hidden');
        document.getElementById('filter-category-group').classList.add('hidden');
        document.getElementById('filter-prep-group').classList.add('hidden');
        updateBuilderDashboard();
      }
      
      // Ensure leaflet maps refresh sizing inside layout boxes
      if (targetTab === 'stores' && state.map) {
        setTimeout(() => state.map.invalidateSize(), 150);
      }
    });
  });
}

function updateHeaderTitles(tabName) {
  if (tabName === 'beverages') {
    elements.tabTitle.textContent = "Beverage Nutrition Dashboard";
    elements.tabSubtitle.textContent = "Analyzing macro-nutrients and beverage category distributions";
  } else if (tabName === 'stores') {
    elements.tabTitle.textContent = "Global Stores Dashboard";
    elements.tabSubtitle.textContent = "Analyzing global footprint, store density, and ownership patterns";
  } else if (tabName === 'builder') {
    elements.tabTitle.textContent = "Custom Drink Configurator";
    elements.tabSubtitle.textContent = "Interactive customization calculator with FDA compliance labeling";
  }
}

// ----------------------------------------------------
// THEME SWITCHER (DARK / LIGHT)
// ----------------------------------------------------
function setupThemeEvents() {
  elements.themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    state.theme = newTheme;
    
    // Redraw charts with theme-aware colors
    updateChartThemeColors();
    
    // Toggle Leaflet map style
    if (state.map) {
      updateMapTileStyle(newTheme);
    }
  });
}

function updateChartThemeColors() {
  const isDark = state.theme === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const labelColor = isDark ? '#adb5bd' : '#495057';
  
  Object.values(state.charts).forEach(chart => {
    if (!chart) return;
    
    // Modify scale gridlines & ticks
    if (chart.options.scales) {
      if (chart.options.scales.x) {
        chart.options.scales.x.grid.color = gridColor;
        chart.options.scales.x.ticks.color = labelColor;
      }
      if (chart.options.scales.y) {
        chart.options.scales.y.grid.color = gridColor;
        chart.options.scales.y.ticks.color = labelColor;
      }
    }
    
    // Modify legend text color
    if (chart.options.plugins && chart.options.plugins.legend) {
      chart.options.plugins.legend.labels.color = labelColor;
    }
    
    chart.update();
  });
}

// ----------------------------------------------------
// DYNAMIC FILTER OPTIONS POPULATION
// ----------------------------------------------------
function populateFilterDropdowns() {
  const categories = [...new Set(state.data.drinks.map(d => d.category))].sort();
  const preps = [...new Set(state.data.drinks.map(d => d.prep))].sort();
  
  // Category Slicer Options
  const catOptionsContainer = elements.categoryOptions;
  catOptionsContainer.innerHTML = '';
  categories.forEach(cat => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.setAttribute('data-value', cat);
    item.innerHTML = `<div class="chk-box"></div><span>${cat}</span>`;
    
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMultiSelectFilter('categories', cat, item);
    });
    catOptionsContainer.appendChild(item);
  });
  
  // Prep Slicer Options
  const prepOptionsContainer = elements.prepOptions;
  prepOptionsContainer.innerHTML = '';
  preps.forEach(prep => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.setAttribute('data-value', prep);
    item.innerHTML = `<div class="chk-box"></div><span>${prep}</span>`;
    
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMultiSelectFilter('preps', prep, item);
    });
    prepOptionsContainer.appendChild(item);
  });
}

function populateCountryDropdown() {
  if (!state.data.storesSummary.top_countries) return;
  const countries = state.data.storesSummary.top_countries.map(c => c.country).sort();
  
  const countryOptionsContainer = elements.countryOptions;
  countryOptionsContainer.innerHTML = '';
  countries.forEach(country => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.setAttribute('data-value', country);
    item.innerHTML = `<div class="chk-box"></div><span>${country}</span>`;
    
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMultiSelectFilter('countries', country, item);
    });
    countryOptionsContainer.appendChild(item);
  });
}

// Handles toggle actions for category, prep, and country filters
function toggleMultiSelectFilter(type, value, element) {
  const filterList = state.filters[type];
  const idx = filterList.indexOf(value);
  
  if (idx > -1) {
    filterList.splice(idx, 1);
    element.classList.remove('selected');
  } else {
    filterList.push(value);
    element.classList.add('selected');
  }
  
  // Update select trigger text label
  const triggerEl = elements[`${type.slice(0, -1)}Trigger`].querySelector('.trigger-text');
  if (filterList.length === 0) {
    triggerEl.textContent = `All ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  } else if (filterList.length === 1) {
    triggerEl.textContent = filterList[0];
  } else {
    triggerEl.textContent = `${filterList.length} Selected`;
  }
  
  // Trigger dashboards data refreshes reactively
  state.pagination.bev.page = 1;
  state.pagination.store.page = 1;
  
  if (state.activeTab === 'beverages') {
    updateBeveragesDashboard();
  } else if (state.activeTab === 'stores') {
    updateStoresDashboard();
  }
}

// Reset dashboard filters back to initial state
function resetAllFilters() {
  state.filters.search = '';
  state.filters.categories = [];
  state.filters.preps = [];
  state.filters.countries = [];
  state.filters.calories = 500;
  state.filters.sugar = 100;
  state.filters.caffeine = 450;
  
  // Reset html fields
  elements.searchInput.value = '';
  elements.sliderCalories.value = 500;
  elements.valCalories.textContent = '0 - 500+';
  elements.sliderSugar.value = 100;
  elements.valSugar.textContent = '0 - 100+';
  elements.sliderCaffeine.value = 450;
  elements.valCaffeine.textContent = '0 - 450+';
  
  // Reset multi select headers
  elements.categoryTrigger.querySelector('.trigger-text').textContent = "All Categories";
  elements.prepTrigger.querySelector('.trigger-text').textContent = "All Preps";
  elements.countryTrigger.querySelector('.trigger-text').textContent = "All Countries";
  
  // Unselect active selected classes in dropdown elements
  document.querySelectorAll('.dropdown-item').forEach(el => el.classList.remove('selected'));
  
  // Reset pagination
  state.pagination.bev.page = 1;
  state.pagination.store.page = 1;
  
  // Refresh active dashboard
  if (state.activeTab === 'beverages') {
    updateBeveragesDashboard();
  } else if (state.activeTab === 'stores') {
    updateStoresDashboard();
  }
}

// ----------------------------------------------------
// EVENT LISTENERS FOR FILTER INPUTS
// ----------------------------------------------------
function setupFilterEvents() {
  // Global Search input
  elements.searchInput.addEventListener('input', (e) => {
    state.filters.search = e.target.value.trim().toLowerCase();
    state.pagination.bev.page = 1;
    state.pagination.store.page = 1;
    if (state.activeTab === 'beverages') {
      updateBeveragesDashboard();
    } else if (state.activeTab === 'stores') {
      updateStoresDashboard();
    }
  });
  
  // Reset Filters Button
  elements.btnResetFilters.addEventListener('click', resetAllFilters);
  
  // Dropdown Toggling handlers
  setupDropdownToggles('category');
  setupDropdownToggles('prep');
  setupDropdownToggles('country');
  
  // Localized Dropdown Searches
  elements.categorySearch.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    elements.categoryOptions.querySelectorAll('.dropdown-item').forEach(item => {
      const val = item.getAttribute('data-value').toLowerCase();
      item.classList.toggle('hidden', !val.includes(q));
    });
  });
  
  elements.countrySearch.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    elements.countryOptions.querySelectorAll('.dropdown-item').forEach(item => {
      const val = item.getAttribute('data-value').toLowerCase();
      item.classList.toggle('hidden', !val.includes(q));
    });
  });

  // Range Slider events
  elements.sliderCalories.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    state.filters.calories = val;
    elements.valCalories.textContent = val === 500 ? '0 - 500+' : `0 - ${val}`;
    state.pagination.bev.page = 1;
    updateBeveragesDashboard();
  });

  elements.sliderSugar.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    state.filters.sugar = val;
    elements.valSugar.textContent = val === 100 ? '0 - 100+' : `0 - ${val}`;
    state.pagination.bev.page = 1;
    updateBeveragesDashboard();
  });

  elements.sliderCaffeine.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    state.filters.caffeine = val;
    elements.valCaffeine.textContent = val === 450 ? '0 - 450+' : `0 - ${val}`;
    state.pagination.bev.page = 1;
    updateBeveragesDashboard();
  });
}

function setupDropdownToggles(prefix) {
  const trigger = elements[`${prefix}Trigger`];
  const container = document.getElementById(`filter-${prefix}-group`).querySelector('.custom-select-container');
  
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close other dropdowns first
    document.querySelectorAll('.custom-select-container').forEach(c => {
      if (c !== container) c.classList.remove('open');
    });
    container.classList.toggle('open');
  });
  
  // Close when clicking outside of this dropdown
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      container.classList.remove('open');
    }
  });
}

// ----------------------------------------------------
// BEVERAGES DASHBOARD: FILTERING & RENDER CONTROLLER
// ----------------------------------------------------
function getFilteredBeverages() {
  return state.data.drinks.filter(d => {
    // Search match
    if (state.filters.search) {
      const matchSearch = d.name.toLowerCase().includes(state.filters.search) || 
                          d.category.toLowerCase().includes(state.filters.search);
      if (!matchSearch) return false;
    }
    
    // Category match
    if (state.filters.categories.length > 0 && !state.filters.categories.includes(d.category)) {
      return false;
    }
    
    // Prep match
    if (state.filters.preps.length > 0 && !state.filters.preps.includes(d.prep)) {
      return false;
    }
    
    // Nutrient ranges match
    if (d.calories > state.filters.calories) return false;
    if (d.sugar_g > state.filters.sugar) return false;
    if (d.caffeine_mg > state.filters.caffeine) return false;
    
    return true;
  });
}

function updateBeveragesDashboard() {
  const filtered = getFilteredBeverages();
  
  // Update header text counter
  elements.quickCountText.textContent = `${filtered.length} Drinks Filtered`;
  
  // Calculate and update KPIs
  updateBeveragesKPIs(filtered);
  
  // Update visual Chart.js charts
  renderBeverageCharts(filtered);
  
  // Render granular table records
  renderBeverageTable(filtered);
}

function updateBeveragesKPIs(data) {
  const count = data.length;
  elements.kpiBevVariants.textContent = count.toLocaleString();
  
  if (count === 0) {
    elements.kpiAvgCalories.innerHTML = `0 <span class="unit">kcal</span>`;
    elements.kpiAvgSugars.innerHTML = `0 <span class="unit">g</span>`;
    elements.kpiAvgCaffeine.innerHTML = `0 <span class="unit">mg</span>`;
    return;
  }
  
  const avgCalories = data.reduce((sum, d) => sum + d.calories, 0) / count;
  const avgSugars = data.reduce((sum, d) => sum + d.sugar_g, 0) / count;
  const avgCaffeine = data.reduce((sum, d) => sum + d.caffeine_mg, 0) / count;
  
  elements.kpiAvgCalories.innerHTML = `${Math.round(avgCalories)} <span class="unit">kcal</span>`;
  elements.kpiAvgSugars.innerHTML = `${avgSugars.toFixed(1)} <span class="unit">g</span>`;
  elements.kpiAvgCaffeine.innerHTML = `${Math.round(avgCaffeine)} <span class="unit">mg</span>`;
  
  // Compare with the overall menu averages for mini-trends
  // Averages for complete dataset: calories: 193.8, sugars: 32.9g, caffeine: 89.5mg
  updateTrendPill(elements.trendAvgCalories, avgCalories, 193.8, 'kcal');
  updateTrendPill(elements.trendAvgSugars, avgSugars, 32.9, 'g');
  updateTrendPill(elements.trendAvgCaffeine, avgCaffeine, 89.5, 'mg');
}

function updateTrendPill(element, current, baseline, unit) {
  const diff = current - baseline;
  const pct = Math.abs((diff / baseline) * 100).toFixed(0);
  
  if (diff > 1) {
    element.className = "kpi-trend trend-down"; // High nutrients = down arrow or warning
    element.innerHTML = `<i data-lucide="trending-up"></i> +${pct}% vs Overall Average`;
  } else if (diff < -1) {
    element.className = "kpi-trend trend-up"; // Low nutrients = green trend
    element.innerHTML = `<i data-lucide="trending-down"></i> -${pct}% vs Overall Average`;
  } else {
    element.className = "kpi-trend trend-neutral";
    element.innerHTML = "Consistent with menu average";
  }
  lucide.createIcons({attrs: {class: ['trend-icon']}});
}

// ----------------------------------------------------
// CHART RENDERINGS (CHART.JS)
// ----------------------------------------------------
function renderBeverageCharts(data) {
  const isDark = state.theme === 'dark';
  const labelColor = isDark ? '#adb5bd' : '#495057';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // 1. Avg Calories by Category
  const categories = [...new Set(data.map(d => d.category))];
  const avgCaloriesData = categories.map(cat => {
    const subset = data.filter(d => d.category === cat);
    return Math.round(subset.reduce((sum, d) => sum + d.calories, 0) / subset.length);
  });
  
  // Sort categories by average calories descending
  const catCalPairs = categories.map((cat, idx) => ({ cat, cal: avgCaloriesData[idx] }))
                               .sort((a, b) => b.cal - a.cal);
                               
  if (state.charts.avgCalories) {
    state.charts.avgCalories.data.labels = catCalPairs.map(p => p.cat);
    state.charts.avgCalories.data.datasets[0].data = catCalPairs.map(p => p.cal);
    state.charts.avgCalories.update();
  } else {
    const ctx = document.getElementById('chart-avg-calories').getContext('2d');
    state.charts.avgCalories = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: catCalPairs.map(p => p.cat),
        datasets: [{
          label: 'Average Calories',
          data: catCalPairs.map(p => p.cal),
          backgroundColor: '#00704a',
          borderRadius: 6,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.parsed.y} kcal`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: labelColor, font: { family: 'Inter', size: 9 } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: labelColor }
          }
        }
      }
    });
  }

  // 2. Top 5 Caffeine Drinks
  // Sort drinks by caffeine descending
  const topCaffeine = [...data].sort((a, b) => b.caffeine_mg - a.caffeine_mg).slice(0, 5);
  
  if (state.charts.topCaffeine) {
    state.charts.topCaffeine.data.labels = topCaffeine.map(d => `${d.name.split('(')[0]} (${d.prep})`);
    state.charts.topCaffeine.data.datasets[0].data = topCaffeine.map(d => d.caffeine_mg);
    state.charts.topCaffeine.update();
  } else {
    const ctx = document.getElementById('chart-top-caffeine').getContext('2d');
    state.charts.topCaffeine = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topCaffeine.map(d => `${d.name.split('(')[0]} (${d.prep})`),
        datasets: [{
          label: 'Caffeine Content (mg)',
          data: topCaffeine.map(d => d.caffeine_mg),
          backgroundColor: '#2d9cdb',
          borderRadius: 6,
          borderWidth: 0
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.parsed.x} mg`
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: labelColor }
          },
          y: {
            grid: { display: false },
            ticks: { color: labelColor, font: { family: 'Inter', size: 9 } }
          }
        }
      }
    });
  }

  // 3. Category Distribution (Pie / Donut Chart)
  const catDistribution = {};
  data.forEach(d => {
    catDistribution[d.category] = (catDistribution[d.category] || 0) + 1;
  });
  
  const catLabels = Object.keys(catDistribution);
  const catCounts = Object.values(catDistribution);
  const palette = ['#00704a', '#2d9cdb', '#f2994a', '#eb5757', '#9b51e0', '#27ae60', '#2f80ed', '#f2c94c', '#56ccf2'];
  
  if (state.charts.catDistribution) {
    state.charts.catDistribution.data.labels = catLabels;
    state.charts.catDistribution.data.datasets[0].data = catCounts;
    state.charts.catDistribution.update();
  } else {
    const ctx = document.getElementById('chart-cat-distribution').getContext('2d');
    state.charts.catDistribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: catLabels,
        datasets: [{
          data: catCounts,
          backgroundColor: palette.slice(0, catLabels.length),
          borderWidth: isDark ? 2 : 1,
          borderColor: isDark ? '#1c2123' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: labelColor, boxWidth: 10, font: { size: 10 } }
          }
        },
        cutout: '70%'
      }
    });
  }

  // 4. Sugar vs Calories Scatter Plot
  const scatterPoints = data.map(d => ({
    x: d.sugar_g,
    y: d.calories,
    category: d.category,
    name: d.name,
    prep: d.prep
  }));
  
  // Categorize scatter points by unique category to render multiple series (enables color coding in legend)
  const scatterDatasets = categories.map((cat, idx) => {
    const pts = scatterPoints.filter(p => p.category === cat);
    return {
      label: cat,
      data: pts,
      backgroundColor: palette[idx % palette.length],
      pointRadius: 5,
      pointHoverRadius: 7
    };
  });

  if (state.charts.sugarScatter) {
    state.charts.sugarScatter.data.datasets = scatterDatasets;
    state.charts.sugarScatter.update();
  } else {
    const ctx = document.getElementById('chart-sugar-scatter').getContext('2d');
    state.charts.sugarScatter = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: scatterDatasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }, // Hide cluttered scatter legend
          tooltip: {
            callbacks: {
              label: (context) => {
                const pt = context.raw;
                return ` ${pt.name} (${pt.prep}): ${pt.x}g Sugar, ${pt.y} kcal`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Sugar (g)', color: labelColor },
            grid: { color: gridColor },
            ticks: { color: labelColor }
          },
          y: {
            title: { display: true, text: 'Calories (kcal)', color: labelColor },
            grid: { color: gridColor },
            ticks: { color: labelColor }
          }
        }
      }
    });
  }
}

// ----------------------------------------------------
// GRANULAR RECORD TABLES WITH SORT & PAGINATION
// ----------------------------------------------------
function setupTableEvents() {
  // Sort Headers click
  elements.bevTableHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort');
      toggleTableSort('bev', col);
    });
  });

  elements.storeTableHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort');
      toggleTableSort('store', col);
    });
  });

  // Table Search box
  elements.tableBevSearch.addEventListener('input', () => {
    state.pagination.bev.page = 1;
    updateBeveragesDashboard();
  });
  
  elements.tableStoreSearch.addEventListener('input', () => {
    state.pagination.store.page = 1;
    updateStoresDashboard();
  });

  // Page Size Selector
  elements.bevPageSize.addEventListener('change', (e) => {
    state.pagination.bev.pageSize = parseInt(e.target.value);
    state.pagination.bev.page = 1;
    updateBeveragesDashboard();
  });

  elements.storePageSize.addEventListener('change', (e) => {
    state.pagination.store.pageSize = parseInt(e.target.value);
    state.pagination.store.page = 1;
    updateStoresDashboard();
  });
}

function toggleTableSort(tableType, col) {
  const current = state.sorting[tableType];
  if (current.column === col) {
    current.direction = current.direction === 'asc' ? 'desc' : 'asc';
  } else {
    current.column = col;
    current.direction = 'asc';
  }
  
  // Visual indicators update
  const headers = tableType === 'bev' ? elements.bevTableHeaders : elements.storeTableHeaders;
  headers.forEach(h => {
    const icon = h.querySelector('.sort-icon');
    if (icon) icon.className = 'sort-icon'; // Reset
  });
  
  const activeHeader = [...headers].find(h => h.getAttribute('data-sort') === col);
  if (activeHeader) {
    const activeIcon = activeHeader.querySelector('.sort-icon');
    if (activeIcon) {
      activeIcon.className = current.direction === 'asc' ? 'sort-icon lucide-arrow-up' : 'sort-icon lucide-arrow-down';
      // Re-create icons for that specific header
      lucide.createIcons({attrs: {class: ['sort-icon']}});
    }
  }

  if (tableType === 'bev') {
    updateBeveragesDashboard();
  } else {
    updateStoresDashboard();
  }
}

function renderBeverageTable(data) {
  // Apply Table search
  const tableSearch = elements.tableBevSearch.value.trim().toLowerCase();
  let tableData = [...data];
  if (tableSearch) {
    tableData = tableData.filter(d => 
      d.name.toLowerCase().includes(tableSearch) ||
      d.category.toLowerCase().includes(tableSearch) ||
      d.prep.toLowerCase().includes(tableSearch)
    );
  }
  
  // Apply Table Sort
  const sort = state.sorting.bev;
  tableData.sort((a, b) => {
    let valA = a[sort.column];
    let valB = b[sort.column];
    
    if (typeof valA === 'string') {
      return sort.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return sort.direction === 'asc' ? valA - valB : valB - valA;
    }
  });

  // Apply Pagination
  const total = tableData.length;
  const pg = state.pagination.bev;
  const start = (pg.page - 1) * pg.pageSize;
  const paginatedData = tableData.slice(start, start + pg.pageSize);
  
  // Render table rows
  const tbody = elements.bevTableBody;
  tbody.innerHTML = '';
  
  if (paginatedData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No matching beverage records found.</td></tr>`;
    elements.bevPaginationInfo.textContent = "Showing 0-0 of 0 items";
    elements.bevPaginationControls.innerHTML = '';
    return;
  }
  
  paginatedData.forEach(d => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${d.category}</td>
      <td><strong>${d.name}</strong></td>
      <td>${d.prep}</td>
      <td>${d.calories}</td>
      <td>${d.sugar_g}</td>
      <td>${d.caffeine_display}</td>
      <td>${d.protein_g}</td>
    `;
    tbody.appendChild(row);
  });
  
  // Update pagination UI
  const end = Math.min(start + pg.pageSize, total);
  elements.bevPaginationInfo.textContent = `Showing ${start + 1}-${end} of ${total} items`;
  
  renderPaginationControls('bev', total, pg);
}

function renderPaginationControls(type, total, pg) {
  const totalPages = Math.ceil(total / pg.pageSize);
  const container = elements[`${type}PaginationControls`];
  container.innerHTML = '';
  
  if (totalPages <= 1) return;
  
  // Prev button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.disabled = pg.page === 1;
  prevBtn.innerHTML = `<i data-lucide="chevron-left" class="page-icon"></i>`;
  prevBtn.addEventListener('click', () => {
    pg.page--;
    if (type === 'bev') updateBeveragesDashboard(); else updateStoresDashboard();
  });
  container.appendChild(prevBtn);
  
  // Page number button arrays
  let startPage = Math.max(1, pg.page - 1);
  let endPage = Math.min(totalPages, startPage + 2);
  if (endPage - startPage < 2) {
    startPage = Math.max(1, endPage - 2);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `page-btn ${i === pg.page ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => {
      pg.page = i;
      if (type === 'bev') updateBeveragesDashboard(); else updateStoresDashboard();
    });
    container.appendChild(pageBtn);
  }
  
  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.disabled = pg.page === totalPages;
  nextBtn.innerHTML = `<i data-lucide="chevron-right" class="page-icon"></i>`;
  nextBtn.addEventListener('click', () => {
    pg.page++;
    if (type === 'bev') updateBeveragesDashboard(); else updateStoresDashboard();
  });
  container.appendChild(nextBtn);
  
  // Re-draw lucide icons
  lucide.createIcons({attrs: {class: ['page-icon']}});
}

// ----------------------------------------------------
// GLOBAL STORES DASHBOARD: FILTERING & RENDERING
// ----------------------------------------------------
function getFilteredStores() {
  if (state.data.storesLocations.length === 0) return [];
  
  return state.data.storesLocations.filter(store => {
    // Index mapping: 0=Name, 1=City, 2=Country, 3=OwnershipType, 4=Lat, 5=Lon
    
    // Global filter search
    if (state.filters.search) {
      const matchSearch = store[0].toLowerCase().includes(state.filters.search) || 
                          store[1].toLowerCase().includes(state.filters.search) ||
                          store[2].toLowerCase().includes(state.filters.search);
      if (!matchSearch) return false;
    }
    
    // Country filter
    if (state.filters.countries.length > 0 && !state.filters.countries.includes(store[2])) {
      return false;
    }
    
    return true;
  });
}

function updateStoresDashboard() {
  const filtered = getFilteredStores();
  
  // Update header text counter
  elements.quickCountText.textContent = `${filtered.length.toLocaleString()} Stores Filtered`;
  
  // Calculate and update KPIs
  updateStoresKPIs(filtered);
  
  // Render granular tables
  renderStoreTable(filtered);
  
  // Update store visual charts
  renderStoreCharts(filtered);
  
  // Update Leaflet map overlays
  updateMapOverlays(filtered);
}

function updateStoresKPIs(data) {
  const count = data.length;
  elements.kpiStoreCount.textContent = count.toLocaleString();
  
  if (count === 0) {
    elements.kpiStoreCountries.textContent = '0';
    elements.kpiStoreCities.textContent = '0';
    elements.kpiStoreOwnership.textContent = 'N/A';
    return;
  }
  
  // Distinct countries/cities
  const countries = new Set();
  const cities = new Set();
  const ownershipMap = {};
  
  data.forEach(store => {
    countries.add(store[2]);
    cities.add(store[1]);
    ownershipMap[store[3]] = (ownershipMap[store[3]] || 0) + 1;
  });
  
  elements.kpiStoreCountries.textContent = countries.size.toLocaleString();
  elements.kpiStoreCities.textContent = cities.size.toLocaleString();
  
  // Find top ownership type
  let topType = "N/A";
  let maxCount = 0;
  Object.entries(ownershipMap).forEach(([type, c]) => {
    if (c > maxCount) {
      maxCount = c;
      topType = type;
    }
  });
  elements.kpiStoreOwnership.textContent = topType;
}

function renderStoreCharts(data) {
  const isDark = state.theme === 'dark';
  const labelColor = isDark ? '#adb5bd' : '#495057';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // 1. Top Countries by Store Count
  const countryCounts = {};
  data.forEach(s => {
    countryCounts[s[2]] = (countryCounts[s[2]] || 0) + 1;
  });
  
  const sortedCountries = Object.entries(countryCounts)
                               .sort((a, b) => b[1] - a[1])
                               .slice(0, 10);
  
  if (state.charts.topCountries) {
    state.charts.topCountries.data.labels = sortedCountries.map(x => x[0]);
    state.charts.topCountries.data.datasets[0].data = sortedCountries.map(x => x[1]);
    state.charts.topCountries.update();
  } else {
    const ctx = document.getElementById('chart-top-countries').getContext('2d');
    state.charts.topCountries = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedCountries.map(x => x[0]),
        datasets: [{
          label: 'Number of Stores',
          data: sortedCountries.map(x => x[1]),
          backgroundColor: '#00704a',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: labelColor }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: labelColor }
          }
        }
      }
    });
  }

  // 2. Store Ownership Type distribution
  const ownershipCounts = {};
  data.forEach(s => {
    ownershipCounts[s[3]] = (ownershipCounts[s[3]] || 0) + 1;
  });
  
  const ownLabels = Object.keys(ownershipCounts);
  const ownData = Object.values(ownershipCounts);
  const colors = ['#00704a', '#f2994a', '#2d9cdb', '#eb5757'];
  
  if (state.charts.storeOwnership) {
    state.charts.storeOwnership.data.labels = ownLabels;
    state.charts.storeOwnership.data.datasets[0].data = ownData;
    state.charts.storeOwnership.update();
  } else {
    const ctx = document.getElementById('chart-store-ownership').getContext('2d');
    state.charts.storeOwnership = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ownLabels,
        datasets: [{
          data: ownData,
          backgroundColor: colors.slice(0, ownLabels.length),
          borderWidth: isDark ? 2 : 1,
          borderColor: isDark ? '#1c2123' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: labelColor, boxWidth: 10 }
          }
        },
        cutout: '70%'
      }
    });
  }
}

function renderStoreTable(data) {
  // Apply Table Search
  const tableSearch = elements.tableStoreSearch.value.trim().toLowerCase();
  let tableData = [...data];
  if (tableSearch) {
    tableData = tableData.filter(d => 
      d[0].toLowerCase().includes(tableSearch) ||
      d[1].toLowerCase().includes(tableSearch) ||
      d[2].toLowerCase().includes(tableSearch) ||
      d[3].toLowerCase().includes(tableSearch)
    );
  }
  
  // Apply Table Sort
  const sort = state.sorting.store;
  const colIdx = parseInt(sort.column);
  tableData.sort((a, b) => {
    let valA = a[colIdx];
    let valB = b[colIdx];
    
    if (typeof valA === 'string') {
      return sort.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return sort.direction === 'asc' ? valA - valB : valB - valA;
    }
  });

  // Apply Pagination
  const total = tableData.length;
  const pg = state.pagination.store;
  const start = (pg.page - 1) * pg.pageSize;
  const paginatedData = tableData.slice(start, start + pg.pageSize);
  
  // Render table rows
  const tbody = elements.storeTableBody;
  tbody.innerHTML = '';
  
  if (paginatedData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No matching store records found.</td></tr>`;
    elements.storePaginationInfo.textContent = "Showing 0-0 of 0 items";
    elements.storePaginationControls.innerHTML = '';
    return;
  }
  
  paginatedData.forEach(d => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${d[0]}</strong></td>
      <td>${d[1]}</td>
      <td>${d[2]}</td>
      <td>${d[3]}</td>
      <td>${d[4].toFixed(4)}</td>
      <td>${d[5].toFixed(4)}</td>
    `;
    tbody.appendChild(row);
  });
  
  // Update pagination label
  const end = Math.min(start + pg.pageSize, total);
  elements.storePaginationInfo.textContent = `Showing ${start + 1}-${end} of ${total} items`;
  
  renderPaginationControls('store', total, pg);
}

// ----------------------------------------------------
// INTERACTIVE LEAFLET.JS MAP MANAGER
// ----------------------------------------------------
function initMap() {
  // Center world coordinates
  state.map = L.map('map', {
    center: [25, 0],
    zoom: 2,
    zoomControl: true,
    maxBounds: [[-85, -180], [85, 180]]
  });
  
  // Map Fit Bounds button event
  elements.mapFitWorld.addEventListener('click', () => {
    state.map.setView([25, 0], 2);
  });

  // Add initial tiles layer
  updateMapTileStyle(state.theme);
  
  // Initialize dynamic layer groups
  state.mapMarkersLayer = L.canvas({ padding: 0.5 }).addTo(state.map);
  state.mapCountriesLayer = L.layerGroup().addTo(state.map);
  
  // Trigger initial overlay rendering
  const filtered = getFilteredStores();
  updateMapOverlays(filtered);
  
  // Add dynamic rendering listener for zooms (toggle bubble clusters vs store circles)
  state.map.on('zoomend', () => {
    updateMapOverlays(getFilteredStores());
  });
}

function updateMapTileStyle(theme) {
  // Remove existing tile layer if present
  state.map.eachLayer(layer => {
    if (layer instanceof L.TileLayer) {
      state.map.removeLayer(layer);
    }
  });

  // Choose sleek CartoDB tiles
  const isDark = theme === 'dark';
  const tileUrl = isDark 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  L.tileLayer(tileUrl, {
    attribution: attribution,
    maxZoom: 16,
    minZoom: 1.8
  }).addTo(state.map);
}

function updateMapOverlays(data) {
  if (!state.map) return;
  
  // Clear existing graphics
  state.mapCountriesLayer.clearLayers();
  
  // Remove individual circles drawn directly on canvas
  state.map.eachLayer(layer => {
    if (layer instanceof L.CircleMarker && layer !== state.map.options.crs) {
      state.map.removeLayer(layer);
    }
  });

  const zoom = state.map.getZoom();
  const countryFilterActive = state.filters.countries.length > 0;
  
  // HIGH-PERFORMANCE RENDERING LOGIC:
  // If zoomed out (zoom < 5) and NO specific country filtered, draw bubble aggregates by country.
  // If zoomed in (zoom >= 5) or a specific country is filtered, render individual store circle markers.
  if (zoom < 5 && !countryFilterActive) {
    renderCountryAggregatesOnMap(data);
  } else {
    renderIndividualStoresOnMap(data);
  }
}

function renderCountryAggregatesOnMap(data) {
  // Aggregate data by country
  const counts = {};
  data.forEach(store => {
    counts[store[2]] = (counts[store[2]] || 0) + 1;
  });
  
  // Render bubbles
  Object.entries(counts).forEach(([country, count]) => {
    const coords = COUNTRY_CENTROIDS[country];
    if (!coords) return; // Skip unknown centroids
    
    // Scale bubble size logarithmically/proportionally
    const radius = Math.max(6, Math.min(45, Math.sqrt(count) * 0.4));
    
    const circle = L.circleMarker(coords, {
      radius: radius,
      fillColor: '#00704a',
      fillOpacity: 0.75,
      color: '#ffffff',
      weight: 1.5,
      className: 'country-bubble'
    });
    
    // Popup
    circle.bindPopup(`
      <div style="font-family: var(--font-body); padding: 4px;">
        <h4 style="margin:0 0 4px 0; font-family: var(--font-display); font-size:14px;">${country}</h4>
        <span style="font-size:12px; color: var(--text-muted);"><strong>${count.toLocaleString()}</strong> stores</span>
        <div style="font-size:10px; color:#00704a; margin-top:4px; font-weight:600;">Click bubble to focus</div>
      </div>
    `);
    
    // Click events to zoom into the country
    circle.on('click', () => {
      state.map.setView(coords, 5);
      // Filter dashboard values to this country
      // Mock toggle country filter triggers automatically
      const countryOptions = elements.countryOptions.querySelectorAll('.dropdown-item');
      const itemEl = [...countryOptions].find(x => x.getAttribute('data-value') === country);
      if (itemEl && !state.filters.countries.includes(country)) {
        itemEl.click();
      }
    });
    
    circle.on('mouseover', function () {
      this.setStyle({ fillOpacity: 0.9, fillColor: '#00aa70' });
    });
    circle.on('mouseout', function () {
      this.setStyle({ fillOpacity: 0.75, fillColor: '#00704a' });
    });

    circle.addTo(state.mapCountriesLayer);
  });
}

function renderIndividualStoresOnMap(data) {
  // Limit rendered markers to 12,000 for stability, even on high-performance Canvas
  const maxMarkers = 12000;
  const subset = data.slice(0, maxMarkers);
  
  subset.forEach(store => {
    // 0=Name, 1=City, 2=Country, 3=OwnershipType, 4=Lat, 5=Lon
    const coords = [store[4], store[5]];
    
    const marker = L.circleMarker(coords, {
      renderer: state.mapMarkersLayer,
      radius: 3.5,
      fillColor: '#00704a',
      fillOpacity: 0.75,
      color: '#ffffff',
      weight: 0.8
    });
    
    marker.bindPopup(`
      <div style="font-family: var(--font-body); font-size: 11px;">
        <strong style="font-size:12px; font-family:var(--font-display); display:block; margin-bottom: 2px;">${store[0]}</strong>
        <span>City: ${store[1]}, ${store[2]}</span><br/>
        <span style="color:#00704a; font-weight:600; display:block; margin-top:2px;">${store[3]}</span>
      </div>
    `);
    
    marker.addTo(state.map);
  });
  
  // If subset is smaller, auto fit coordinates boundaries
  if (data.length > 0 && data.length < 500) {
    const latlngs = data.map(s => [s[4], s[5]]);
    state.map.fitBounds(latlngs, { padding: [30, 30] });
  }
}

// ----------------------------------------------------
// CUSTOM DRINK BUILDER CONTROLLER
// ----------------------------------------------------
function setupBuilderEvents() {
  // Category change
  elements.builderCategory.addEventListener('change', (e) => {
    const cat = e.target.value;
    state.builder.category = cat;
    
    // Reset dependency controls
    elements.builderBeverage.innerHTML = '<option value="">-- Choose Beverage --</option>';
    elements.builderBeverage.disabled = !cat;
    elements.builderPrep.innerHTML = '<option value="">-- Select Drink First --</option>';
    elements.builderPrep.disabled = true;
    
    if (cat) {
      const drinks = [...new Set(state.data.drinks.filter(d => d.category === cat).map(d => d.name))].sort();
      drinks.forEach(dr => {
        const opt = document.createElement('option');
        opt.value = dr;
        opt.textContent = dr;
        elements.builderBeverage.appendChild(opt);
      });
    }
    
    updateBuilderCalculations();
  });
  
  // Beverage change
  elements.builderBeverage.addEventListener('change', (e) => {
    const bev = e.target.value;
    state.builder.beverage = bev;
    
    // Reset prep selector
    elements.builderPrep.innerHTML = '<option value="">-- Select Prep/Size --</option>';
    elements.builderPrep.disabled = !bev;
    
    if (bev) {
      const preps = state.data.drinks.filter(d => d.category === state.builder.category && d.name === bev);
      preps.forEach(pr => {
        const opt = document.createElement('option');
        opt.value = pr.prep;
        opt.textContent = pr.prep;
        elements.builderPrep.appendChild(opt);
      });
    }
    
    updateBuilderCalculations();
  });
  
  // Prep change
  elements.builderPrep.addEventListener('change', (e) => {
    state.builder.prep = e.target.value;
    updateBuilderCalculations();
  });
  
  // Add-on switches
  const addons = ['shot', 'whip', 'vanilla', 'caramel', 'protein'];
  addons.forEach(add => {
    elements[`addon${add.charAt(0).toUpperCase() + add.slice(1)}`].addEventListener('change', (e) => {
      state.builder.addons[add] = e.target.checked;
      updateBuilderCalculations();
    });
  });
  
  // Reset Configurator
  elements.builderResetBtn.addEventListener('click', resetDrinkBuilder);
}

function resetDrinkBuilder() {
  state.builder.category = '';
  state.builder.beverage = '';
  state.builder.prep = '';
  Object.keys(state.builder.addons).forEach(k => state.builder.addons[k] = false);
  
  elements.builderCategory.value = '';
  elements.builderBeverage.innerHTML = '<option value="">-- Choose Category First --</option>';
  elements.builderBeverage.disabled = true;
  elements.builderPrep.innerHTML = '<option value="">-- Select Drink First --</option>';
  elements.builderPrep.disabled = true;
  
  // Uncheck checkboxes
  elements.addonShot.checked = false;
  elements.addonWhip.checked = false;
  elements.addonVanilla.checked = false;
  elements.addonCaramel.checked = false;
  elements.addonProtein.checked = false;
  
  updateBuilderCalculations();
}

function updateBuilderDashboard() {
  // Populate category options if empty
  if (elements.builderCategory.options.length <= 1 && state.data.drinks.length > 0) {
    const categories = [...new Set(state.data.drinks.map(d => d.category))].sort();
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      elements.builderCategory.appendChild(opt);
    });
  }
  
  updateBuilderCalculations();
}

function updateBuilderCalculations() {
  const b = state.builder;
  
  // Find baseline drink item matching criteria
  let drink = null;
  if (b.category && b.beverage && b.prep) {
    drink = state.data.drinks.find(d => 
      d.category === b.category && d.name === b.beverage && d.prep === b.prep
    );
  }
  
  // Define default values
  let cal = 0, fat = 0, satfat = 0, transfat = 0, chol = 0, sod = 0, carb = 0, fib = 0, sug = 0, prot = 0;
  let vitA = 0, vitC = 0, calcium = 0, iron = 0;
  let caffeine = 0;
  let isVaries = false;
  
  if (drink) {
    cal = drink.calories;
    fat = drink.fat_g;
    satfat = drink.sat_fat_g;
    transfat = drink.trans_fat_g;
    chol = drink.cholesterol_mg;
    sod = drink.sodium_mg;
    carb = drink.carbs_g;
    fib = drink.fiber_g;
    sug = drink.sugar_g;
    prot = drink.protein_g;
    vitA = drink.vitamin_a_pct;
    vitC = drink.vitamin_c_pct;
    calcium = drink.calcium_pct;
    iron = drink.iron_pct;
    caffeine = drink.caffeine_mg;
    isVaries = drink.caffeine_varies;
    
    elements.nfDrinkName.textContent = drink.name;
    elements.nfPrepName.textContent = drink.prep;
  } else {
    elements.nfDrinkName.textContent = "Select a Beverage";
    elements.nfPrepName.textContent = "Customize sizes & milk";
  }
  
  // Apply Add-ons Modifiers
  if (b.addons.shot) {
    caffeine += 75;
    cal += 5;
  }
  if (b.addons.whip) {
    cal += 110;
    fat += 11;
    satfat += 7;
    sug += 1;
    chol += 35;
    sod += 15;
  }
  if (b.addons.vanilla) {
    cal += 40;
    carb += 10;
    sug += 10;
  }
  if (b.addons.caramel) {
    cal += 30;
    fat += 2;
    satfat += 1;
    carb += 5;
    sug += 5;
    sod += 20;
  }
  if (b.addons.protein) {
    cal += 45;
    carb += 2;
    sug += 1;
    prot += 9;
    sod += 50;
    calcium += 2; // minor calcium bonus
  }
  
  // Render Values on FDA label
  elements.nfCalories.textContent = cal;
  elements.nfFat.textContent = `${fat.toFixed(1)}g`;
  elements.nfFatDv.textContent = `${Math.round((fat / RDI.fat) * 100)}%`;
  elements.nfSatfat.textContent = `${satfat.toFixed(1)}g`;
  elements.nfSatfatDv.textContent = `${Math.round((satfat / RDI.satFat) * 100)}%`;
  elements.nfTransfat.textContent = `${transfat.toFixed(1)}g`;
  elements.nfCholesterol.textContent = `${chol}mg`;
  elements.nfCholesterolDv.textContent = `${Math.round((chol / RDI.cholesterol) * 100)}%`;
  elements.nfSodium.textContent = `${sod}mg`;
  elements.nfSodiumDv.textContent = `${Math.round((sod / RDI.sodium) * 100)}%`;
  elements.nfCarbs.textContent = `${carb}g`;
  elements.nfCarbsDv.textContent = `${Math.round((carb / RDI.carbs) * 100)}%`;
  elements.nfFiber.textContent = `${fib}g`;
  elements.nfFiberDv.textContent = `${Math.round((fib / RDI.fiber) * 100)}%`;
  elements.nfSugar.textContent = `${sug}g`;
  elements.nfProtein.textContent = `${prot.toFixed(1)}g`;
  elements.nfProteinDv.textContent = `${Math.round((prot / RDI.protein) * 100)}%`;
  elements.nfVitA.textContent = `${Math.round(vitA)}%`;
  elements.nfVitC.textContent = `${Math.round(vitC)}%`;
  elements.nfCalcium.textContent = `${Math.round(calcium)}%`;
  elements.nfIron.textContent = `${Math.round(iron)}%`;
  
  // Caffeine display on FDA Label
  if (isVaries && !b.addons.shot) {
    elements.nfCaffeine.textContent = "Varies (approx 40mg)";
  } else {
    elements.nfCaffeine.textContent = `${caffeine} mg`;
  }
  
  // Update Health Grades & progress tracks
  updateHealthGradesAndRDI(cal, fat, satfat, carb, sug, caffeine);
}

function updateHealthGradesAndRDI(cal, fat, satfat, carb, sug, caffeine) {
  // Update RDI Progress Bars
  const calPct = Math.min(100, (cal / RDI.calories) * 100);
  const sugarPct = Math.min(100, (sug / RDI.sugar) * 100);
  const caffeinePct = Math.min(100, (caffeine / 400) * 100);
  
  elements.rdiBarCalories.style.width = `${calPct}%`;
  elements.rdiBarSugar.style.width = `${sugarPct}%`;
  elements.rdiBarCaffeine.style.width = `${caffeinePct}%`;
  
  elements.rdiPctCalories.textContent = `${calPct.toFixed(0)}% of RDI`;
  elements.rdiPctSugar.textContent = `${sugarPct.toFixed(0)}% of recommendation`;
  elements.rdiPctCaffeine.textContent = `${caffeinePct.toFixed(0)}% of safe limit`;

  // Calculate Health Grade Score
  // Baseline 100 points
  let score = 100;
  
  // Deductions
  if (cal > 250) score -= 15;
  if (cal > 400) score -= 15;
  if (sug > 25) score -= 20;
  if (sug > 45) score -= 20;
  if (satfat > 4) score -= 10;
  if (satfat > 8) score -= 10;
  if (caffeine > 200) score -= 10;
  
  // Assign letter grade
  let grade = 'A';
  let desc = 'Excellent nutritional profile! Low in sugars, saturated fats and calories.';
  let gradeClass = 'grade-a';
  
  if (score < 50) {
    grade = 'D';
    desc = 'Caution: High calorie, sugar, or saturated fat load. Drink in moderation.';
    gradeClass = 'grade-d';
  } else if (score < 70) {
    grade = 'C';
    desc = 'Moderate nutritional impact. Watch out for high sugars or dairy fats.';
    gradeClass = 'grade-c';
  } else if (score < 88) {
    grade = 'B';
    desc = 'Balanced choice. Good energy content with moderate sugars.';
    gradeClass = 'grade-b';
  }
  
  elements.nfHealthGrade.textContent = grade;
  elements.nfHealthGrade.className = `health-badge ${gradeClass}`;
  elements.nfHealthDesc.textContent = desc;
  
  // Dynamic fun fact select based on values
  let factText = DRINK_FUN_FACTS[Math.floor(Math.random() * DRINK_FUN_FACTS.length)];
  if (caffeine > 150) {
    factText = `Energy alert! This custom drink contains ${caffeine}mg of caffeine, which provides a high boost. The daily recommended limit is 400mg.`;
  } else if (sug > 40) {
    factText = `Did you know? This drink contains ${sug}g of sugar. That exceeds 80% of the WHO daily recommendation for free sugars!`;
  } else if (cal > 350) {
    factText = `Calorie notice: A calorie load of ${cal} kcal is similar to a full snack. Choosing skim milk or fewer syrup pumps can reduce this easily.`;
  }
  elements.builderFactText.textContent = factText;
}
