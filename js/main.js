// TechGear Pro - Main JavaScript File
// Showcasing JavaScript Skills for WebFX

// Global Variables and State Management
let products = [];
let filteredProducts = [];
let cart = [];
let currentCategory = 'all';
let searchTerm = '';

// DOM Elements
const productsContainer = document.getElementById('products-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const contactForm = document.getElementById('contact-form');

// Application Initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
async function initializeApp() {
    try {
        await loadProducts();
        displayProducts(products);
        setupEventListeners();
        loadCartFromStorage();
        updateCartDisplay();
        
        // Add loading animation
        document.body.classList.add('loaded');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load products. Please refresh the page.');
    }
}

// Load Products from JSON
async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) throw new Error('Failed to fetch products');
        products = await response.json();
        filteredProducts = [...products];
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to sample products if JSON fails
        products = getSampleProducts();
        filteredProducts = [...products];
    }
}

// Fallback sample products
function getSampleProducts() {
    return [
        {
            id: 1,
            name: "Wireless Noise-Cancelling Headphones",
            category: "headphones",
            price: 299.99,
            originalPrice: 349.99,
            image: "https://via.placeholder.com/300x200/007bff/ffffff?text=Wireless+Headphones",
            description: "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
            features: ["Active Noise Cancellation", "30-hour battery", "Bluetooth 5.0", "Voice Assistant"],
            rating: 4.8,
            reviews: 1247,
            inStock: true
        },
        {
            id: 2,
            name: "USB-C to Lightning Cable",
            category: "cables",
            price: 29.99,
            originalPrice: 39.99,
            image: "https://via.placeholder.com/300x200/28a745/ffffff?text=USB-C+Cable",
            description: "High-quality braided USB-C to Lightning cable for fast charging and data transfer.",
            features: ["Fast Charging", "Data Transfer", "Braided Design", "1.5m Length"],
            rating: 4.5,
            reviews: 892,
            inStock: true
        }
    ];
}

// Display Products
function displayProducts(productsToShow) {
    if (!productsContainer) return;
    
    if (productsToShow.length === 0) {
        productsContainer.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h3 class="text-muted">No products found</h3>
                    <p class="text-muted">Try adjusting your search or filter criteria</p>
                </div>
            </div>
        `;
        return;
    }
    
    productsContainer.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
    
    // Add animation delay for cards
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
}

// Create Product Card HTML
function createProductCard(product) {
    const discountPercent = product.originalPrice ? 
        Math.round((1 - product.price / product.originalPrice) * 100) : 0;
    
    const stockStatus = product.inStock ? 
        '<span class="badge bg-success">In Stock</span>' : 
        '<span class="badge bg-danger">Out of Stock</span>';
    
    const originalPriceHTML = product.originalPrice ? 
        `<small class="text-muted text-decoration-line-through">$${product.originalPrice}</small>` : '';
    
    const discountBadge = discountPercent > 0 ? 
        `<div class="position-absolute top-0 start-0 m-2">
            <span class="badge bg-danger">${discountPercent}% OFF</span>
        </div>` : '';
    
    const stars = generateStarRating(product.rating);
    
    return `
        <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
            <div class="card product-card h-100 position-relative">
                ${discountBadge}
                <img src="${product.image}" class="card-img-top" alt="${product.name}" loading="lazy">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <div class="mb-2">
                        ${stars}
                        <small class="text-muted ms-2">(${product.reviews} reviews)</small>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="price">
                            $${product.price}
                            ${originalPriceHTML}
                        </div>
                        ${stockStatus}
                    </div>
                    <div class="features mb-3">
                        ${product.features.slice(0, 3).map(feature => 
                            `<small class="badge bg-light text-dark me-1">${feature}</small>`
                        ).join('')}
                    </div>
                    <button class="btn btn-primary w-100 add-to-cart-btn" 
                            onclick="addToCart(${product.id})"
                            ${!product.inStock ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus me-2"></i>
                        ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Generate Star Rating
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star text-warning"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt text-warning"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star text-warning"></i>';
    }
    return stars;
}

// Setup Event Listeners
function setupEventListeners() {
    // Search functionality
    searchInput?.addEventListener('input', debounce(handleSearch, 300));
    searchBtn?.addEventListener('click', handleSearch);
    searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    });
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            handleCategoryFilter(button.dataset.category);
        });
    });
    
    // Cart functionality
    cartBtn?.addEventListener('click', () => cartModal.show());
    checkoutBtn?.addEventListener('click', handleCheckout);
    
    // Contact form
    contactForm?.addEventListener('submit', handleContactForm);
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle Search
function handleSearch() {
    searchTerm = searchInput?.value.toLowerCase().trim() || '';
    applyFilters();
}

