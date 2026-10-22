/**
 * SHINE TECH - Product Details Page Engine (js/product-details.js)
 * Manages dynamic product loading, image gallery, quantity stepper,
 * PIN delivery estimator, illustrative EMI calculator, specifications,
 * customer reviews, and related products rail.
 */

// State for the current page
let currentProduct = null;
let currentSelectedQty = 1;
let currentActiveImageIndex = 0;
let userDemoReviews = [];

/**
 * Category-specific alternate gallery images for realistic multi-angle view
 */
function getCategoryAlternateImages(product) {
  const primary = product.image;
  const cat = (product.category || '').toLowerCase();

  const alternateMap = {
    mobiles: [
      primary,
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'
    ],
    laptops: [
      primary,
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
    ],
    smartwatches: [
      primary,
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&auto=format&fit=crop&q=80'
    ],
    headphones: [
      primary,
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80'
    ],
    earbuds: [
      primary,
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&auto=format&fit=crop&q=80'
    ],
    speakers: [
      primary,
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80'
    ],
    chargers: [
      primary,
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&auto=format&fit=crop&q=80'
    ],
    'power-banks': [
      primary,
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1593121925328-369cc8459c08?w=600&auto=format&fit=crop&q=80'
    ],
    adapters: [
      primary,
      'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80'
    ],
    cpus: [
      primary,
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'
    ],
    motherboards: [
      primary,
      'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
    ],
    gpus: [
      primary,
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
    ],
    ram: [
      primary,
      'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
    ],
    ssds: [
      primary,
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=80'
    ],
    keyboards: [
      primary,
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80'
    ],
    mouse: [
      primary,
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80'
    ],
    'laptop-accessories': [
      primary,
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'
    ],
    'mobile-accessories': [
      primary,
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80'
    ]
  };

  if (alternateMap[cat]) {
    return alternateMap[cat];
  }

  // Generic fallback 4 images
  return [
    primary,
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80'
  ];
}

/**
 * Generates sample customer reviews tailored to the product
 */
function getSampleReviews(product) {
  return [
    {
      id: 'rev-1',
      author: 'Vikramaditya S.',
      verified: true,
      rating: 5,
      date: '12 October 2026',
      headline: 'Outstanding build quality and exceeds expectations!',
      body: `I have been using this ${product.name} for over three weeks now. The performance, responsiveness, and premium finish are top-notch. Battery efficiency and thermal management are very impressive. Highly recommended for power users!`,
      helpfulCount: 38,
      liked: false
    },
    {
      id: 'rev-2',
      author: 'Ananya Deshmukh',
      verified: true,
      rating: 5,
      date: '28 September 2026',
      headline: 'Best purchase in this price range. Very satisfied!',
      body: `Delivered by SHINE TECH in secure, sealed packaging within 48 hours. The product is 100% genuine and verified on the official manufacturer portal. Everything functions smoothly as advertised.`,
      helpfulCount: 24,
      liked: false
    },
    {
      id: 'rev-3',
      author: 'Karthik Ramanathan',
      verified: true,
      rating: 4,
      date: '14 September 2026',
      headline: 'Solid performance with great features',
      body: `Great product overall. Setup took less than five minutes. Premium aesthetics and dependable daily performance. Would have loved a slightly longer braided cable in the box, but otherwise a 5-star experience.`,
      helpfulCount: 15,
      liked: false
    }
  ];
}

/**
 * Initializes the Product Details Page
 */
function initProductDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  // Populate header category navigation & drawer
  setupCategoryNav();

  if (typeof SHINE_CATALOG === 'undefined') {
    renderCatalogLoadingError();
    return;
  }

  // Handle missing or invalid product ID
  if (!productId) {
    renderProductNotFoundError('No product specified. Please select an item from our catalog.');
    return;
  }

  const product = SHINE_CATALOG.getById(productId);
  if (!product) {
    renderProductNotFoundError(`Product ID "${escapeHtml(productId)}" does not exist in our catalog or has been moved.`);
    return;
  }

  currentProduct = product;
  currentSelectedQty = 1;
  currentActiveImageIndex = 0;
  userDemoReviews = getSampleReviews(product);

  // Update page title & meta
  document.title = `${product.name} | SHINE TECH`;

  // Render Breadcrumb
  renderBreadcrumb(product);

  // Render Main Layout (Gallery, Info, Specs, Reviews)
  renderProductDetails(product);

  // Render Similar Products Rail
  renderSimilarProducts(product);

  // Bind Shelf Scroll Arrows
  setupRailScroll();
}

/**
 * Setup Category Navigation Strip & Mobile Drawer
 */
