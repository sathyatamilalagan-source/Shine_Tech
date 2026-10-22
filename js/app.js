/**
 * SHINE TECH - Global Application Engine (js/app.js)
 * Manages Cart, Wishlist, Search Autocomplete, Modals, Toasts, and UI Interactions.
 */

// Storage Keys
const STORAGE_CART_KEY = 'shinetech_cart';
const STORAGE_WISHLIST_KEY = 'shinetech_wishlist';

// Helper to determine path prefix (whether current page is in root or pages/ directory)
const isRootPage = () => !window.location.pathname.replace(/\\/g, '/').toLowerCase().includes('/pages/');
const getRootPrefix = () => isRootPage() ? '' : '../';
const getPagesPrefix = () => isRootPage() ? 'pages/' : '';

/* --- Storage API --- */
const ShineStorage = {
  getCart: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  },
  saveCart: (cart) => {
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    updateHeaderCounters();
    window.dispatchEvent(new CustomEvent('shinetech:cart-updated', { detail: cart }));
  },
  getWishlist: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_WISHLIST_KEY)) || [];
    } catch (e) {
      return [];
    }
  },
  saveWishlist: (wishlist) => {
    localStorage.setItem(STORAGE_WISHLIST_KEY, JSON.stringify(wishlist));
    updateHeaderCounters();
    window.dispatchEvent(new CustomEvent('shinetech:wishlist-updated', { detail: wishlist }));
  }
};

/* --- Global Cart & Wishlist Operations --- */
function addToCart(productId, quantity = 1, showFeedback = true) {
  if (typeof SHINE_CATALOG === 'undefined') return;
  const product = SHINE_CATALOG.getById(productId);
  if (!product) return;

  const cart = ShineStorage.getCart();
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: productId,
      quantity: quantity,
      addedAt: new Date().toISOString()
    });
  }

  ShineStorage.saveCart(cart);

  if (showFeedback) {
    showToast(`Added "${product.name.slice(0, 28)}..." to your Cart!`, 'success');
  }
}

function removeFromCart(productId) {
  let cart = ShineStorage.getCart();
  cart = cart.filter(item => item.id !== productId);
  ShineStorage.saveCart(cart);
  showToast('Item removed from Cart', 'danger');
}

function updateCartQuantity(productId, newQty) {
  const cart = ShineStorage.getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    if (newQty <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = newQty;
      ShineStorage.saveCart(cart);
    }
  }
}

function toggleWishlist(productId, btnElement = null) {
  if (typeof SHINE_CATALOG === 'undefined') return;
  const product = SHINE_CATALOG.getById(productId);
  if (!product) return;

  let wishlist = ShineStorage.getWishlist();
  const exists = wishlist.includes(productId);

  if (exists) {
    wishlist = wishlist.filter(id => id !== productId);
    ShineStorage.saveWishlist(wishlist);
    showToast(`Removed from Wishlist`, 'danger');
    if (btnElement) btnElement.classList.remove('active');
  } else {
    wishlist.push(productId);
    ShineStorage.saveWishlist(wishlist);
    showToast(`Saved "${product.name.slice(0, 26)}..." to Wishlist!`, 'success');
    if (btnElement) btnElement.classList.add('active');
  }

  // Sync any other matching wishlist buttons on screen
  document.querySelectorAll(`.wishlist-toggle-btn[data-id="${productId}"]`).forEach(btn => {
    if (exists) {
      btn.classList.remove('active');
    } else {
      btn.classList.add('active');
    }
  });
}

function isInWishlist(productId) {
  const wishlist = ShineStorage.getWishlist();
  return wishlist.includes(productId);
}

