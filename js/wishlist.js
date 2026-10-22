/**
 * SHINE TECH - Wishlist Page Engine (js/wishlist.js)
 * Manages wishlist rendering, single item removal, move-to-cart,
 * bulk move-all-to-cart, clearing wishlist, and recommended products.
 */

/**
 * Main Render Function for Wishlist Page
 */
function renderWishlistPage() {
  const gridContainer = document.getElementById('wishlistGrid');
  const emptyState = document.getElementById('emptyWishlistState');
  const countBadge = document.getElementById('wishlistCountBadge');
  const actionsGroup = document.getElementById('wishlistActionsGroup');

  if (!gridContainer || typeof SHINE_CATALOG === 'undefined') return;

  const rawWishlist = ShineStorage.getWishlist();

  // Filter out any invalid product IDs safely
  const wishlist = rawWishlist.filter(id => {
    const p = SHINE_CATALOG.getById(id);
    return !!p;
  });

  // If sanitized list differs, update storage
  if (wishlist.length !== rawWishlist.length) {
    ShineStorage.saveWishlist(wishlist);
  }

  // Update Header Item Count Badge
  if (countBadge) {
    countBadge.textContent = `${wishlist.length} ${wishlist.length === 1 ? 'Item' : 'Items'}`;
  }

  // Empty State Handling
  if (wishlist.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (gridContainer) gridContainer.innerHTML = '';
    if (actionsGroup) actionsGroup.style.display = 'none';
    renderWishlistRecommendedRail();
    return;
  }

  // Populated State Handling
  if (emptyState) emptyState.style.display = 'none';
  if (actionsGroup) actionsGroup.style.display = 'flex';

  // Map to Catalog Products
  const products = wishlist.map(id => SHINE_CATALOG.getById(id)).filter(Boolean);

  gridContainer.innerHTML = products.map(product => {
    const isAvailable = product.inStock !== false;

    return `
      <div class="wishlist-product-card" data-id="${product.id}">
        <!-- Top Bar with Badge & Delete Icon -->
        <div class="wishlist-card-top">
          <span class="card-badge ${product.dealOfDay ? 'badge-deal' : ''}">
            ${product.badge || (product.dealOfDay ? 'Hot Deal' : 'Bestseller')}
          </span>
          <button class="wishlist-delete-btn" 
                  onclick="handleRemoveWishlist('${product.id}')" 
                  title="Remove from wishlist" 
                  aria-label="Remove ${escapeHtml(product.name)} from wishlist">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>

        <!-- Image Box -->
        <div class="wishlist-card-img-box" style="height: 200px; padding: 16px; display: flex; align-items: center; justify-content: center; background: #FDFEFE; position: relative; overflow: hidden; border-radius: 6px;">
          <a href="product-details.html?id=${product.id}" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; overflow: hidden; text-decoration: none;">
            <img src="${product.image}" 
                 alt="${escapeHtml(product.name)}" 
                 class="wishlist-card-img" 
                 loading="lazy"
                 style="max-width: 100%; max-height: 100%; width: auto; height: 100%; object-fit: contain; display: block; margin: 0 auto;"
                 onerror="handleImageError(this, '${product.id}')" />
          </a>
        </div>

        <!-- Body Content -->
        <div class="wishlist-card-body">
          <span class="wishlist-card-brand">${product.brand}</span>
          <a href="product-details.html?id=${product.id}" class="wishlist-card-title" title="${escapeHtml(product.name)}">
            ${product.name}
          </a>

          <!-- Rating -->
          <div class="wishlist-card-rating">
            <span class="wishlist-rating-pill">
              ${product.rating} <i class="fa-solid fa-star"></i>
            </span>
            <span class="wishlist-rating-count">(${product.ratingCount.toLocaleString('en-IN')})</span>
          </div>

          <!-- Price Row -->
          <div class="wishlist-card-price-row">
            <span class="wishlist-price-current">${SHINE_CATALOG.formatINR(product.price)}</span>
            <span class="wishlist-price-original">${SHINE_CATALOG.formatINR(product.originalPrice)}</span>
            <span class="wishlist-discount-pill">${product.discount}% OFF</span>
          </div>

          <!-- Stock Availability -->
          <div class="wishlist-stock-tag">
            <i class="fa-solid ${isAvailable ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
            <span>${isAvailable ? 'In Stock (Ready to Ship)' : 'Limited Stock Available'}</span>
          </div>

          <!-- Action Buttons -->
          <div class="wishlist-card-btn-group">
            <button class="btn-card-move-cart" onclick="handleMoveToCart('${product.id}')">
              <i class="fa-solid fa-cart-arrow-down"></i> Move to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  renderWishlistRecommendedRail();
}

/**
 * Remove a single item from Wishlist
 */
function handleRemoveWishlist(productId) {
  const product = SHINE_CATALOG.getById(productId);
  let wishlist = ShineStorage.getWishlist();
  wishlist = wishlist.filter(id => id !== productId);
  ShineStorage.saveWishlist(wishlist);

  if (product) {
    showToast(`Removed "${product.name.slice(0, 24)}..." from Wishlist`, 'danger');
  }
  renderWishlistPage();
}

/**
 * Move a single item from Wishlist into Cart
 */
function handleMoveToCart(productId) {
  const product = SHINE_CATALOG.getById(productId);
  if (!product) return;

  // Add to cart with qty 1
  addToCart(productId, 1, false);

  // Remove from wishlist
  let wishlist = ShineStorage.getWishlist();
  wishlist = wishlist.filter(id => id !== productId);
  ShineStorage.saveWishlist(wishlist);

  showToast(`Moved "${product.name.slice(0, 24)}..." to Cart!`, 'success');
  renderWishlistPage();
}

/**
 * Move ALL Wishlisted items to Cart in one click
 */
function handleMoveAllToCart() {
  const wishlist = ShineStorage.getWishlist();
  if (wishlist.length === 0) return;

  const count = wishlist.length;

  // Add each item to cart
  wishlist.forEach(id => {
    addToCart(id, 1, false);
  });

  // Clear wishlist
  ShineStorage.saveWishlist([]);

  showToast(`All ${count} items moved to your Shopping Cart!`, 'success');
  renderWishlistPage();
}

/**
 * Clear all items from Wishlist
 */
function handleClearWishlist() {
  const wishlist = ShineStorage.getWishlist();
  if (wishlist.length === 0) return;

  ShineStorage.saveWishlist([]);
  showToast('Wishlist cleared', 'danger');
  renderWishlistPage();
}

/**
 * Recommended Trending Products Rail
 */
function renderWishlistRecommendedRail() {
  const rail = document.getElementById('wishlistRecommendedRail');
  if (!rail || typeof SHINE_CATALOG === 'undefined') return;

  const trending = SHINE_CATALOG.getTrending().slice(0, 8);
  rail.innerHTML = trending.map(p => createProductCardHTML(p)).join('');

  const prevBtn = document.getElementById('wishlistRailPrevBtn');
  const nextBtn = document.getElementById('wishlistRailNextBtn');

  if (prevBtn && nextBtn) {
    prevBtn.onclick = () => rail.scrollBy({ left: -320, behavior: 'smooth' });
    nextBtn.onclick = () => rail.scrollBy({ left: 320, behavior: 'smooth' });
  }
}

/**
 * Setup Category Nav & Mobile Drawer
 */
function setupWishlistCategoryNav() {
  const navContainer = document.getElementById('categoryNavContainer');
  const drawerList = document.getElementById('drawerNavList');

  if (typeof SHINE_CATEGORIES !== 'undefined') {
    if (navContainer) {
      navContainer.innerHTML = SHINE_CATEGORIES.map(cat => `
        <a href="products.html?category=${cat.id}" class="category-nav-item" title="${cat.banner}">
          <div class="category-nav-icon"><i class="${cat.icon}"></i></div>
          <span class="category-nav-label">${cat.name}</span>
        </a>
      `).join('');
    }

    if (drawerList) {
      drawerList.innerHTML = SHINE_CATEGORIES.map(cat => `
        <a href="products.html?category=${cat.id}" class="drawer-nav-item">
          <i class="${cat.icon}"></i>
          <span>${cat.name}</span>
        </a>
      `).join('') + `
        <div class="drawer-section-title">My Account</div>
        <a href="cart.html" class="drawer-nav-item"><i class="fa-solid fa-cart-shopping"></i> Cart</a>
        <a href="wishlist.html" class="drawer-nav-item active"><i class="fa-solid fa-heart"></i> Wishlist</a>
      `;
    }
  }
}

/**
 * Utility: HTML escape
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initialise when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setupWishlistCategoryNav();
  renderWishlistPage();
});
