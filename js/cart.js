/**
 * SHINE TECH - Shopping Cart & Simulated Checkout Engine (js/cart.js)
 * Manages cart rendering, quantity adjustments, item removal,
 * Save for Later state, coupon system, order summary, and simulated checkout.
 */

// Storage Keys
const STORAGE_SAVED_FOR_LATER_KEY = 'shinetech_saved_for_later';

// Available Demo Discount Coupons (Requirement 3)
const AVAILABLE_COUPONS = {
  'SHINE10': {
    code: 'SHINE10',
    title: '10% OFF on all Tech',
    description: 'Get 10% instant discount up to ₹1,500 on orders above ₹1,000.',
    discountPct: 10,
    minOrder: 1000,
    maxDiscount: 1500
  },
  'TECHFEST': {
    code: 'TECHFEST',
    title: 'Mega TechFest 15% OFF',
    description: 'Get 15% instant discount up to ₹3,500 on premium orders above ₹5,000.',
    discountPct: 15,
    minOrder: 5000,
    maxDiscount: 3500
  }
};

// Application State
let activeCoupon = null;
let currentCheckoutStep = 1;
let checkoutAddress = {
  fullName: 'Siddharth Verma',
  mobile: '9876543210',
  pincode: '560001',
  address: 'Flat 402, Prestige Tech Park, Marathahalli Outer Ring Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  type: 'Home'
};
let selectedPaymentMethod = 'upi';
let lastConfirmedOrder = null;

/**
 * Storage Helpers for Save For Later (Requirement 4)
 */
const ShineSaveLater = {
  getSaved: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_SAVED_FOR_LATER_KEY)) || [];
    } catch (e) {
      return [];
    }
  },
  saveSaved: (list) => {
    localStorage.setItem(STORAGE_SAVED_FOR_LATER_KEY, JSON.stringify(list));
  }
};

/**
 * Main Render Function for Cart Page
 */