/* --- Header Counters Update --- */
function updateHeaderCounters() {
  const cart = ShineStorage.getCart();
  const wishlist = ShineStorage.getWishlist();

  const totalCartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalWishlistCount = wishlist.length;

  document.querySelectorAll('#headerCartCount, .header-cart-count').forEach(el => {
    el.textContent = totalCartCount;
    el.style.display = totalCartCount > 0 ? 'flex' : 'none';
  });

  document.querySelectorAll('#headerWishlistCount, .header-wishlist-count').forEach(el => {
    el.textContent = totalWishlistCount;
    el.style.display = totalWishlistCount > 0 ? 'flex' : 'none';
  });
}

/* --- Toast Notifications System --- */
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
  toast.innerHTML = `
    <i class="fa-solid ${icon} toast-icon"></i>
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* --- Quick View Modal --- */
function openQuickView(productId) {
  if (typeof SHINE_CATALOG === 'undefined') return;
  const product = SHINE_CATALOG.getById(productId);
  if (!product) return;

  let modalOverlay = document.getElementById('quickViewOverlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'quickViewOverlay';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  const inWish = isInWishlist(productId);
  const pPath = getPagesPrefix();

  modalOverlay.innerHTML = `
    <div class="quick-view-modal" role="dialog" aria-modal="true">
      <button class="modal-close-btn" onclick="closeQuickView()" aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="modal-body">
        <div class="modal-image-col">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" class="modal-product-img" 
               onerror="handleImageError(this, '${product.id}')" />
        </div>
        <div class="modal-info-col">
          <span class="modal-brand">${product.brand}</span>
          <h2 class="modal-title">${product.name}</h2>
          
          <div class="modal-rating-row">
            <span class="rating-pill">
              <i class="fa-solid fa-star"></i> ${product.rating}
            </span>
            <span class="rating-count">(${product.ratingCount.toLocaleString('en-IN')} verified reviews)</span>
          </div>
          
          <div class="modal-price-box">
            <span class="current-price" style="font-size: 1.4rem;">${SHINE_CATALOG.formatINR(product.price)}</span>
            <span class="original-price">${SHINE_CATALOG.formatINR(product.originalPrice)}</span>
            <span class="discount-tag">${product.discount}% OFF</span>
          </div>
          
          <div class="assured-badge" style="margin-bottom: 14px;">
            <i class="fa-solid fa-shield-halved" style="color: var(--color-cyan);"></i>
            <span>SHINE Assured</span> &bull; 100% Genuine Guarantee
          </div>
          
          <p style="font-size: 0.88rem; color: #4B5563; margin-bottom: 16px; line-height: 1.5;">
            ${product.description}
          </p>
          
          <div class="modal-specs-list">
            ${product.specs.map(s => `
              <div class="modal-spec-item">
                <i class="fa-solid fa-check"></i>
                <span>${s}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="modal-actions">
            <button class="btn-primary" style="flex: 1; justify-content: center;" onclick="addToCart('${product.id}', 1); closeQuickView();">
              <i class="fa-solid fa-cart-shopping"></i> Add to Cart
            </button>
            <button class="btn-secondary" style="color: var(--color-text-main); border-color: var(--color-border);" 
                    onclick="toggleWishlist('${product.id}'); this.classList.toggle('active');">
              <i class="fa-heart ${inWish ? 'fa-solid text-danger' : 'fa-regular'}"></i>
            </button>
            <a href="${pPath}product-details.html?id=${product.id}" class="btn-secondary" style="color: var(--color-blue); border-color: var(--color-blue);">
              Full Details
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Close when clicking outside modal content
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeQuickView();
  });
}

function closeQuickView() {
  const modalOverlay = document.getElementById('quickViewOverlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* --- Live Search Autocomplete --- */
function setupSearchAutocomplete() {
  const searchInput = document.getElementById('searchInput');
  const searchSelect = document.getElementById('searchCategorySelect');
  const searchForm = document.getElementById('searchForm');
  const dropdown = document.getElementById('searchSuggestionsDropdown');

  if (!searchInput || !dropdown) return;

  let debounceTimer;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();
    const category = searchSelect ? searchSelect.value : 'all';

    if (query.length < 1) {
      dropdown.classList.remove('active');
      dropdown.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(() => {
      renderSearchSuggestions(query, category);
    }, 180);
  });

  function renderSearchSuggestions(query, category) {
    if (typeof SHINE_CATALOG === 'undefined') return;
    const matches = SHINE_CATALOG.search(query, category).slice(0, 6);

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--color-text-muted); font-size: 0.88rem;">
          No matching products found for "<strong>${escapeHtml(query)}</strong>"
        </div>
      `;
      dropdown.classList.add('active');
      return;
    }

    const pPath = getPagesPrefix();

    dropdown.innerHTML = matches.map(prod => `
      <div class="suggestion-item" onclick="window.location.href='${pPath}product-details.html?id=${prod.id}'">
        <img src="${prod.image}" alt="${escapeHtml(prod.name)}" class="suggestion-img" 
             onerror="handleImageError(this, '${prod.id}')" />
        <div class="suggestion-info">
          <div class="suggestion-title">${highlightMatch(prod.name, query)}</div>
          <div class="suggestion-meta">
            <span class="suggestion-price">${SHINE_CATALOG.formatINR(prod.price)}</span>
            <span class="suggestion-category">${prod.categoryName}</span>
          </div>
        </div>
      </div>
    `).join('');

    dropdown.classList.add('active');
  }

  // Handle outside clicks
  document.addEventListener('click', (e) => {
    if (!searchForm.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });

  // Handle Form Submission
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = searchInput.value.trim();
      const cat = searchSelect ? searchSelect.value : 'all';
      const pPath = getPagesPrefix();
      window.location.href = `${pPath}products.html?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`;
    });
  }
}

