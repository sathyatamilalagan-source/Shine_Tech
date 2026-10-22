/**
 * SHINE TECH - Advanced Products Catalog Engine (js/products-page.js)
 * Fully featured Flipkart-inspired catalog:
 * - Multi-category selection with product counts
 * - Multi-brand checkboxes with sidebar brand search
 * - Interactive price range slider & quick presets
 * - Star ratings filter & discount % filters
 * - Availability & SHINE Assured filters
 * - Grid / List view mode toggles
 * - Horizontal sort tabs (Relevance, Popularity, Price Low/High, Rating, Discount)
 * - Active filter dismissable chips & clear all
 * - Smooth pagination controls
 * - Mobile bottom sticky filter/sort controls
 */

// Filter & pagination state
const catalogState = {
  category: 'all',
  brands: [],            // Array of selected brand names
  minPrice: 0,
  maxPrice: 250000,
  minRating: 0,
  minDiscount: 0,
  inStockOnly: false,
  shineAssuredOnly: false,
  query: '',
  presetFilter: '',      // 'deals', 'trending', 'featured'
  sort: 'relevance',     // 'relevance', 'popularity', 'price-asc', 'price-desc', 'rating', 'discount'
  viewMode: 'grid',      // 'grid' or 'list'
  currentPage: 1,
  pageSize: 16
};

// URL Query parameter sync
function parseURLParameters() {
  const params = new URLSearchParams(window.location.search);
  
  catalogState.category = params.get('category') || 'all';
  catalogState.query = params.get('q') || params.get('search') || '';
  catalogState.presetFilter = params.get('filter') || '';
  catalogState.sort = params.get('sort') || (catalogState.presetFilter === 'deals' ? 'discount' : 'relevance');
  catalogState.currentPage = parseInt(params.get('page')) || 1;

  const brandParam = params.get('brand');
  if (brandParam) {
    catalogState.brands = brandParam.split(',').filter(Boolean);
  }

  // Pre-sync search bar input
  const searchInput = document.getElementById('searchInput');
  if (searchInput && catalogState.query) {
    searchInput.value = catalogState.query;
  }
}