function renderCartPage() {
  const cartItemsContainer = document.getElementById('cartItemsList');
  const priceDetailsContainer = document.getElementById('cartPriceSummary');
  const emptyCartState = document.getElementById('emptyCartState');
  const cartContentLayout = document.getElementById('cartContentLayout');
  const savedLaterSection = document.getElementById('savedLaterSection');
  const savedItemsList = document.getElementById('savedItemsList');
  const cartItemsCountBadge = document.getElementById('cartItemsCountBadge');
  const savedItemsCountBadge = document.getElementById('savedItemsCountBadge');

  if (!cartItemsContainer || typeof SHINE_CATALOG === 'undefined') return;

  const rawCart = ShineStorage.getCart();
  const savedForLater = ShineSaveLater.getSaved();

  // Filter out any invalid product IDs safely (Requirement 2)
  const cart = rawCart.filter(item => {
    const p = SHINE_CATALOG.getById(item.id);
    return !!p;
  });

  // If filtered cart differs from raw cart, persist the sanitized cart
  if (cart.length !== rawCart.length) {
    ShineStorage.saveCart(cart);
  }

  // Update Item Count Badges
  const totalCartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  if (cartItemsCountBadge) {
    cartItemsCountBadge.textContent = `${totalCartCount} ${totalCartCount === 1 ? 'Item' : 'Items'}`;
  }
  if (savedItemsCountBadge) {
    savedItemsCountBadge.textContent = `${savedForLater.length} ${savedForLater.length === 1 ? 'Item' : 'Items'}`;
  }

  // Handle Empty Cart State
  if (cart.length === 0) {
    if (emptyCartState) emptyCartState.style.display = 'block';
    
    // If there are saved items, display them below the empty cart banner
    if (savedForLater.length > 0) {
      if (cartContentLayout) {
        cartContentLayout.style.display = 'block';
        document.getElementById('activeCartBox').style.display = 'none';
        document.querySelector('.cart-side-col').style.display = 'none';
      }
      renderSavedForLater(savedForLater);
    } else {
      if (cartContentLayout) cartContentLayout.style.display = 'none';
    }

    renderRecommendedRail();
    return;
  }

  // Populated Cart State
  if (emptyCartState) emptyCartState.style.display = 'none';
  if (cartContentLayout) {
    cartContentLayout.style.display = 'grid';
    document.getElementById('activeCartBox').style.display = 'block';
    document.querySelector('.cart-side-col').style.display = 'flex';
  }

  let totalMRP = 0;
  let totalPrice = 0;

  // Render Active Cart Items
  cartItemsContainer.innerHTML = cart.map(item => {
    const product = SHINE_CATALOG.getById(item.id);
    const itemTotalMRP = product.originalPrice * item.quantity;
    const itemTotalPrice = product.price * item.quantity;

    totalMRP += itemTotalMRP;
    totalPrice += itemTotalPrice;

    // Delivery estimate: 2-3 days ahead
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 2);
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const formattedDate = deliveryDate.toLocaleDateString('en-IN', options);

    return `
      <div class="cart-item-row" data-id="${product.id}">
        <!-- Thumbnail Box -->
        <div class="cart-item-img-box" style="width: 110px; height: 110px; flex-shrink: 0; background: #F8FAFC; border: 1px solid #EEF2F6; border-radius: 6px; padding: 8px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
          <a href="product-details.html?id=${product.id}" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; overflow: hidden; text-decoration: none;">
            <img src="${product.image}" 
                 alt="${escapeHtml(product.name)}" 
                 class="cart-item-img" 
                 style="max-width: 100%; max-height: 100%; width: auto; height: 100%; object-fit: contain; display: block; margin: 0 auto;"
                 onerror="handleImageError(this, '${product.id}')" />
          </a>
        </div>

        <!-- Details Col -->
        <div class="cart-item-details">
          <div class="cart-item-top">
            <div>
              <span class="cart-item-brand">${product.brand}</span>
              <a href="product-details.html?id=${product.id}" class="cart-item-title">
                ${product.name}
              </a>
            </div>
            <div class="cart-item-delivery-est">
              Delivery by <strong>${formattedDate}</strong> | <strong>FREE</strong>
            </div>
          </div>

          <!-- Price Row -->
          <div class="cart-item-price-row">
            <span class="cart-item-current-price">${SHINE_CATALOG.formatINR(itemTotalPrice)}</span>
            <span class="cart-item-original-price">${SHINE_CATALOG.formatINR(itemTotalMRP)}</span>
            <span class="cart-item-discount-pill">${product.discount}% OFF</span>
            <span style="font-size: 0.76rem; color: #16A34A; font-weight: 600;">
              <i class="fa-solid fa-tag"></i> Includes Bank &amp; Flash Savings
            </span>
          </div>

          <!-- Action Row -->
          <div class="cart-item-actions-row">
            <!-- Quantity Stepper (Requirement 1 & 2) -->
            <div class="cart-qty-stepper">
              <button class="cart-qty-btn" 
                      onclick="changeCartQty('${product.id}', -1)" 
                      aria-label="Decrease quantity" 
                      ${item.quantity <= 1 ? 'disabled title="Minimum quantity is 1"' : ''}>
                <i class="fa-solid fa-minus"></i>
              </button>
              <div class="cart-qty-display">${item.quantity}</div>
              <button class="cart-qty-btn" 
                      onclick="changeCartQty('${product.id}', 1)" 
                      aria-label="Increase quantity"
                      ${item.quantity >= 5 ? 'disabled title="Maximum 5 units allowed"' : ''}>
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>

            <!-- Save for Later (Requirement 4) -->
            <button class="cart-action-btn btn-save-later" onclick="handleSaveForLater('${product.id}')">
              <i class="fa-regular fa-bookmark"></i> SAVE FOR LATER
            </button>

            <!-- Remove Button -->
            <button class="cart-action-btn btn-remove" onclick="handleRemoveFromCart('${product.id}')">
              <i class="fa-solid fa-trash-can"></i> REMOVE
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Render Save For Later Section (Requirement 4)
  renderSavedForLater(savedForLater);

  // Re-evaluate Active Coupon Eligibility (Requirement 3)
  let couponDiscount = 0;
  if (activeCoupon) {
    if (totalPrice < activeCoupon.minOrder) {
      showToast(`Coupon "${activeCoupon.code}" removed: Minimum order of ${SHINE_CATALOG.formatINR(activeCoupon.minOrder)} required.`, 'danger');
      activeCoupon = null;
    } else {
      couponDiscount = Math.min(
        activeCoupon.maxDiscount,
        Math.round(totalPrice * (activeCoupon.discountPct / 100))
      );
    }
  }

  // Update Coupon UI
  renderCouponState();

  // Price Calculation Breakdown
  const totalDiscountOnMRP = totalMRP - totalPrice;
  const deliveryCharges = totalPrice > 500 ? 0 : 70;
  const grandPayable = totalPrice - couponDiscount + deliveryCharges;
  const totalCombinedSavings = totalDiscountOnMRP + couponDiscount;

  // Render Order Price Details Card (Requirement 1)
  if (priceDetailsContainer) {
    priceDetailsContainer.innerHTML = `
      <h3 class="cart-price-header">
        PRICE DETAILS (${totalCartCount} ${totalCartCount === 1 ? 'ITEM' : 'ITEMS'})
      </h3>

      <div class="price-row-item">
        <span class="price-label">Total MRP</span>
        <span class="price-val">${SHINE_CATALOG.formatINR(totalMRP)}</span>
      </div>

      <div class="price-row-item">
        <span class="price-label">Discount on MRP</span>
        <span class="price-val discount-green">- ${SHINE_CATALOG.formatINR(totalDiscountOnMRP)}</span>
      </div>

      ${activeCoupon ? `
        <div class="price-row-item">
          <span class="price-label">Coupon Discount (${activeCoupon.code})</span>
          <span class="price-val discount-green">- ${SHINE_CATALOG.formatINR(couponDiscount)}</span>
        </div>
      ` : ''}

      <div class="price-row-item">
        <span class="price-label">Delivery Charges</span>
        <span class="price-val discount-green">
          ${deliveryCharges === 0 ? 'FREE' : SHINE_CATALOG.formatINR(deliveryCharges)}
        </span>
      </div>

      <div class="cart-grand-total-row">
        <span>Total Amount</span>
        <span class="total-val">${SHINE_CATALOG.formatINR(grandPayable)}</span>
      </div>

      <div class="cart-savings-callout">
        <i class="fa-solid fa-piggy-bank"></i>
        <span>You will save ${SHINE_CATALOG.formatINR(totalCombinedSavings)} on this order</span>
      </div>

      <button class="btn-proceed-checkout" id="proceedCheckoutBtn" onclick="openCheckoutModal()">
        <i class="fa-solid fa-lock"></i> PROCEED TO CHECKOUT
      </button>

      <div class="cart-security-badge">
        <i class="fa-solid fa-shield-halved" style="color: var(--color-cyan);"></i> Safe &amp; Secure 256-Bit SSL Encrypted Checkout
      </div>
    `;
  }

  // Render Recommended Rail
  renderRecommendedRail();
}

/**
 * Render Save For Later Items (Requirement 4)
 */
function renderSavedForLater(savedForLater) {
  const section = document.getElementById('savedLaterSection');
  const container = document.getElementById('savedItemsList');
  const countBadge = document.getElementById('savedItemsCountBadge');

  if (!section || !container) return;

  if (savedForLater.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  if (countBadge) {
    countBadge.textContent = `${savedForLater.length} ${savedForLater.length === 1 ? 'Item' : 'Items'}`;
  }

  container.innerHTML = savedForLater.map(item => {
    const product = SHINE_CATALOG.getById(item.id);
    if (!product) return '';

    return `
      <div class="cart-item-row" data-id="${product.id}">
        <div class="cart-item-img-box">
          <a href="product-details.html?id=${product.id}">
            <img src="${product.image}" 
                 alt="${escapeHtml(product.name)}" 
                 class="cart-item-img" 
                 onerror="handleImageError(this, '${product.id}')" />
          </a>
        </div>

        <div class="cart-item-details">
          <div class="cart-item-top">
            <div>
              <span class="cart-item-brand">${product.brand}</span>
              <a href="product-details.html?id=${product.id}" class="cart-item-title">
                ${product.name}
              </a>
            </div>
          </div>

          <div class="cart-item-price-row">
            <span class="cart-item-current-price">${SHINE_CATALOG.formatINR(product.price)}</span>
            <span class="cart-item-original-price">${SHINE_CATALOG.formatINR(product.originalPrice)}</span>
            <span class="cart-item-discount-pill">${product.discount}% OFF</span>
          </div>

          <div class="cart-item-actions-row">
            <button class="btn-move-to-cart" onclick="handleMoveToCart('${product.id}')">
              <i class="fa-solid fa-cart-arrow-down"></i> MOVE TO CART
            </button>
            <button class="cart-action-btn btn-remove" onclick="handleRemoveFromSaved('${product.id}')">
              <i class="fa-solid fa-trash-can"></i> REMOVE
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Quantity Adjustment Function (Requirement 2)
 */
function changeCartQty(productId, delta) {
  const cart = ShineStorage.getCart();
  const item = cart.find(i => i.id === productId);

  if (!item) return;

  const newQty = item.quantity + delta;

  // Prevent quantity below 1
  if (newQty < 1) {
    showToast('Quantity cannot be less than 1. Use Remove to delete item.', 'danger');
    return;
  }

  // Prevent quantity above 5
  if (newQty > 5) {
    showToast('Maximum 5 units allowed per customer order.', 'danger');
    return;
  }

  item.quantity = newQty;
  ShineStorage.saveCart(cart);
  renderCartPage();
}

/**
 * Remove Product from Cart
 */
function handleRemoveFromCart(productId) {
  const product = SHINE_CATALOG.getById(productId);
  removeFromCart(productId);
  if (product) {
    showToast(`Removed "${product.name.slice(0, 24)}..." from cart`, 'danger');
  }
  renderCartPage();
}

/**
 * Move item from Cart to Save For Later (Requirement 4)
 */
function handleSaveForLater(productId) {
  const product = SHINE_CATALOG.getById(productId);
  if (!product) return;

  // Remove from active cart
  let cart = ShineStorage.getCart();
  cart = cart.filter(i => i.id !== productId);
  ShineStorage.saveCart(cart);

  // Add to saved for later
  const saved = ShineSaveLater.getSaved();
  if (!saved.some(i => i.id === productId)) {
    saved.push({ id: productId, savedAt: new Date().toISOString() });
    ShineSaveLater.saveSaved(saved);
  }

  showToast(`Moved "${product.name.slice(0, 24)}..." to Save For Later`, 'success');
  renderCartPage();
}

/**
 * Move item from Save For Later back into Active Cart (Requirement 4)
 */
function handleMoveToCart(productId) {
  const product = SHINE_CATALOG.getById(productId);
  if (!product) return;

  // Remove from saved for later
  let saved = ShineSaveLater.getSaved();
  saved = saved.filter(i => i.id !== productId);
  ShineSaveLater.saveSaved(saved);

  // Add to active cart with qty 1
  addToCart(productId, 1, false);

  showToast(`Moved "${product.name.slice(0, 24)}..." back to Cart!`, 'success');
  renderCartPage();
}

/**
 * Remove item from Save For Later
 */
function handleRemoveFromSaved(productId) {
  let saved = ShineSaveLater.getSaved();
  saved = saved.filter(i => i.id !== productId);
  ShineSaveLater.saveSaved(saved);
  showToast('Item removed from Save For Later', 'danger');
  renderCartPage();
}

/**
 * Coupon System Logic (Requirement 3)
 */
function handleApplyCoupon() {
  const input = document.getElementById('couponInput');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    showToast('Please enter a coupon code', 'danger');
    return;
  }

  applyCouponCode(code);
}

function quickApplyCoupon(code) {
  const input = document.getElementById('couponInput');
  if (input) input.value = code;
  applyCouponCode(code);
}

function applyCouponCode(code) {
  const coupon = AVAILABLE_COUPONS[code];

  if (!coupon) {
    showToast(`Invalid coupon code "${code}". Try SHINE10 or TECHFEST.`, 'danger');
    return;
  }

  if (activeCoupon && activeCoupon.code === code) {
    showToast(`Coupon "${code}" is already applied to this order.`, 'danger');
    return;
  }

  const cart = ShineStorage.getCart();
  const currentSubtotal = cart.reduce((acc, item) => {
    const p = SHINE_CATALOG.getById(item.id);
    return acc + (p ? p.price * item.quantity : 0);
  }, 0);

  if (currentSubtotal < coupon.minOrder) {
    showToast(`Coupon "${code}" requires a minimum order of ${SHINE_CATALOG.formatINR(coupon.minOrder)}. Add more items to qualify.`, 'danger');
    return;
  }

  activeCoupon = coupon;
  const input = document.getElementById('couponInput');
  if (input) input.value = '';

  const discount = Math.min(coupon.maxDiscount, Math.round(currentSubtotal * (coupon.discountPct / 100)));
  showToast(`Coupon "${code}" applied! You saved ${SHINE_CATALOG.formatINR(discount)}.`, 'success');

  renderCartPage();
}

function removeActiveCoupon() {
  if (activeCoupon) {
    const code = activeCoupon.code;
    activeCoupon = null;
    showToast(`Coupon "${code}" removed`, 'danger');
    renderCartPage();
  }
}

function renderCouponState() {
  const container = document.getElementById('activeCouponContainer');
  const form = document.getElementById('couponForm');

  if (!container || !form) return;

  if (activeCoupon) {
    container.style.display = 'block';
    container.innerHTML = `
      <div class="active-coupon-pill">
        <div class="active-coupon-left">
          <i class="fa-solid fa-circle-check"></i>
          <span>"${activeCoupon.code}" Applied</span>
        </div>
        <button class="active-coupon-remove-btn" onclick="removeActiveCoupon()">
          <i class="fa-solid fa-xmark"></i> Remove
        </button>
      </div>
    `;
    form.style.display = 'none';
  } else {
    container.style.display = 'none';
    form.style.display = 'flex';
  }
}

/**
 * Recommended Trending Tech Rail
 */
function renderRecommendedRail() {
  const rail = document.getElementById('recommendedRail');
  if (!rail || typeof SHINE_CATALOG === 'undefined') return;

  const trending = SHINE_CATALOG.getTrending().slice(0, 8);
  rail.innerHTML = trending.map(p => createProductCardHTML(p)).join('');

  const prevBtn = document.getElementById('recRailPrevBtn');
  const nextBtn = document.getElementById('recRailNextBtn');

  if (prevBtn && nextBtn) {
    prevBtn.onclick = () => rail.scrollBy({ left: -320, behavior: 'smooth' });
    nextBtn.onclick = () => rail.scrollBy({ left: 320, behavior: 'smooth' });
  }
}

/**
 * ==========================================================================
 * Simulated Demo Checkout System (Requirement 5)
 * ==========================================================================
 */

function openCheckoutModal() {
  const cart = ShineStorage.getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty. Add products before proceeding to checkout.', 'danger');
    return;
  }

  currentCheckoutStep = 1;
  updateCheckoutStepPills(1);
  renderCheckoutStepContent(1);

  const modal = document.getElementById('checkoutModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function updateCheckoutStepPills(step) {
  const p1 = document.getElementById('stepPill1');
  const p2 = document.getElementById('stepPill2');
  const p3 = document.getElementById('stepPill3');

  [p1, p2, p3].forEach(p => p && p.classList.remove('active', 'completed'));

  if (step === 1) {
    if (p1) p1.classList.add('active');
  } else if (step === 2) {
    if (p1) p1.classList.add('completed');
    if (p2) p2.classList.add('active');
  } else if (step === 3) {
    if (p1) p1.classList.add('completed');
    if (p2) p2.classList.add('completed');
    if (p3) p3.classList.add('active');
  }
}

function renderCheckoutStepContent(step) {
  const body = document.getElementById('checkoutModalBody');
  if (!body) return;

  const cart = ShineStorage.getCart();
  const totalPrice = cart.reduce((acc, item) => {
    const p = SHINE_CATALOG.getById(item.id);
    return acc + (p ? p.price * item.quantity : 0);
  }, 0);

  let couponDiscount = 0;
  if (activeCoupon && totalPrice >= activeCoupon.minOrder) {
    couponDiscount = Math.min(activeCoupon.maxDiscount, Math.round(totalPrice * (activeCoupon.discountPct / 100)));
  }

  const deliveryCharge = totalPrice > 500 ? 0 : 70;
  const grandTotal = totalPrice - couponDiscount + deliveryCharge;

  // STEP 1: DELIVERY ADDRESS
  if (step === 1) {
    body.innerHTML = `
      <div style="font-size: 0.95rem; font-weight: 800; color: var(--color-text-main); margin-bottom: 16px;">
        <i class="fa-solid fa-truck-ramp-box" style="color: var(--color-blue);"></i> Step 1: Confirm Delivery Address
      </div>

      <form id="checkoutAddressForm" onsubmit="event.preventDefault(); handleSaveAddress();">
        <div class="checkout-form-grid">
          <div>
            <label class="form-label">Full Name *</label>
            <input type="text" class="checkout-input" id="addrFullName" value="${escapeHtml(checkoutAddress.fullName)}" required />
          </div>

          <div>
            <label class="form-label">10-Digit Mobile Number *</label>
            <input type="tel" class="checkout-input" id="addrMobile" value="${escapeHtml(checkoutAddress.mobile)}" pattern="[6-9][0-9]{9}" title="Enter a valid 10-digit Indian phone number" required />
          </div>

          <div>
            <label class="form-label">PIN Code *</label>
            <input type="text" class="checkout-input" id="addrPincode" value="${escapeHtml(checkoutAddress.pincode)}" pattern="[1-9][0-9]{5}" maxlength="6" title="Enter a valid 6-digit Indian PIN code" required />
          </div>

          <div>
            <label class="form-label">City *</label>
            <input type="text" class="checkout-input" id="addrCity" value="${escapeHtml(checkoutAddress.city)}" required />
          </div>

          <div class="form-group-full">
            <label class="form-label">Flat, House no., Building, Street Address *</label>
            <input type="text" class="checkout-input" id="addrLine" value="${escapeHtml(checkoutAddress.address)}" required />
          </div>

          <div>
            <label class="form-label">State *</label>
            <select class="checkout-input" id="addrState" style="height: 42px;">
              <option value="Karnataka" ${checkoutAddress.state === 'Karnataka' ? 'selected' : ''}>Karnataka</option>
              <option value="Maharashtra" ${checkoutAddress.state === 'Maharashtra' ? 'selected' : ''}>Maharashtra</option>
              <option value="Delhi" ${checkoutAddress.state === 'Delhi' ? 'selected' : ''}>Delhi NCR</option>
              <option value="Tamil Nadu" ${checkoutAddress.state === 'Tamil Nadu' ? 'selected' : ''}>Tamil Nadu</option>
              <option value="Telangana" ${checkoutAddress.state === 'Telangana' ? 'selected' : ''}>Telangana</option>
            </select>
          </div>

          <div>
            <label class="form-label">Address Type</label>
            <select class="checkout-input" id="addrType" style="height: 42px;">
              <option value="Home" ${checkoutAddress.type === 'Home' ? 'selected' : ''}>Home (All day delivery)</option>
              <option value="Work" ${checkoutAddress.type === 'Work' ? 'selected' : ''}>Work (Delivery 9 AM - 6 PM)</option>
            </select>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: 16px;">
          <div style="font-size: 0.95rem; font-weight: 800;">
            Order Total: <span style="color: var(--color-blue);">${SHINE_CATALOG.formatINR(grandTotal)}</span>
          </div>
          <button type="submit" class="btn-primary" style="padding: 12px 28px; font-size: 0.95rem;">
            Continue to Payment <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </form>

      <div class="checkout-disclaimer-alert">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <strong>Frontend Demonstration:</strong> No real address verification or logistics integration occurs. You can test with any sample values.
      </div>
    `;
  }

  // STEP 2: PAYMENT METHOD
  else if (step === 2) {
    body.innerHTML = `
      <div style="font-size: 0.95rem; font-weight: 800; color: var(--color-text-main); margin-bottom: 16px;">
        <i class="fa-solid fa-credit-card" style="color: var(--color-blue);"></i> Step 2: Select Simulated Payment Method
      </div>

      <!-- Delivering To Card -->
      <div style="background: #F8FAFC; border: 1px solid var(--color-border); border-radius: var(--radius-xs); padding: 12px 16px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 0.84rem;">
          <span style="color: var(--color-text-muted);">Delivering to:</span>
          <strong>${escapeHtml(checkoutAddress.fullName)}</strong>, ${escapeHtml(checkoutAddress.pincode)}
        </div>
        <button type="button" style="font-size: 0.82rem; font-weight: 700; color: var(--color-blue);" onclick="renderCheckoutStepContent(1); updateCheckoutStepPills(1);">
          Change
        </button>
      </div>

      <!-- Payment Options List -->
      <div class="payment-methods-grid">
        
        <!-- UPI Option -->
        <label class="payment-method-card ${selectedPaymentMethod === 'upi' ? 'active' : ''}">
          <input type="radio" name="payOption" value="upi" ${selectedPaymentMethod === 'upi' ? 'checked' : ''} onchange="selectedPaymentMethod='upi'; renderCheckoutStepContent(2);" />
          <div class="payment-method-icon"><i class="fa-solid fa-mobile-screen"></i></div>
          <div class="payment-method-info">
            <div class="payment-method-name">UPI (Google Pay, PhonePe, Paytm, BHIM)</div>
            <div class="payment-method-sub">Instant payment via any UPI application or QR code</div>
          </div>
        </label>

        <!-- Credit / Debit Card Option -->
        <label class="payment-method-card ${selectedPaymentMethod === 'card' ? 'active' : ''}">
          <input type="radio" name="payOption" value="card" ${selectedPaymentMethod === 'card' ? 'checked' : ''} onchange="selectedPaymentMethod='card'; renderCheckoutStepContent(2);" />
          <div class="payment-method-icon"><i class="fa-solid fa-credit-card"></i></div>
          <div class="payment-method-info">
            <div class="payment-method-name">Credit / Debit Card (Visa, MasterCard, RuPay)</div>
            <div class="payment-method-sub">Simulated card payment with 256-bit encryption</div>
          </div>
        </label>

        <!-- Cash on Delivery -->
        <label class="payment-method-card ${selectedPaymentMethod === 'cod' ? 'active' : ''}">
          <input type="radio" name="payOption" value="cod" ${selectedPaymentMethod === 'cod' ? 'checked' : ''} onchange="selectedPaymentMethod='cod'; renderCheckoutStepContent(2);" />
          <div class="payment-method-icon"><i class="fa-solid fa-hand-holding-dollar"></i></div>
          <div class="payment-method-info">
            <div class="payment-method-name">Cash on Delivery (COD)</div>
            <div class="payment-method-sub">Pay via cash or UPI QR at your doorstep upon arrival</div>
          </div>
        </label>

      </div>

      <!-- Payment Sub-form Demo UI -->
      ${renderPaymentSubform(selectedPaymentMethod)}

      <!-- Order Summary Strip -->
      <div class="order-summary-box">
        <div class="order-summary-row">
          <span>Items Total (${cart.length} unique)</span>
          <span>${SHINE_CATALOG.formatINR(totalPrice)}</span>
        </div>
        ${couponDiscount > 0 ? `
          <div class="order-summary-row" style="color: var(--color-success); font-weight: 700;">
            <span>Coupon (${activeCoupon.code})</span>
            <span>- ${SHINE_CATALOG.formatINR(couponDiscount)}</span>
          </div>
        ` : ''}
        <div class="order-summary-row">
          <span>Delivery</span>
          <span style="color: var(--color-success); font-weight: 700;">${deliveryCharge === 0 ? 'FREE' : SHINE_CATALOG.formatINR(deliveryCharge)}</span>
        </div>
        <div class="order-summary-row">
          <span>Total Payable Amount</span>
          <span style="color: var(--color-blue); font-size: 1.15rem;">${SHINE_CATALOG.formatINR(grandTotal)}</span>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <button type="button" class="btn-secondary" style="padding: 10px 20px; font-size: 0.9rem;" onclick="renderCheckoutStepContent(1); updateCheckoutStepPills(1);">
          <i class="fa-solid fa-arrow-left"></i> Back to Address
        </button>
        <button type="button" class="btn-primary" style="padding: 12px 30px; font-size: 1rem; background: #FF9F00;" onclick="handleConfirmPayment(${grandTotal})">
          <i class="fa-solid fa-lock"></i> Pay ${SHINE_CATALOG.formatINR(grandTotal)} &bull; Confirm Demo Order
        </button>
      </div>

      <div class="checkout-disclaimer-alert">
        <i class="fa-solid fa-shield-halved"></i>
        <strong>SIMULATED DEMO ONLY:</strong> Do not enter real credit card numbers or banking passwords. No live payment gateway is connected.
      </div>
    `;
  }

  // STEP 3: ORDER CONFIRMED
  else if (step === 3 && lastConfirmedOrder) {
    body.innerHTML = `
      <div class="order-success-box">
        <div class="order-success-icon-wrap">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        
        <h2 class="order-success-title">Order Placed Successfully!</h2>
        <p style="font-size: 0.92rem; color: var(--color-text-muted); margin-bottom: 12px;">
          Thank you, <strong>${escapeHtml(lastConfirmedOrder.address.fullName)}</strong>. Your simulated order has been registered.
        </p>

        <div class="order-id-badge">
          ORDER ID: ${lastConfirmedOrder.orderId}
        </div>

        <div class="order-summary-box">
          <div class="order-summary-row">
            <span>Estimated Delivery:</span>
            <strong style="color: #16A34A;">${lastConfirmedOrder.deliveryDate}</strong>
          </div>
          <div class="order-summary-row">
            <span>Payment Method:</span>
            <strong>${lastConfirmedOrder.paymentMethod.toUpperCase()} (Simulated)</strong>
          </div>
          <div class="order-summary-row">
            <span>Delivery Address:</span>
            <span>${escapeHtml(lastConfirmedOrder.address.address)}, ${escapeHtml(lastConfirmedOrder.address.city)} - ${escapeHtml(lastConfirmedOrder.address.pincode)}</span>
          </div>
          <div class="order-summary-row">
            <span>Total Amount Paid:</span>
            <strong style="color: var(--color-blue); font-size: 1.1rem;">${SHINE_CATALOG.formatINR(lastConfirmedOrder.totalAmount)}</strong>
          </div>
        </div>

        <!-- Purchased items list -->
        <div style="text-align: left; margin-bottom: 20px;">
          <div style="font-size: 0.85rem; font-weight: 800; color: var(--color-text-main); margin-bottom: 8px;">
            Items Ordered (${lastConfirmedOrder.items.length}):
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${lastConfirmedOrder.items.map(item => `
              <div style="display: flex; justify-content: space-between; font-size: 0.84rem; padding: 6px 10px; background: #FFFFFF; border: 1px solid var(--color-border); border-radius: var(--radius-xs);">
                <span>${item.quantity}x ${escapeHtml(item.name)}</span>
                <strong>${SHINE_CATALOG.formatINR(item.price * item.quantity)}</strong>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
          <a href="products.html" class="btn-primary" style="padding: 12px 24px; font-size: 0.92rem;" onclick="closeCheckoutModal()">
            <i class="fa-solid fa-boxes-stacked"></i> Continue Shopping
          </a>
          <button class="btn-secondary" style="padding: 12px 20px; font-size: 0.92rem; border-color: var(--color-border); color: var(--color-text-main);" onclick="window.print()">
            <i class="fa-solid fa-print"></i> Print Demo Receipt
          </button>
        </div>

        <div class="checkout-disclaimer-alert" style="margin-top: 20px; text-align: center;">
          * This is a complete frontend demonstration. The shopping cart has been cleared from your local browser storage.
        </div>
      </div>
    `;
  }
}

function renderPaymentSubform(method) {
  if (method === 'upi') {
    return `
      <div style="background: #F8FAFC; border: 1px solid var(--color-border); border-radius: var(--radius-xs); padding: 14px; margin-bottom: 18px;">
        <label class="form-label">Enter Virtual Payment Address (VPA / UPI ID):</label>
        <div style="display: flex; gap: 8px;">
          <input type="text" class="checkout-input" placeholder="e.g. yourname@okhdfcbank" value="demo.shopper@okhdfcbank" readonly />
          <button type="button" class="btn-secondary" style="white-space: nowrap; font-size: 0.82rem; padding: 0 14px;" onclick="showToast('UPI VPA Verified (Demo)', 'success')">Verify</button>
        </div>
        <div style="font-size: 0.74rem; color: #16A34A; margin-top: 6px;">
          <i class="fa-solid fa-circle-check"></i> Demo UPI handle pre-verified for seamless testing
        </div>
      </div>
    `;
  } else if (method === 'card') {
    return `
      <div style="background: #F8FAFC; border: 1px solid var(--color-border); border-radius: var(--radius-xs); padding: 14px; margin-bottom: 18px;">
        <div class="checkout-form-grid" style="margin-bottom: 0;">
          <div class="form-group-full">
            <label class="form-label">Card Number (Demo Mock)</label>
            <input type="text" class="checkout-input" value="4532 •••• •••• 8890" readonly />
          </div>
          <div>
            <label class="form-label">Valid Thru</label>
            <input type="text" class="checkout-input" value="12/28" readonly />
          </div>
          <div>
            <label class="form-label">CVV</label>
            <input type="password" class="checkout-input" value="888" readonly />
          </div>
        </div>
      </div>
    `;
  } else if (method === 'cod') {
    return `
      <div style="background: #F8FAFC; border: 1px solid var(--color-border); border-radius: var(--radius-xs); padding: 14px; margin-bottom: 18px;">
        <div style="font-size: 0.86rem; color: var(--color-text-main); margin-bottom: 6px;">
          <i class="fa-solid fa-circle-check" style="color: #16A34A;"></i> Cash on Delivery available at your location with zero handling surcharge.
        </div>
        <div style="font-size: 0.76rem; color: var(--color-text-muted);">
          You can also scan a dynamic UPI QR code on the delivery agent's handheld terminal at doorstep.
        </div>
      </div>
    `;
  }
  return '';
}

function handleSaveAddress() {
  const fullName = document.getElementById('addrFullName')?.value.trim();
  const mobile = document.getElementById('addrMobile')?.value.trim();
  const pincode = document.getElementById('addrPincode')?.value.trim();
  const address = document.getElementById('addrLine')?.value.trim();
  const city = document.getElementById('addrCity')?.value.trim();
  const state = document.getElementById('addrState')?.value;
  const type = document.getElementById('addrType')?.value;

  if (!fullName || !mobile || !pincode || !address || !city) {
    showToast('Please fill all required address fields', 'danger');
    return;
  }

  checkoutAddress = { fullName, mobile, pincode, address, city, state, type };
  currentCheckoutStep = 2;
  updateCheckoutStepPills(2);
  renderCheckoutStepContent(2);
}

function handleConfirmPayment(totalAmount) {
  const cart = ShineStorage.getCart();
  if (cart.length === 0) return;

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };

  // Prepare confirmed order record
  lastConfirmedOrder = {
    orderId: `ST-${Date.now().toString().slice(-6)}`,
    items: cart.map(i => {
      const p = SHINE_CATALOG.getById(i.id);
      return {
        id: i.id,
        name: p ? p.name : 'Tech Product',
        price: p ? p.price : 0,
        quantity: i.quantity
      };
    }),
    totalAmount: totalAmount,
    deliveryDate: deliveryDate.toLocaleDateString('en-IN', options),
    address: { ...checkoutAddress },
    paymentMethod: selectedPaymentMethod
  };

  // Clear active cart from localStorage (Requirement 2)
  ShineStorage.saveCart([]);
  activeCoupon = null;

  currentCheckoutStep = 3;
  updateCheckoutStepPills(3);
  renderCheckoutStepContent(3);

  // Re-render cart in background so active cart view becomes empty
  renderCartPage();

  showToast('Simulated Order Placed Successfully!', 'success');
}

/**
 * Setup Category Nav & Drawer
 */
function setupCartCategoryNav() {
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
        <a href="cart.html" class="drawer-nav-item active"><i class="fa-solid fa-cart-shopping"></i> Cart</a>
        <a href="wishlist.html" class="drawer-nav-item"><i class="fa-solid fa-heart"></i> Wishlist</a>
      `;
    }
  }
}

/**
 * Helper: HTML escape
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
  setupCartCategoryNav();
  renderCartPage();

  // Close modal when clicking outside
  const modal = document.getElementById('checkoutModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCheckoutModal();
    });
  }
});