// Handle Category Filter
function handleCategoryFilter(category) {
    currentCategory = category;
    
    // Update active filter button
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    applyFilters();
}

// Apply Filters
function applyFilters() {
    filteredProducts = products.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = searchTerm === '' || 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.features.some(feature => feature.toLowerCase().includes(searchTerm));
        
        return matchesCategory && matchesSearch;
    });
    
    displayProducts(filteredProducts);
    
    // Update URL without page reload
    const url = new URL(window.location);
    if (currentCategory !== 'all') {
        url.searchParams.set('category', currentCategory);
    } else {
        url.searchParams.delete('category');
    }
    if (searchTerm) {
        url.searchParams.set('search', searchTerm);
    } else {
        url.searchParams.delete('search');
    }
    window.history.replaceState({}, '', url);
}

// Shopping Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.inStock) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    showNotification(`${product.name} added to cart!`, 'success');
    
    // Add button animation
    const button = event.target.closest('.add-to-cart-btn');
    if (button) {
        button.classList.add('btn-success');
        button.innerHTML = '<i class="fas fa-check me-2"></i>Added!';
        setTimeout(() => {
            button.classList.remove('btn-success');
            button.innerHTML = '<i class="fas fa-cart-plus me-2"></i>Add to Cart';
        }, 1000);
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    saveCartToStorage();
    displayCartItems();
}

function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartDisplay();
        saveCartToStorage();
        displayCartItems();
    }
}

function updateCartDisplay() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) {
        cartTotal.textContent = total.toFixed(2);
    }
    
    // Update cart button badge
    if (cartBtn) {
        cartBtn.classList.toggle('btn-outline-light', totalItems === 0);
        cartBtn.classList.toggle('btn-light', totalItems > 0);
    }
}

function displayCartItems() {
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Your cart is empty</h5>
                <p class="text-muted">Add some products to get started!</p>
            </div>
        `;
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${item.price}</div>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateCartQuantity(${item.id}, -1)" class="btn-quantity">-</button>
                <span class="mx-2">${item.quantity}</span>
                <button onclick="updateCartQuantity(${item.id}, 1)" class="btn-quantity">+</button>
            </div>
            <button onclick="removeFromCart(${item.id})" class="btn btn-sm btn-outline-danger ms-2">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Cart Modal Event Listener
document.getElementById('cartModal')?.addEventListener('shown.bs.modal', displayCartItems);

// Storage Functions
function saveCartToStorage() {
    localStorage.setItem('techgear-cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('techgear-cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
}

// Checkout Function
function handleCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'warning');
        return;
    }
    
    // Simulate checkout process
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    showNotification('Redirecting to checkout...', 'info');
    
    setTimeout(() => {
        alert(`Thank you for your purchase! Total: $${total.toFixed(2)}\n\nThis is a demo site built for WebFX portfolio.`);
        cart = [];
        updateCartDisplay();
        saveCartToStorage();
        cartModal.hide();
    }, 1500);
}

// Contact Form Handler
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };
    
    // Simulate form submission
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span class="loading"></span> Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Message sent successfully!', 'success');
        e.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 150);
    }, 3000);
}

// Error Handler
function showError(message) {
    console.error(message);
    showNotification(message, 'danger');
}

// Utility Functions
function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Initialize URL parameters on page load
function initializeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (category && category !== 'all') {
        handleCategoryFilter(category);
    }
    
    if (search) {
        if (searchInput) {
            searchInput.value = search;
        }
        handleSearch();
    }
}

// Performance Optimization
function lazyLoadImages() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Initialize URL parameters after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeFromURL, 100);
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addToCart,
        removeFromCart,
        updateCartQuantity,
        handleSearch,
        handleCategoryFilter,
        formatPrice
    };
} 