function updateURLParameters() {
  const params = new URLSearchParams();
  if (catalogState.category !== 'all') params.set('category', catalogState.category);
  if (catalogState.query) params.set('q', catalogState.query);
  if (catalogState.presetFilter) params.set('filter', catalogState.presetFilter);
  if (catalogState.brands.length > 0) params.set('brand', catalogState.brands.join(','));
  if (catalogState.sort !== 'relevance') params.set('sort', catalogState.sort);
  if (catalogState.currentPage > 1) params.set('page', catalogState.currentPage);

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

// Master initialization
function initProductsCatalog() {
  if (typeof SHINE_PRODUCTS === 'undefined' || typeof SHINE_CATALOG === 'undefined') {
    setTimeout(initProductsCatalog, 50);
    return;
  }

  parseURLParameters();
  renderSidebarFilters();
  applyFiltersAndRender(false);
  setupCatalogEventListeners();
}

// Render dynamic sidebar filters (Categories, Brands, Price, Ratings)
function renderSidebarFilters() {
  renderCategoryFilterList();
  renderBrandFilterList();
  renderPriceFilter();
  renderActiveSortTab();
}

function renderCategoryFilterList() {
  const container = document.getElementById('categoryFilterList');
  if (!container || typeof SHINE_CATEGORIES === 'undefined') return;

  const totalCount = SHINE_PRODUCTS.length;

  container.innerHTML = `
    <div class="category-filter-item ${catalogState.category === 'all' ? 'active' : ''}" 
         onclick="setCatalogCategory('all')">
      <span><i class="fa-solid fa-layer-group" style="margin-right: 6px;"></i> All Categories</span>
      <span class="cat-count">${totalCount}</span>
    </div>
    ${SHINE_CATEGORIES.map(cat => `
      <div class="category-filter-item ${catalogState.category === cat.id ? 'active' : ''}" 
           onclick="setCatalogCategory('${cat.id}')">
        <span><i class="${cat.icon}" style="margin-right: 6px;"></i> ${cat.name}</span>
        <span class="cat-count">${cat.count}</span>
      </div>
    `).join('')}
  `;
}

function renderBrandFilterList(searchTerm = '') {
  const container = document.getElementById('brandFilterList');
  if (!container || typeof SHINE_PRODUCTS === 'undefined') return;

  // Extract all unique brands within the current category (or entire catalog)
  const basePool = catalogState.category === 'all'
    ? SHINE_PRODUCTS
    : SHINE_PRODUCTS.filter(p => p.category.toLowerCase() === catalogState.category.toLowerCase());

  const brandCounts = {};
  basePool.forEach(p => {
    brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
  });

  let brands = Object.keys(brandCounts).sort((a, b) => a.localeCompare(b));

  if (searchTerm) {
    const s = searchTerm.toLowerCase();
    brands = brands.filter(b => b.toLowerCase().includes(s));
  }

  if (brands.length === 0) {
    container.innerHTML = `<div style="font-size: 0.8rem; color: #94A3B8; padding: 6px 0;">No matching brands</div>`;
    return;
  }

  container.innerHTML = brands.map(brand => {
    const isChecked = catalogState.brands.includes(brand);
    return `
      <label class="filter-checkbox-label">
        <input type="checkbox" value="${escapeHtml(brand)}" ${isChecked ? 'checked' : ''} 
               onchange="toggleBrandFilter('${escapeHtml(brand)}')" />
        <span>${brand}</span>
        <span class="brand-count">(${brandCounts[brand]})</span>
      </label>
    `;
  }).join('');
}

function renderPriceFilter() {
  const slider = document.getElementById('priceSlider');
  const minInput = document.getElementById('priceMinInput');
  const maxInput = document.getElementById('priceMaxInput');

  if (slider) slider.value = catalogState.maxPrice;
  if (minInput) minInput.value = catalogState.minPrice;
  if (maxInput) maxInput.value = catalogState.maxPrice;
}

function setCatalogCategory(catId) {
  catalogState.category = catId;
  catalogState.brands = []; // Reset selected brands when category changes
  catalogState.currentPage = 1;
  renderCategoryFilterList();
  renderBrandFilterList();
  applyFiltersAndRender();
}

function toggleBrandFilter(brand) {
  const idx = catalogState.brands.indexOf(brand);
  if (idx > -1) {
    catalogState.brands.splice(idx, 1);
  } else {
    catalogState.brands.push(brand);
  }
  catalogState.currentPage = 1;
  applyFiltersAndRender();
}

function setPricePreset(min, max, buttonEl = null) {
  catalogState.minPrice = min;
  catalogState.maxPrice = max;
  catalogState.currentPage = 1;

  document.querySelectorAll('.price-pill-btn').forEach(btn => btn.classList.remove('active'));
  if (buttonEl) buttonEl.classList.add('active');

  renderPriceFilter();
  applyFiltersAndRender();
}

function setMinRating(rating) {
  catalogState.minRating = parseFloat(rating) || 0;
  catalogState.currentPage = 1;
  applyFiltersAndRender();
}

function setMinDiscount(discount) {
  catalogState.minDiscount = parseInt(discount) || 0;
  catalogState.currentPage = 1;
  applyFiltersAndRender();
}

function setSortOrder(sortVal) {
  catalogState.sort = sortVal;
  catalogState.currentPage = 1;
  renderActiveSortTab();
  applyFiltersAndRender();
}

function renderActiveSortTab() {
  document.querySelectorAll('.sort-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-sort') === catalogState.sort) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const sortSelect = document.getElementById('mobileSortSelect');
  if (sortSelect) sortSelect.value = catalogState.sort;
}