function highlightMatch(text, query) {
  if (!query) return escapeHtml(text);
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return escapeHtml(text).replace(regex, '<span style="color: var(--color-blue); font-weight: 700;">$1</span>');
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]);
}

/* --- Hero Carousel Logic --- */
function setupHeroCarousel() {
  const carousel = document.querySelector('.hero-carousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.carousel-slide');
  const prevBtn = carousel.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.querySelector('.carousel-btn.next');
  const indicatorsContainer = carousel.querySelector('.carousel-indicators');

  if (slides.length <= 1) return;

  let currentSlide = 0;
  let autoplayTimer;

  // Build dots
  indicatorsContainer.innerHTML = '';
  slides.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `indicator-dot ${idx === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(idx));
    indicatorsContainer.appendChild(dot);
  });

  const dots = indicatorsContainer.querySelectorAll('.indicator-dot');

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    currentSlide = (index + slides.length) % slides.length;

    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);

  function startAutoplay() {
    autoplayTimer = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
}

/* --- Deals of the Day Countdown Timer --- */
function setupCountdownTimer() {
  const timerDisplay = document.getElementById('dealsCountdown');
  if (!timerDisplay) return;

  // Target: end of current 12-hour flash sale block
  function updateTimer() {
    const now = new Date();
    // Flash deals reset every midnight & noon
    const nextReset = new Date();
    if (now.getHours() < 12) {
      nextReset.setHours(12, 0, 0, 0);
    } else {
      nextReset.setHours(24, 0, 0, 0);
    }

    const diffMs = nextReset - now;
    if (diffMs <= 0) {
      timerDisplay.textContent = '00 : 00 : 00';
      return;
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');
    timerDisplay.textContent = `${pad(hours)}h : ${pad(mins)}m : ${pad(secs)}s`;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* --- Horizontal Rail Scroll Buttons --- */
function setupRailScrollButtons() {
  document.querySelectorAll('.shelf-rail-wrapper').forEach(wrapper => {
    const rail = wrapper.querySelector('.shelf-rail');
    const leftBtn = wrapper.querySelector('.rail-arrow-btn.left');
    const rightBtn = wrapper.querySelector('.rail-arrow-btn.right');

    if (!rail) return;

    if (leftBtn) {
      leftBtn.addEventListener('click', () => {
        rail.scrollBy({ left: -480, behavior: 'smooth' });
      });
    }

    if (rightBtn) {
      rightBtn.addEventListener('click', () => {
        rail.scrollBy({ left: 480, behavior: 'smooth' });
      });
    }
  });
}

/* --- Product Card HTML Generator Utility --- */
function createProductCardHTML(product) {
  const inWish = isInWishlist(product.id);
  const pPath = getPagesPrefix();

  return `
    <div class="product-card" data-id="${product.id}" data-category="${product.category}">
      <div class="card-top-bar">
        <span class="card-badge ${product.dealOfDay ? 'badge-deal' : ''}">
          ${product.badge || (product.dealOfDay ? 'Hot Deal' : 'Bestseller')}
        </span>
        <button class="wishlist-toggle-btn ${inWish ? 'active' : ''}" 
                data-id="${product.id}"
                onclick="toggleWishlist('${product.id}', this)"
                aria-label="Save to wishlist">
          <i class="fa-solid fa-heart"></i>
        </button>
      </div>

      <div class="card-image-box" style="width: 100%; height: 175px; display: flex; align-items: center; justify-content: center; position: relative; padding: 10px; margin-bottom: 12px; background: #FDFEFE; overflow: hidden; border-radius: 6px;">
        <a href="${pPath}product-details.html?id=${product.id}" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; overflow: hidden; text-decoration: none;">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" class="card-image" loading="lazy" style="max-width: 100%; max-height: 100%; width: auto; height: 100%; object-fit: contain; display: block; margin: 0 auto;"
               onerror="handleImageError(this, '${product.id}')" />
        </a>
        <button class="quick-view-overlay-btn" onclick="openQuickView('${product.id}')">
          <i class="fa-solid fa-eye"></i> Quick View
        </button>
      </div>

      <div class="card-content">
        <span class="card-brand">${product.brand}</span>
        <a href="${pPath}product-details.html?id=${product.id}" class="card-title" title="${escapeHtml(product.name)}">
          ${product.name}
        </a>

        <div class="card-rating-row">
          <span class="rating-pill">
            ${product.rating} <i class="fa-solid fa-star"></i>
          </span>
          <span class="rating-count">(${product.ratingCount.toLocaleString('en-IN')})</span>
        </div>

        <div class="card-price-row">
          <span class="current-price">${SHINE_CATALOG.formatINR(product.price)}</span>
          <span class="original-price">${SHINE_CATALOG.formatINR(product.originalPrice)}</span>
          <span class="discount-tag">${product.discount}% OFF</span>
        </div>

        <div class="assured-badge">
          <i class="fa-solid fa-shield-halved" style="color: var(--color-cyan);"></i>
          <span>SHINE Assured</span>
        </div>

        <button class="card-action-btn" onclick="addToCart('${product.id}', 1)">
          <i class="fa-solid fa-cart-shopping"></i> Add to Cart
        </button>
      </div>
    </div>
  `;
}

/* --- Mobile Drawer Navigation Setup --- */
function setupMobileDrawer() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('mobileDrawerBackdrop');
  const closeBtn = document.getElementById('drawerCloseBtn');

  if (!toggleBtn || !drawer || !backdrop) return;

  function openDrawer() {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
}

/* --- Global Initialization on DOM Ready --- */
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderCounters();
  setupSearchAutocomplete();
  setupHeroCarousel();
  setupCountdownTimer();
  setupRailScrollButtons();
  setupMobileDrawer();

  // Populate category dropdown in search bar if empty
  const searchSelect = document.getElementById('searchCategorySelect');
  if (searchSelect && searchSelect.options.length <= 1 && typeof SHINE_CATEGORIES !== 'undefined') {
    SHINE_CATEGORIES.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      searchSelect.appendChild(opt);
    });
  }

  // Multi-tab and cross-page synchronization
  window.addEventListener('storage', updateHeaderCounters);
  window.addEventListener('shinetech:cart-updated', updateHeaderCounters);
  window.addEventListener('shinetech:wishlist-updated', updateHeaderCounters);
});