function setupCategoryNav() {
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
        <a href="wishlist.html" class="drawer-nav-item"><i class="fa-solid fa-heart"></i> Wishlist</a>
      `;
    }
  }
}

/**
 * Render Breadcrumb Navigation
 */
function renderBreadcrumb(product) {
  const breadcrumb = document.getElementById('detailsBreadcrumb');
  if (!breadcrumb) return;

  breadcrumb.innerHTML = `
    <a href="../index.html"><i class="fa-solid fa-house"></i> Home</a>
    <span class="crumb-sep"><i class="fa-solid fa-chevron-right"></i></span>
    <a href="products.html?category=${product.category}">${product.categoryName}</a>
    <span class="crumb-sep"><i class="fa-solid fa-chevron-right"></i></span>
    <a href="products.html?category=${product.category}&search=${encodeURIComponent(product.brand)}">${product.brand}</a>
    <span class="crumb-sep"><i class="fa-solid fa-chevron-right"></i></span>
    <span class="current-crumb" title="${escapeHtml(product.name)}">${product.name}</span>
  `;
}

/**
 * Render Product Details Layout
 */
function renderProductDetails(product) {
  const container = document.getElementById('detailsContainer');
  if (!container) return;

  const inWish = isInWishlist(product.id);
  const galleryImages = getCategoryAlternateImages(product);
  const savingsAmount = product.originalPrice - product.price;
  const isAvailable = product.inStock !== false;

  // Initial EMI calculation for 6 months @ 14%
  const initialEMI = calculateEMI(product.price, 14, 6);

  container.innerHTML = `
    <div class="details-main-grid">
      
      <!-- ================= Left Column: Gallery & Action Buttons ================= -->
      <div class="details-gallery-col">
        
        <!-- Main Image Card -->
        <div class="gallery-main-card">
          <img id="mainGalleryImg" 
               src="${galleryImages[0]}" 
               alt="${escapeHtml(product.name)}" 
               class="gallery-main-img" 
               onerror="handleImageError(this, '${product.id}')" />
          
          <!-- Floating Wishlist Button -->
          <button class="gallery-wishlist-btn ${inWish ? 'active' : ''}" 
                  id="detailWishlistBtn"
                  onclick="toggleWishlist('${product.id}', this)"
                  aria-label="Save to Wishlist"
                  title="Add to Wishlist">
            <i class="fa-solid fa-heart"></i>
          </button>

          <!-- Floating SHINE Assured Badge -->
          <div class="gallery-badge-assured">
            <i class="fa-solid fa-shield-halved"></i>
            <span>SHINE ASSURED &bull; 100% GENUINE</span>
          </div>
        </div>

        <!-- Clickable Thumbnails Strip -->
        <div class="gallery-thumbnails-strip" id="galleryThumbnails">
          ${galleryImages.map((imgUrl, idx) => `
            <div class="gallery-thumb-item ${idx === 0 ? 'active' : ''}" 
                 data-idx="${idx}"
                 onclick="switchGalleryImage(${idx}, '${imgUrl}')"
                 tabindex="0"
                 aria-label="Product thumbnail view ${idx + 1}">
              <img src="${imgUrl}" alt="Thumbnail ${idx + 1}" onerror="handleImageError(this, '${product.id}')" />
            </div>
          `).join('')}
        </div>

        <!-- Actions Card: Quantity Stepper, Add to Cart, Buy Now -->
        <div class="details-actions-card">
          
          <!-- Quantity Row -->
          <div class="details-qty-row">
            <div class="details-qty-label">
              <span>Quantity:</span>
              <span class="details-qty-limit">(Max 5 units)</span>
            </div>
            
            <div class="qty-stepper">
              <button class="qty-btn" id="qtyMinusBtn" onclick="stepQuantity(-1)" aria-label="Decrease quantity" disabled>
                <i class="fa-solid fa-minus"></i>
              </button>
              <input type="text" 
                     class="qty-input" 
                     id="qtyInput" 
                     value="1" 
                     readonly 
                     aria-label="Selected quantity" />
              <button class="qty-btn" id="qtyPlusBtn" onclick="stepQuantity(1)" aria-label="Increase quantity">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>

          <!-- Buttons Group -->
          <div class="details-btn-group">
            <button class="btn-detail-cart" id="addToCartBtn" onclick="handleDetailAddToCart()">
              <i class="fa-solid fa-cart-shopping"></i> ADD TO CART
            </button>
            <button class="btn-detail-buy" id="buyNowBtn" onclick="handleDetailBuyNow()">
              <i class="fa-solid fa-bolt"></i> BUY NOW
            </button>
          </div>

          <!-- Buyer Protection Strip -->
          <div class="details-trust-strip">
            <div class="trust-strip-item">
              <i class="fa-solid fa-truck-fast"></i>
              <span>Free Express Delivery</span>
            </div>
            <div class="trust-strip-item">
              <i class="fa-solid fa-rotate-left"></i>
              <span>7 Days Replacement</span>
            </div>
            <div class="trust-strip-item">
              <i class="fa-solid fa-shield-check"></i>
              <span>1 Year Warranty</span>
            </div>
          </div>

        </div>

      </div>

      <!-- ================= Right Column: Information, Pricing, Specs ================= -->
      <div class="details-info-col">
        
        <!-- Primary Info Card -->
        <div class="details-card-box">
          
          <a href="products.html?category=${product.category}&search=${encodeURIComponent(product.brand)}" class="details-brand-pill">
            <i class="fa-solid fa-tag"></i> ${product.brand}
          </a>

          <h1 class="details-product-title">${product.name}</h1>

          <!-- Rating & Stock Row -->
          <div class="details-meta-row">
            <span class="details-rating-badge">
              ${product.rating} <i class="fa-solid fa-star"></i>
            </span>
            <span class="details-rating-count">
              ${product.ratingCount.toLocaleString('en-IN')} Ratings &amp; Verified Reviews
            </span>
            <span class="details-stock-status ${isAvailable ? 'in-stock' : 'low-stock'}">
              <i class="fa-solid ${isAvailable ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
              ${isAvailable ? 'In Stock (Ready to Ship)' : 'Limited Stock'}
            </span>
          </div>

          <!-- Pricing Panel -->
          <div class="details-price-panel">
            <div class="details-price-main-row">
              <span class="details-current-price">
                ${SHINE_CATALOG.formatINR(product.price)}
              </span>
              <span class="details-original-price">
                ${SHINE_CATALOG.formatINR(product.originalPrice)}
              </span>
              <span class="details-discount-pill">
                ${product.discount}% off
              </span>
            </div>
            <div class="details-savings-text">
              <i class="fa-solid fa-sparkles"></i>
              <span>You save ${SHINE_CATALOG.formatINR(savingsAmount)} (${product.discount}%) on this purchase</span>
            </div>
            <div class="details-tax-note">Inclusive of all applicable taxes &amp; import duties</div>
          </div>

          <!-- Flipkart-Style Bank Offers -->
          <div class="bank-offers-section">
            <h3 class="section-subheading">
              <i class="fa-solid fa-tags" style="color: #16A34A;"></i> Available Bank &amp; Marketplace Offers
            </h3>
            <div class="bank-offers-list">
              <div class="bank-offer-item">
                <i class="fa-solid fa-circle-check bank-offer-tag"></i>
                <div>
                  <span class="bank-offer-code">Bank Offer:</span> 5% Unlimited Cashback on SHINE Axis Bank Credit Card (up to ₹2,000).
                </div>
              </div>
              <div class="bank-offer-item">
                <i class="fa-solid fa-circle-check bank-offer-tag"></i>
                <div>
                  <span class="bank-offer-code">Special Price:</span> Get extra ₹${Math.min(3000, Math.max(500, Math.floor(product.price * 0.04)))} off (price inclusive of coupon discount).
                </div>
              </div>
              <div class="bank-offer-item">
                <i class="fa-solid fa-circle-check bank-offer-tag"></i>
                <div>
                  <span class="bank-offer-code">Partner Offer:</span> Purchase now &amp; receive a ₹500 welcome gift card on tech accessories.
                </div>
              </div>
              <div class="bank-offer-item">
                <i class="fa-solid fa-circle-check bank-offer-tag"></i>
                <div>
                  <span class="bank-offer-code">No Cost EMI:</span> Zero processing fee &amp; no-cost EMI options available on top banks.
                </div>
              </div>
            </div>
          </div>

          <!-- Indian PIN Code Delivery Checker (Requirement 4) -->
          <div class="pincode-checker-box">
            <div class="pincode-header">
              <h4><i class="fa-solid fa-location-dot" style="color: var(--color-blue);"></i> Check Delivery &amp; Services</h4>
              <span style="font-size: 0.8rem; color: var(--color-text-muted);">Enter 6-digit Indian PIN</span>
            </div>
            <form class="pincode-input-group" id="pincodeForm" onsubmit="event.preventDefault(); checkIndianPincode();">
              <input type="text" 
                     class="pincode-input" 
                     id="pincodeInput" 
                     placeholder="e.g. 560001, 110001" 
                     maxlength="6" 
                     autocomplete="postal-code" 
                     aria-label="Enter 6 digit PIN code" />
              <button type="submit" class="pincode-check-btn" id="pincodeCheckBtn">Check</button>
            </form>
            <div class="pincode-result-box" id="pincodeResult"></div>
            <div class="pincode-disclaimer">
              * Note: Delivery dates and courier availability are illustrative estimates for demonstration purposes, not live logistics integrations.
            </div>
          </div>

          <!-- Illustrative EMI Calculator (Requirement 4) -->
          <div class="emi-calculator-box" id="emiCalcContainer">
            <div class="emi-toggle-header" onclick="toggleEMICalculator()">
              <div class="emi-toggle-header-left">
                <span class="emi-badge">EMI PLANS</span>
                <span class="emi-summary-text" id="emiSummaryPreview">
                  Starts at ${SHINE_CATALOG.formatINR(initialEMI.emi)}/month
                </span>
              </div>
              <i class="fa-solid fa-chevron-down emi-chevron" id="emiChevron"></i>
            </div>
            
            <div class="emi-content-drawer" id="emiDrawer">
              <div style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 8px;">
                Select Loan Tenure:
              </div>
              
              <div class="emi-tenure-tabs" id="emiTenureTabs">
                ${[3, 6, 9, 12, 18, 24].map(months => `
                  <button type="button" 
                          class="emi-tenure-btn ${months === 6 ? 'active' : ''}" 
                          data-months="${months}"
                          onclick="selectEMITenure(${months})">
                    ${months} Months
                  </button>
                `).join('')}
              </div>

              <div class="emi-breakdown-card" id="emiBreakdownCard">
                <div>
                  <div class="emi-metric-label">Monthly EMI</div>
                  <div class="emi-metric-val highlight" id="emiMonthlyVal">${SHINE_CATALOG.formatINR(initialEMI.emi)}</div>
                </div>
                <div>
                  <div class="emi-metric-label">Total Interest (14% p.a.)</div>
                  <div class="emi-metric-val" id="emiInterestVal">${SHINE_CATALOG.formatINR(initialEMI.totalInterest)}</div>
                </div>
                <div>
                  <div class="emi-metric-label">Total Cost</div>
                  <div class="emi-metric-val" id="emiTotalVal">${SHINE_CATALOG.formatINR(initialEMI.totalAmount)}</div>
                </div>
              </div>

              <div class="emi-disclaimer">
                * Note: EMI calculations are illustrative estimates calculated for demonstration purposes. Actual bank interest rates, processing fees, and credit limits are determined solely by the issuing financial institution.
              </div>
            </div>
          </div>

          <!-- Key Highlights List -->
          <h3 class="section-subheading">
            <i class="fa-solid fa-circle-check" style="color: var(--color-blue);"></i> Key Highlights &amp; Features
          </h3>
          <div class="highlights-list">
            ${product.specs.map(spec => `
              <div class="highlight-item">
                <i class="fa-solid fa-check"></i>
                <span>${spec}</span>
              </div>
            `).join('')}
          </div>

          <!-- Product Description -->
          <h3 class="section-subheading" style="margin-top: 20px;">
            <i class="fa-solid fa-align-left" style="color: var(--color-blue);"></i> Product Description
          </h3>
          <p style="font-size: 0.94rem; color: #4B5563; line-height: 1.65; margin-bottom: 24px;">
            ${product.description}
          </p>

          <!-- Tabs: Full Specifications & Customer Reviews -->
          <div class="details-tabs-container">
            <div class="details-tab-nav" role="tablist">
              <button class="details-tab-btn active" id="tabBtnSpecs" onclick="switchDetailsTab('specs')" role="tab">
                <i class="fa-solid fa-list-check"></i> Specifications
              </button>
              <button class="details-tab-btn" id="tabBtnReviews" onclick="switchDetailsTab('reviews')" role="tab">
                <i class="fa-solid fa-star"></i> Ratings &amp; Reviews (${userDemoReviews.length + product.ratingCount})
              </button>
            </div>

            <!-- Panel 1: Specifications -->
            <div class="details-tab-panel active" id="panelSpecs" role="tabpanel">
              <div class="specs-table-wrapper">
                
                <!-- General Specs Card -->
                <div class="specs-group-card">
                  <div class="specs-group-title">General Information</div>
                  <table class="specs-table">
                    <tbody>
                      <tr>
                        <td class="spec-key">In The Box</td>
                        <td class="spec-value">Handset/Main Hardware Device, Fast Charging Cable, Setup Guide, Official Warranty Card</td>
                      </tr>
                      <tr>
                        <td class="spec-key">Model Name</td>
                        <td class="spec-value">${escapeHtml(product.name)}</td>
                      </tr>
                      <tr>
                        <td class="spec-key">Product ID / SKU</td>
                        <td class="spec-value">${product.id.toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td class="spec-key">Brand</td>
                        <td class="spec-value">${product.brand}</td>
                      </tr>
                      <tr>
                        <td class="spec-key">Category</td>
                        <td class="spec-value">${product.categoryName}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Technical Specs Card -->
                <div class="specs-group-card">
                  <div class="specs-group-title">Technical Specifications &amp; Features</div>
                  <table class="specs-table">
                    <tbody>
                      ${product.specs.map((spec, i) => `
                        <tr>
                          <td class="spec-key">Feature ${i + 1}</td>
                          <td class="spec-value">${spec}</td>
                        </tr>
                      `).join('')}
                      <tr>
                        <td class="spec-key">Quality Assurance</td>
                        <td class="spec-value">SHINE Assured 42-point Quality Checked</td>
                      </tr>
                      <tr>
                        <td class="spec-key">Regulatory Compliance</td>
                        <td class="spec-value">BIS Certified, CE, RoHS Compliant</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Warranty Card -->
                <div class="specs-group-card">
                  <div class="specs-group-title">Warranty &amp; Service Terms</div>
                  <table class="specs-table">
                    <tbody>
                      <tr>
                        <td class="spec-key">Warranty Summary</td>
                        <td class="spec-value">1 Year Domestic Manufacturer Warranty on Hardware defects</td>
                      </tr>
                      <tr>
                        <td class="spec-key">Warranty Service Type</td>
                        <td class="spec-value">Authorized Brand Service Center / On-site support</td>
                      </tr>
                      <tr>
                        <td class="spec-key">Covered in Warranty</td>
                        <td class="spec-value">Manufacturing defects, component malfunctions under standard operating conditions</td>
                      </tr>
                      <tr>
                        <td class="spec-key">Not Covered in Warranty</td>
                        <td class="spec-value">Physical, water, cosmetic, liquid spill damages or unauthorized tampering</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

            <!-- Panel 2: Customer Reviews & Write Review Form -->
            <div class="details-tab-panel" id="panelReviews" role="tabpanel">
              
              <!-- Rating Score Overview -->
              <div class="reviews-breakdown-card">
                <div class="rating-score-box">
                  <div class="big-rating-number">
                    <span>${product.rating}</span>
                    <i class="fa-solid fa-star"></i>
                  </div>
                  <div class="rating-total-reviews">
                    ${(product.ratingCount + userDemoReviews.length).toLocaleString('en-IN')} Ratings &amp; Reviews
                  </div>
                  <div class="rating-demo-badge">Demonstration Data</div>
                </div>

                <!-- Star Percentage Distribution -->
                <div class="rating-bars-list">
                  <div class="rating-bar-row">
                    <span class="star-label">5 <i class="fa-solid fa-star"></i></span>
                    <div class="star-progress-track">
                      <div class="star-progress-fill" style="width: 74%; background: #16A34A;"></div>
                    </div>
                    <span class="star-pct">74%</span>
                  </div>
                  <div class="rating-bar-row">
                    <span class="star-label">4 <i class="fa-solid fa-star"></i></span>
                    <div class="star-progress-track">
                      <div class="star-progress-fill" style="width: 18%; background: #22C55E;"></div>
                    </div>
                    <span class="star-pct">18%</span>
                  </div>
                  <div class="rating-bar-row">
                    <span class="star-label">3 <i class="fa-solid fa-star"></i></span>
                    <div class="star-progress-track">
                      <div class="star-progress-fill" style="width: 5%; background: #F59E0B;"></div>
                    </div>
                    <span class="star-pct">5%</span>
                  </div>
                  <div class="rating-bar-row">
                    <span class="star-label">2 <i class="fa-solid fa-star"></i></span>
                    <div class="star-progress-track">
                      <div class="star-progress-fill" style="width: 2%; background: #F97316;"></div>
                    </div>
                    <span class="star-pct">2%</span>
                  </div>
                  <div class="rating-bar-row">
                    <span class="star-label">1 <i class="fa-solid fa-star"></i></span>
                    <div class="star-progress-track">
                      <div class="star-progress-fill" style="width: 1%; background: #EF4444;"></div>
                    </div>
                    <span class="star-pct">1%</span>
                  </div>
                </div>
              </div>

              <!-- Reviews List Container -->
              <div class="reviews-list-container" id="reviewsList">
                ${renderReviewsListHTML(userDemoReviews)}
              </div>

              <!-- Write a Review Form Card -->
              <div class="write-review-card">
                <h4><i class="fa-solid fa-pen-to-square" style="color: var(--color-blue);"></i> Write a Customer Review</h4>
                <p>Share your honest experience to help fellow tech shoppers make informed choices.</p>
                
                <form id="writeReviewForm" onsubmit="event.preventDefault(); submitCustomerReview();">
                  
                  <!-- Star Rating Selector -->
                  <div class="star-rating-select-group">
                    <label>Overall Rating:</label>
                    <div class="interactive-stars-row" id="starSelector">
                      ${[1, 2, 3, 4, 5].map(starNum => `
                        <i class="fa-solid fa-star star-choice ${starNum <= 5 ? 'active' : ''}" 
                           data-star="${starNum}"
                           onclick="setReviewStarRating(${starNum})"
                           onmouseover="previewStarRating(${starNum})"
                           onmouseout="resetStarPreview()"></i>
                      `).join('')}
                    </div>
                    <span id="starRatingLabel" style="font-size: 0.85rem; font-weight: 700; color: #16A34A; margin-left: 8px;">
                      5.0 (Excellent)
                    </span>
                  </div>

                  <div class="review-form-grid">
                    <input type="text" 
                           class="review-input" 
                           id="reviewAuthorInput" 
                           placeholder="Your Full Name (e.g. Siddharth Verma)" 
                           required />
                    <input type="text" 
                           class="review-input" 
                           id="reviewHeadlineInput" 
                           placeholder="Review Title (e.g. Phenomenal speed and display!)" 
                           required />
                  </div>

                  <textarea class="review-textarea" 
                            id="reviewBodyInput" 
                            placeholder="Write your detailed review here. Mention performance, durability, design, or accessories..." 
                            required></textarea>

                  <div class="review-form-submit-row">
                    <div class="review-demo-disclaimer">
                      * Demonstration mode: Reviews are stored locally in your current browser session and are not published to a live server.
                    </div>
                    <button type="submit" class="btn-submit-review">
                      <i class="fa-solid fa-paper-plane"></i> Submit Review
                    </button>
                  </div>

                </form>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  `;
}

/**
 * Renders the HTML for the customer reviews list
 */
function renderReviewsListHTML(reviews) {
  return reviews.map(rev => `
    <div class="review-item-card" id="${rev.id}">
      <div class="review-card-header">
        <div style="display: flex; align-items: center;">
          <span class="review-rating-pill">
            ${rev.rating} <i class="fa-solid fa-star"></i>
          </span>
          <span class="review-headline">${escapeHtml(rev.headline)}</span>
        </div>
        <span class="review-date">${rev.date}</span>
      </div>

      <div class="review-body-text">
        ${escapeHtml(rev.body)}
      </div>

      <div class="review-footer">
        <div class="reviewer-name">
          <span>${escapeHtml(rev.author)}</span>
          ${rev.verified ? `<span class="verified-badge"><i class="fa-solid fa-circle-check"></i> Certified Buyer</span>` : ''}
        </div>
        <button class="review-helpful-btn ${rev.liked ? 'liked' : ''}" 
                onclick="toggleHelpfulVote('${rev.id}')"
                aria-label="Vote helpful">
          <i class="fa-solid fa-thumbs-up"></i> Helpful (${rev.helpfulCount})
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * Handle gallery image thumbnail click
 */
function switchGalleryImage(index, imageUrl) {
  currentActiveImageIndex = index;
  const mainImg = document.getElementById('mainGalleryImg');
  if (mainImg) {
    mainImg.style.opacity = '0.4';
    setTimeout(() => {
      mainImg.src = imageUrl;
      mainImg.style.opacity = '1';
    }, 150);
  }

  // Update thumbnail active border
  const thumbnails = document.querySelectorAll('.gallery-thumb-item');
  thumbnails.forEach(t => {
    if (parseInt(t.getAttribute('data-idx')) === index) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });
}

/**
 * Quantity Stepper
 */
function stepQuantity(delta) {
  const input = document.getElementById('qtyInput');
  const minusBtn = document.getElementById('qtyMinusBtn');
  const plusBtn = document.getElementById('qtyPlusBtn');
  if (!input) return;

  let val = parseInt(input.value) || 1;
  val += delta;

  if (val < 1) val = 1;
  if (val > 5) val = 5;

  currentSelectedQty = val;
  input.value = val;

  if (minusBtn) minusBtn.disabled = val <= 1;
  if (plusBtn) plusBtn.disabled = val >= 5;
}

/**
 * Handle "Add to Cart" button click
 */
function handleDetailAddToCart() {
  if (!currentProduct) return;
  addToCart(currentProduct.id, currentSelectedQty, true);
}

/**
 * Handle "Buy Now" button click:
 * Adds selected product to cart with selected quantity and immediately navigates to cart.html
 */
function handleDetailBuyNow() {
  if (!currentProduct) return;
  addToCart(currentProduct.id, currentSelectedQty, false);
  window.location.href = 'cart.html';
}

/**
 * Indian PIN Code Validation and Delivery Date Estimator (Requirement 4)
 */
function checkIndianPincode() {
  const input = document.getElementById('pincodeInput');
  const resultBox = document.getElementById('pincodeResult');
  if (!input || !resultBox) return;

  const pin = input.value.trim();
  // Indian PIN codes: exactly 6 digits, first digit cannot be 0
  const pinRegex = /^[1-9][0-9]{5}$/;

  resultBox.className = 'pincode-result-box active';

  if (!pinRegex.test(pin)) {
    resultBox.innerHTML = `
      <div class="pincode-error">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>Please enter a valid 6-digit Indian PIN code (e.g., 560001, 110001, 400001).</span>
      </div>
    `;
    return;
  }

  // Calculate estimated delivery date: 2 business days ahead
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  const options = { weekday: 'long', day: 'numeric', month: 'short' };
  const formattedDate = deliveryDate.toLocaleDateString('en-IN', options);

  resultBox.innerHTML = `
    <div class="pincode-success">
      <div class="pincode-success-title">
        <i class="fa-solid fa-circle-check"></i>
        <span>Delivery Available for PIN ${escapeHtml(pin)}</span>
      </div>
      <div style="font-size: 0.84rem; color: #166534;">
        Estimated delivery by <strong>${formattedDate}</strong> | <span style="font-weight: 700; color: #16A34A;">FREE Shipping</span>
      </div>
      <div style="font-size: 0.8rem; color: #374151; margin-top: 2px;">
        <i class="fa-solid fa-hand-holding-dollar"></i> Cash on Delivery eligible &bull; 7-Day Replacement guarantee
      </div>
    </div>
  `;
}

/**
 * EMI Calculator Logic & State (Requirement 4)
 */
let selectedEMIMonths = 6;

function toggleEMICalculator() {
  const container = document.getElementById('emiCalcContainer');
  if (container) {
    container.classList.toggle('open');
  }
}

function calculateEMI(principal, annualRatePct, months) {
  const monthlyRate = (annualRatePct / 12) / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalAmount = emi * months;
  const totalInterest = totalAmount - principal;
  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalAmount: Math.round(totalAmount)
  };
}

function selectEMITenure(months) {
  if (!currentProduct) return;
  selectedEMIMonths = months;

  // Update tenure button styles
  const buttons = document.querySelectorAll('.emi-tenure-btn');
  buttons.forEach(btn => {
    if (parseInt(btn.getAttribute('data-months')) === months) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const res = calculateEMI(currentProduct.price, 14, months);

  const monthlyEl = document.getElementById('emiMonthlyVal');
  const interestEl = document.getElementById('emiInterestVal');
  const totalEl = document.getElementById('emiTotalVal');
  const previewEl = document.getElementById('emiSummaryPreview');

  if (monthlyEl) monthlyEl.textContent = SHINE_CATALOG.formatINR(res.emi);
  if (interestEl) interestEl.textContent = SHINE_CATALOG.formatINR(res.totalInterest);
  if (totalEl) totalEl.textContent = SHINE_CATALOG.formatINR(res.totalAmount);
  if (previewEl) previewEl.textContent = `Starts at ${SHINE_CATALOG.formatINR(res.emi)}/month (${months} mo)`;
}

/**
 * Tab Switching between Specifications and Reviews
 */
function switchDetailsTab(tabId) {
  const tabSpecs = document.getElementById('tabBtnSpecs');
  const tabReviews = document.getElementById('tabBtnReviews');
  const panelSpecs = document.getElementById('panelSpecs');
  const panelReviews = document.getElementById('panelReviews');

  if (tabId === 'specs') {
    if (tabSpecs) tabSpecs.classList.add('active');
    if (tabReviews) tabReviews.classList.remove('active');
    if (panelSpecs) panelSpecs.classList.add('active');
    if (panelReviews) panelReviews.classList.remove('active');
  } else {
    if (tabSpecs) tabSpecs.classList.remove('active');
    if (tabReviews) tabReviews.classList.add('active');
    if (panelSpecs) panelSpecs.classList.remove('active');
    if (panelReviews) panelReviews.classList.add('active');
  }
}

/**
 * Customer Review Interactive Star Selection
 */
let currentFormRating = 5;

function setReviewStarRating(star) {
  currentFormRating = star;
  updateStarIconsUI(star);

  const labelEl = document.getElementById('starRatingLabel');
  if (labelEl) {
    const textMap = {
      1: '1.0 (Poor)',
      2: '2.0 (Fair)',
      3: '3.0 (Average)',
      4: '4.0 (Good)',
      5: '5.0 (Excellent)'
    };
    labelEl.textContent = textMap[star] || `${star}.0`;
  }
}

function previewStarRating(star) {
  updateStarIconsUI(star);
}

function resetStarPreview() {
  updateStarIconsUI(currentFormRating);
}

function updateStarIconsUI(star) {
  const starIcons = document.querySelectorAll('#starSelector .star-choice');
  starIcons.forEach(icon => {
    const s = parseInt(icon.getAttribute('data-star'));
    if (s <= star) {
      icon.classList.add('active');
    } else {
      icon.classList.remove('active');
    }
  });
}

/**
 * Submit Customer Review (Local Demo Mode)
 */
function submitCustomerReview() {
  const authorInput = document.getElementById('reviewAuthorInput');
  const headlineInput = document.getElementById('reviewHeadlineInput');
  const bodyInput = document.getElementById('reviewBodyInput');

  if (!authorInput || !headlineInput || !bodyInput) return;

  const author = authorInput.value.trim();
  const headline = headlineInput.value.trim();
  const body = bodyInput.value.trim();

  if (!author || !headline || !body) {
    showToast('Please fill in all review fields', 'danger');
    return;
  }

  const newReview = {
    id: `rev-demo-${Date.now()}`,
    author: author,
    verified: true,
    rating: currentFormRating,
    date: 'Just now',
    headline: headline,
    body: body,
    helpfulCount: 0,
    liked: false
  };

  userDemoReviews.unshift(newReview);

  // Update reviews list HTML
  const reviewsContainer = document.getElementById('reviewsList');
  if (reviewsContainer) {
    reviewsContainer.innerHTML = renderReviewsListHTML(userDemoReviews);
  }

  // Update tab title review count
  const tabBtnReviews = document.getElementById('tabBtnReviews');
  if (tabBtnReviews && currentProduct) {
    tabBtnReviews.innerHTML = `<i class="fa-solid fa-star"></i> Ratings &amp; Reviews (${userDemoReviews.length + currentProduct.ratingCount})`;
  }

  // Reset form
  authorInput.value = '';
  headlineInput.value = '';
  bodyInput.value = '';
  setReviewStarRating(5);

  showToast('Thank you! Your verified review has been posted (Demonstration Mode).', 'success');
}

/**
 * Toggle Helpful Vote on Review
 */
function toggleHelpfulVote(reviewId) {
  const rev = userDemoReviews.find(r => r.id === reviewId);
  if (!rev) return;

  if (rev.liked) {
    rev.liked = false;
    rev.helpfulCount = Math.max(0, rev.helpfulCount - 1);
  } else {
    rev.liked = true;
    rev.helpfulCount += 1;
    showToast('Marked review as helpful', 'success');
  }

  const reviewsContainer = document.getElementById('reviewsList');
  if (reviewsContainer) {
    reviewsContainer.innerHTML = renderReviewsListHTML(userDemoReviews);
  }
}

/**
 * Similar Products Rail Rendering
 */
function renderSimilarProducts(product) {
  const rail = document.getElementById('similarProductsRail');
  const subtitle = document.getElementById('similarSubtitle');
  const viewAllLink = document.getElementById('similarViewAllLink');

  if (!rail) return;

  if (subtitle) {
    subtitle.textContent = `Explore more authentic ${product.categoryName} from top brands`;
  }
  if (viewAllLink) {
    viewAllLink.href = `products.html?category=${product.category}`;
  }

  let similar = SHINE_CATALOG.getByCategory(product.category).filter(p => p.id !== product.id);

  // If fewer than 4 in same category, supplement with featured tech
  if (similar.length < 4) {
    const extra = SHINE_CATALOG.getFeatured().filter(p => p.id !== product.id && !similar.some(s => s.id === p.id));
    similar = [...similar, ...extra];
  }

  similar = similar.slice(0, 8);

  rail.innerHTML = similar.map(p => createProductCardHTML(p)).join('');
}

/**
 * Setup Rail Scroll Arrows
 */
function setupRailScroll() {
  const rail = document.getElementById('similarProductsRail');
  const prevBtn = document.getElementById('railPrevBtn');
  const nextBtn = document.getElementById('railNextBtn');

  if (!rail || !prevBtn || !nextBtn) return;

  prevBtn.addEventListener('click', () => {
    rail.scrollBy({ left: -320, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    rail.scrollBy({ left: 320, behavior: 'smooth' });
  });
}

/**
 * Render Professional 404 / Product Not Found Card (Requirement 2)
 */
function renderProductNotFoundError(customMessage) {
  const container = document.getElementById('detailsContainer');
  const breadcrumb = document.getElementById('detailsBreadcrumb');
  const similarSection = document.getElementById('similarSection');

  document.title = 'Product Not Found | SHINE TECH';

  if (breadcrumb) {
    breadcrumb.innerHTML = `
      <a href="../index.html"><i class="fa-solid fa-house"></i> Home</a>
      <span class="crumb-sep"><i class="fa-solid fa-chevron-right"></i></span>
      <a href="products.html">Electronics</a>
      <span class="crumb-sep"><i class="fa-solid fa-chevron-right"></i></span>
      <span class="current-crumb">Product Not Found</span>
    `;
  }

  if (container) {
    container.innerHTML = `
      <div class="details-not-found-card">
        <div class="not-found-icon-circle">
          <i class="fa-solid fa-box-open"></i>
        </div>
        <h2 class="not-found-title">Product Not Found</h2>
        <p class="not-found-desc">
          ${customMessage || 'The electronics product you are looking for is currently unavailable or has been discontinued from our catalog.'}
        </p>
        <div class="not-found-btn-row">
          <a href="products.html" class="btn-primary" style="padding: 12px 28px; font-size: 0.95rem;">
            <i class="fa-solid fa-boxes-stacked"></i> Browse All 107 Products
          </a>
          <a href="../index.html" class="btn-secondary" style="padding: 12px 24px; font-size: 0.95rem; border-color: var(--color-border); color: var(--color-text-main);">
            <i class="fa-solid fa-house"></i> Go to Homepage
          </a>
        </div>
      </div>
    `;
  }

  // Populate similar shelf with trending tech
  if (similarSection && typeof SHINE_CATALOG !== 'undefined') {
    const rail = document.getElementById('similarProductsRail');
    const subtitle = document.getElementById('similarSubtitle');
    if (subtitle) subtitle.textContent = 'Discover our most popular tech products and deals';
    if (rail) {
      const trending = SHINE_CATALOG.getTrending().slice(0, 8);
      rail.innerHTML = trending.map(p => createProductCardHTML(p)).join('');
      setupRailScroll();
    }
  }
}

/**
 * Render Catalog Loading Error
 */
function renderCatalogLoadingError() {
  const container = document.getElementById('detailsContainer');
  if (container) {
    container.innerHTML = `
      <div class="details-not-found-card">
        <div class="not-found-icon-circle" style="background: #FEE2E2; color: #DC2626;">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h2 class="not-found-title">Catalog Loading Error</h2>
        <p class="not-found-desc">Unable to load the SHINE TECH product database. Please check your internet connection and refresh.</p>
        <button class="btn-primary" onclick="window.location.reload()">Reload Page</button>
      </div>
    `;
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

// Global browser init
document.addEventListener('DOMContentLoaded', () => {
  initProductDetailsPage();
});