function setViewMode(mode) {
  catalogState.viewMode = mode;
  document.querySelectorAll('.view-mode-btn').forEach(btn => {
    if (btn.getAttribute('data-mode') === mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderProductsDisplay();
}

// Core Filtering Logic
function getFilteredAndSortedProducts() {
  if (typeof SHINE_PRODUCTS === 'undefined') return [];

  let list = [...SHINE_PRODUCTS];

  // 1. Category Filter
  if (catalogState.category && catalogState.category !== 'all') {
    list = list.filter(p => p.category.toLowerCase() === catalogState.category.toLowerCase());
  }

  // 2. Preset Filter (Deals, Trending, Featured)
  if (catalogState.presetFilter === 'deals') {
    list = list.filter(p => p.dealOfDay);
  } else if (catalogState.presetFilter === 'trending') {
    list = list.filter(p => p.trending);
  } else if (catalogState.presetFilter === 'featured') {
    list = list.filter(p => p.featured);
  }

  // 3. Search Query Filter
  if (catalogState.query) {
    const q = catalogState.query.toLowerCase().trim();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      (p.specs && p.specs.some(s => s.toLowerCase().includes(q)))
    );
  }

  // 4. Brands Filter (Multi-brand checkbox selection)
  if (catalogState.brands.length > 0) {
    const selectedLower = catalogState.brands.map(b => b.toLowerCase());
    list = list.filter(p => selectedLower.includes(p.brand.toLowerCase()));
  }

  // 5. Price Range Filter
  list = list.filter(p => p.price >= catalogState.minPrice && p.price <= catalogState.maxPrice);

  // 6. Rating Filter
  if (catalogState.minRating > 0) {
    list = list.filter(p => p.rating >= catalogState.minRating);
  }

  // 7. Discount Filter
  if (catalogState.minDiscount > 0) {
    list = list.filter(p => p.discount >= catalogState.minDiscount);
  }

  // 8. In-Stock Filter
  if (catalogState.inStockOnly) {
    list = list.filter(p => p.inStock);
  }

  // 9. SHINE Assured Filter
  if (catalogState.shineAssuredOnly) {
    list = list.filter(p => p.badge === 'SHINE Assured' || p.rating >= 4.6);
  }

  // 10. Sorting
  switch (catalogState.sort) {
    case 'popularity':
      list.sort((a, b) => b.ratingCount - a.ratingCount);
      break;
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      list.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount);
      break;
    case 'discount':
      list.sort((a, b) => b.discount - a.discount);
      break;
    case 'newest':
      list.sort((a, b) => b.id.localeCompare(a.id));
      break;
    case 'relevance':
    default:
      if (catalogState.query) {
        const q = catalogState.query.toLowerCase().trim();
        list.sort((a, b) => {
          const aExact = a.name.toLowerCase().startsWith(q) ? 1 : 0;
          const bExact = b.name.toLowerCase().startsWith(q) ? 1 : 0;
          return bExact - aExact;
        });
      }
      break;
  }

  return list;
}

// Master Render Invocation
let currentFilteredList = [];

function applyFiltersAndRender(updateURL = true) {
  if (updateURL) updateURLParameters();

  currentFilteredList = getFilteredAndSortedProducts();
  renderCatalogHeaders();
  renderActiveFilterChips();
  renderProductsDisplay();
  renderPagination();
}

function renderCatalogHeaders() {
  const titleEl = document.getElementById('catalogPageHeading');
  const countEl = document.getElementById('catalogResultCount');
  const crumbEl = document.getElementById('catalogCategoryCrumb');

  const total = currentFilteredList.length;

  if (countEl) {
    countEl.textContent = `Showing ${total === 0 ? 0 : 1}–${Math.min(catalogState.pageSize, total)} of ${total} products`;
  }

  let heading = 'All Electronics & Hardware';
  let crumbName = 'All Products';

  if (catalogState.category !== 'all' && typeof SHINE_CATEGORIES !== 'undefined') {
    const cat = SHINE_CATEGORIES.find(c => c.id === catalogState.category);
    if (cat) {
      heading = cat.banner || cat.name;
      crumbName = cat.name;
    }
  } else if (catalogState.query) {
    heading = `Results for "${catalogState.query}"`;
    crumbName = `Search: "${catalogState.query}"`;
  } else if (catalogState.presetFilter === 'deals') {
    heading = '⚡ Flash Deals of the Day';
    crumbName = 'Deals';
  } else if (catalogState.presetFilter === 'trending') {
    heading = '🔥 Trending Electronics';
    crumbName = 'Trending';
  }

  if (titleEl) titleEl.textContent = heading;
  if (crumbEl) crumbEl.textContent = crumbName;

  // Update active count badge in sidebar
  const activeCount = getActiveFilterCount();
  const badge = document.getElementById('activeFilterBadge');
  if (badge) {
    if (activeCount > 0) {
      badge.textContent = activeCount;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

function getActiveFilterCount() {
  let count = 0;
  if (catalogState.category !== 'all') count++;
  if (catalogState.brands.length > 0) count += catalogState.brands.length;
  if (catalogState.minPrice > 0 || catalogState.maxPrice < 250000) count++;
  if (catalogState.minRating > 0) count++;
  if (catalogState.minDiscount > 0) count++;
  if (catalogState.inStockOnly) count++;
  if (catalogState.shineAssuredOnly) count++;
  if (catalogState.query) count++;
  return count;
}

// Render active filter tags / chips
function renderActiveFilterChips() {
  const container = document.getElementById('activeChipsContainer');
  if (!container) return;

  const chips = [];

  if (catalogState.category !== 'all') {
    const cat = typeof SHINE_CATEGORIES !== 'undefined' ? SHINE_CATEGORIES.find(c => c.id === catalogState.category) : null;
    chips.push({
      label: `Category: ${cat ? cat.name : catalogState.category}`,
      onRemove: "setCatalogCategory('all')"
    });
  }

  if (catalogState.query) {
    chips.push({
      label: `Query: "${catalogState.query}"`,
      onRemove: "clearSearchQuery()"
    });
  }

  catalogState.brands.forEach(b => {
    chips.push({
      label: `Brand: ${b}`,
      onRemove: `toggleBrandFilter('${escapeHtml(b)}')`
    });
  });

  if (catalogState.minPrice > 0 || catalogState.maxPrice < 250000) {
    chips.push({
      label: `Price: ${SHINE_CATALOG.formatINR(catalogState.minPrice)} - ${SHINE_CATALOG.formatINR(catalogState.maxPrice)}`,
      onRemove: "resetPriceFilter()"
    });
  }

  if (catalogState.minRating > 0) {
    chips.push({
      label: `Rating: ${catalogState.minRating}★ & above`,
      onRemove: "setMinRating(0)"
    });
  }

  if (catalogState.minDiscount > 0) {
    chips.push({
      label: `Discount: ${catalogState.minDiscount}%+`,
      onRemove: "setMinDiscount(0)"
    });
  }

  if (catalogState.inStockOnly) {
    chips.push({
      label: "In Stock Only",
      onRemove: "toggleInStockFilter(false)"
    });
  }

  if (catalogState.shineAssuredOnly) {
    chips.push({
      label: "SHINE Assured",
      onRemove: "toggleShineAssuredFilter(false)"
    });
  }

  if (chips.length === 0) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  container.style.display = 'flex';
  container.innerHTML = `
    <span class="chips-label">Applied:</span>
    ${chips.map(chip => `
      <div class="filter-chip-item">
        <span>${escapeHtml(chip.label)}</span>
        <i class="fa-solid fa-xmark" onclick="${chip.onRemove}" title="Remove filter"></i>
      </div>
    `).join('')}
    <button class="clear-all-filters-btn" style="margin-left: 8px;" onclick="resetAllFilters()">
      Clear All
    </button>
  `;
}

function clearSearchQuery() {
  catalogState.query = '';
  const input = document.getElementById('searchInput');
  if (input) input.value = '';
  applyFiltersAndRender();
}

function resetPriceFilter() {
  catalogState.minPrice = 0;
  catalogState.maxPrice = 250000;
  renderPriceFilter();
  document.querySelectorAll('.price-pill-btn').forEach(b => b.classList.remove('active'));
  applyFiltersAndRender();
}

function toggleInStockFilter(forceValue = null) {
  catalogState.inStockOnly = forceValue !== null ? forceValue : !catalogState.inStockOnly;
  const cb = document.getElementById('inStockToggle');
  if (cb) cb.checked = catalogState.inStockOnly;
  applyFiltersAndRender();
}

function toggleShineAssuredFilter(forceValue = null) {
  catalogState.shineAssuredOnly = forceValue !== null ? forceValue : !catalogState.shineAssuredOnly;
  const cb = document.getElementById('shineAssuredToggle');
  if (cb) cb.checked = catalogState.shineAssuredOnly;
  applyFiltersAndRender();
}

function resetAllFilters() {
  catalogState.category = 'all';
  catalogState.brands = [];
  catalogState.minPrice = 0;
  catalogState.maxPrice = 250000;
  catalogState.minRating = 0;
  catalogState.minDiscount = 0;
  catalogState.inStockOnly = false;
  catalogState.shineAssuredOnly = false;
  catalogState.query = '';
  catalogState.presetFilter = '';
  catalogState.currentPage = 1;

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  const inStockCb = document.getElementById('inStockToggle');
  if (inStockCb) inStockCb.checked = false;

  const assuredCb = document.getElementById('shineAssuredToggle');
  if (assuredCb) assuredCb.checked = false;

  document.querySelectorAll('input[name="ratingRadio"]').forEach(r => {
    r.checked = r.value === '0';
  });

  document.querySelectorAll('input[name="discountRadio"]').forEach(r => {
    r.checked = r.value === '0';
  });

  renderSidebarFilters();
  applyFiltersAndRender();
  showToast('Filters cleared', 'success');
}

// Render Products Grid / List View
function renderProductsDisplay() {
  const container = document.getElementById('productsDisplayArea');
  if (!container) return;

  const total = currentFilteredList.length;

  if (total === 0) {
    container.className = '';
    container.innerHTML = `
      <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 60px 20px; text-align: center; margin-top: 10px; box-shadow: var(--shadow-sm);">
        <i class="fa-solid fa-box-open" style="font-size: 3.5rem; color: #CBD5E1; margin-bottom: 16px;"></i>
        <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--color-text-main); margin-bottom: 8px;">No matching electronics found</h3>
        <p style="color: var(--color-text-muted); font-size: 0.92rem; max-width: 440px; margin: 0 auto 24px; line-height: 1.5;">
          We couldn't find any products matching your active filters. Try adjusting price limits, rating thresholds, or removing selected brands.
        </p>
        <button class="btn-primary" onclick="resetAllFilters()" style="margin: 0 auto;">
          <i class="fa-solid fa-rotate-left"></i> Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  // Calculate slice for current page
  const startIndex = (catalogState.currentPage - 1) * catalogState.pageSize;
  const endIndex = Math.min(startIndex + catalogState.pageSize, total);
  const pageProducts = currentFilteredList.slice(startIndex, endIndex);

  if (catalogState.viewMode === 'grid') {
    container.className = 'products-grid';
    container.innerHTML = pageProducts.map(p => createProductCardHTML(p)).join('');
  } else {
    // List View (Flipkart-style wide layout)
    container.className = 'products-list-layout';
    container.innerHTML = pageProducts.map(p => createProductListCardHTML(p)).join('');
  }
}

// Product List View Card Template
function createProductListCardHTML(product) {
  const inWish = isInWishlist(product.id);
  const pPath = getPagesPrefix();

  return `
    <div class="product-list-card" data-id="${product.id}">
      <div class="list-card-image-box" style="width: 100%; height: 180px; display: flex; align-items: center; justify-content: center; background: #FAFAFA; border-radius: 6px; padding: 10px; position: relative; overflow: hidden;">
        <a href="${pPath}product-details.html?id=${product.id}" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; overflow: hidden; text-decoration: none;">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" style="max-width: 100%; max-height: 100%; width: auto; height: 100%; object-fit: contain; display: block; margin: 0 auto;"
               onerror="handleImageError(this, '${product.id}')" />
        </a>
      </div>

      <div class="list-card-main-col">
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-blue); text-transform: uppercase;">
          ${product.brand}
        </span>
        <a href="${pPath}product-details.html?id=${product.id}" class="list-card-title">
          ${product.name}
        </a>

        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span class="rating-pill">
            ${product.rating} <i class="fa-solid fa-star"></i>
          </span>
          <span class="rating-count">(${product.ratingCount.toLocaleString('en-IN')} ratings)</span>
          <div class="assured-badge" style="margin-bottom: 0; margin-left: 6px;">
            <i class="fa-solid fa-shield-halved" style="color: var(--color-cyan);"></i>
            <span>SHINE Assured</span>
          </div>
        </div>

        <div class="list-specs-list">
          ${product.specs.slice(0, 4).map(s => `
            <div class="list-spec-item">${s}</div>
          `).join('')}
        </div>
      </div>

      <div class="list-card-side-col">
        <div class="list-price">${SHINE_CATALOG.formatINR(product.price)}</div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span class="list-orig-price">${SHINE_CATALOG.formatINR(product.originalPrice)}</span>
          <span class="list-discount">${product.discount}% off</span>
        </div>
        <div class="list-delivery-tag">
          <i class="fa-solid fa-truck-fast"></i> Free Express Delivery
        </div>

        <div style="display: flex; gap: 8px; width: 100%;">
          <button class="btn-primary" style="flex: 1; padding: 8px 12px; font-size: 0.82rem; justify-content: center;"
                  onclick="addToCart('${product.id}', 1)">
            <i class="fa-solid fa-cart-shopping"></i> Add to Cart
          </button>
          <button class="wishlist-toggle-btn ${inWish ? 'active' : ''}" 
                  data-id="${product.id}"
                  onclick="toggleWishlist('${product.id}', this)"
                  aria-label="Save to wishlist">
            <i class="fa-solid fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Pagination Controls
function renderPagination() {
  const container = document.getElementById('paginationContainer');
  if (!container) return;

  const total = currentFilteredList.length;
  const totalPages = Math.ceil(total / catalogState.pageSize);

  if (totalPages <= 1) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  container.style.display = 'flex';

  let html = `
    <button class="page-btn ${catalogState.currentPage === 1 ? 'disabled' : ''}" 
            onclick="changeCatalogPage(${catalogState.currentPage - 1})" 
            ${catalogState.currentPage === 1 ? 'disabled' : ''} aria-label="Previous Page">
      <i class="fa-solid fa-chevron-left"></i> Previous
    </button>
  `;

  // Page numbering logic
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, current, and neighbours
    if (i === 1 || i === totalPages || (i >= catalogState.currentPage - 1 && i <= catalogState.currentPage + 1)) {
      html += `
        <button class="page-btn ${catalogState.currentPage === i ? 'active' : ''}" 
                onclick="changeCatalogPage(${i})">
          ${i}
        </button>
      `;
    } else if (i === catalogState.currentPage - 2 || i === catalogState.currentPage + 2) {
      html += `<span style="padding: 0 4px; color: #94A3B8;">...</span>`;
    }
  }

  html += `
    <button class="page-btn ${catalogState.currentPage === totalPages ? 'disabled' : ''}" 
            onclick="changeCatalogPage(${catalogState.currentPage + 1})" 
            ${catalogState.currentPage === totalPages ? 'disabled' : ''} aria-label="Next Page">
      Next <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;

  container.innerHTML = html;
}

function changeCatalogPage(newPage) {
  const totalPages = Math.ceil(currentFilteredList.length / catalogState.pageSize);
  if (newPage < 1 || newPage > totalPages) return;

  catalogState.currentPage = newPage;
  updateURLParameters();
  renderProductsDisplay();
  renderPagination();

  // Smooth scroll back to top of products list
  const main = document.querySelector('.catalog-main');
  if (main) {
    main.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Event Listeners for Filters
function setupCatalogEventListeners() {
  // Brand quick search input
  const brandSearch = document.getElementById('brandSearchInput');
  if (brandSearch) {
    brandSearch.addEventListener('input', (e) => {
      renderBrandFilterList(e.target.value.trim());
    });
  }

  // Price slider
  const slider = document.getElementById('priceSlider');
  if (slider) {
    slider.addEventListener('input', (e) => {
      catalogState.maxPrice = parseInt(e.target.value) || 250000;
      const maxInput = document.getElementById('priceMaxInput');
      if (maxInput) maxInput.value = catalogState.maxPrice;
    });

    slider.addEventListener('change', () => {
      catalogState.currentPage = 1;
      applyFiltersAndRender();
    });
  }

  // Price manual inputs
  const minInput = document.getElementById('priceMinInput');
  const maxInput = document.getElementById('priceMaxInput');
  const priceApplyBtn = document.getElementById('priceApplyBtn');

  if (priceApplyBtn && minInput && maxInput) {
    priceApplyBtn.addEventListener('click', () => {
      catalogState.minPrice = parseInt(minInput.value) || 0;
      catalogState.maxPrice = parseInt(maxInput.value) || 250000;
      catalogState.currentPage = 1;
      applyFiltersAndRender();
    });
  }

  // Mobile Filter Drawer Handlers
  const mobileFilterOpenBtn = document.getElementById('mobileFilterOpenBtn');
  const mobileFilterDrawer = document.getElementById('mobileFilterDrawer');
  const mobileFilterCloseBtn = document.getElementById('mobileFilterCloseBtn');
  const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');
  const desktopSidebar = document.querySelector('.catalog-sidebar');
  const drawerBody = document.getElementById('mobileFilterDrawerBody');
  const sidebarParent = desktopSidebar ? desktopSidebar.parentElement : null;

  function syncSidebarPlacement() {
    if (window.innerWidth <= 900) {
      if (desktopSidebar && drawerBody && !drawerBody.contains(desktopSidebar)) {
        drawerBody.appendChild(desktopSidebar);
        desktopSidebar.style.display = 'block';
      }
    } else {
      if (desktopSidebar && sidebarParent && !sidebarParent.contains(desktopSidebar)) {
        sidebarParent.insertBefore(desktopSidebar, sidebarParent.firstChild);
        desktopSidebar.style.display = '';
      }
    }
  }

  window.addEventListener('resize', syncSidebarPlacement);
  syncSidebarPlacement();

  if (mobileFilterOpenBtn && mobileFilterDrawer) {
    mobileFilterOpenBtn.addEventListener('click', () => {
      syncSidebarPlacement();
      mobileFilterDrawer.classList.add('active');
      if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeMobileFilterDrawer() {
    if (mobileFilterDrawer) mobileFilterDrawer.classList.remove('active');
    if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileFilterCloseBtn) mobileFilterCloseBtn.addEventListener('click', closeMobileFilterDrawer);
  if (mobileDrawerBackdrop) mobileDrawerBackdrop.addEventListener('click', closeMobileFilterDrawer);

  // Browser Back/Forward navigation sync
  window.addEventListener('popstate', () => {
    parseURLParameters();
    renderSidebarFilters();
    applyFiltersAndRender(false);
  });
}

// Toggle collapsible sidebar filter section
function toggleFilterSection(headerEl) {
  const section = headerEl.closest('.filter-section');
  if (section) {
    section.classList.toggle('collapsed');
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('productsDisplayArea')) {
    initProductsCatalog();
  }
});
