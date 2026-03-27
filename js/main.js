document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if(menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Initialize cart count
    updateCartCount();

    // Fetch and display best sellers if on index page
    const bestSellersContainer = document.getElementById('best-sellers-container');
    if(bestSellersContainer) {
        fetchProducts().then(products => {
            const bestSellers = products.filter(p => p.bestSeller).slice(0, 6);
            renderProducts(bestSellers, bestSellersContainer);
        });
    }
});

// Fetch products from API (or JSON directly)
async function fetchProducts() {
    try {
        const response = await fetch('./data/products.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Render products to a specific container
function renderProducts(products, container) {
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No products found.</p>';
        return;
    }

    products.forEach(product => {
        const productHtml = `
            <div class="product-card" onclick="goToProduct(${product.id})">
                <div class="product-img">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">₹${product.price}</div>
                    <div class="product-actions">
                        <a href="product-details.html?id=${product.id}" class="btn-outline">View Details</a>
                        <button onclick="addToCart(${product.id})" class="btn-add">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', productHtml);
    });
}

// Cart Functionality
function getCart() {
    const cart = localStorage.getItem('healthytummy_cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('healthytummy_cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if(badge) {
        badge.textContent = count;
    }
}

async function addToCart(productId) {
    const products = await fetchProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;

    const cart = getCart();
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

    saveCart(cart);
    
    // Optional: Show a fancy toast notification here instead of alert
    alert(`${product.name} added to cart!`);
}

// --- Rose Chatbot Implementation ---
document.addEventListener('DOMContentLoaded', initializeChatbot);

let allProductsForBot = [];
let currentBotProduct = null;
let isChatOpen = false;

async function initializeChatbot() {
    allProductsForBot = await fetchProducts();
    
    // Inject HTML
    const chatbotHtml = `
        <div class="rose-chatbot">
            <div class="rose-window" id="rose-window">
                <div class="rose-header">
                    <div><i class="fa-solid fa-robot"></i> Rose 🌹</div>
                    <div class="rose-close" onclick="toggleChat()">&times;</div>
                </div>
                <div class="rose-messages" id="rose-messages"></div>
            </div>
            <div class="rose-bubble" onclick="toggleChat()">
                <i class="fa-solid fa-comments"></i>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatbotHtml);
    
    // Start flow
    showCategories();
}

function toggleChat() {
    isChatOpen = !isChatOpen;
    const windowEl = document.getElementById('rose-window');
    windowEl.classList.toggle('active', isChatOpen);
}

function scrollToBottomOfChat() {
    const msgs = document.getElementById('rose-messages');
    msgs.scrollTop = msgs.scrollHeight;
}

function appendBotMessage(text) {
    const msgs = document.getElementById('rose-messages');
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-msg bot';
    msgEl.innerHTML = text;
    msgs.appendChild(msgEl);
    scrollToBottomOfChat();
}

function appendUserMessage(text) {
    const msgs = document.getElementById('rose-messages');
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-msg user';
    msgEl.innerHTML = text;
    msgs.appendChild(msgEl);
    scrollToBottomOfChat();
}

function disablePreviousOptions() {
    const optionsContainers = document.querySelectorAll('#rose-messages .chat-options');
    optionsContainers.forEach(container => {
        container.style.opacity = '0.5';
        container.style.pointerEvents = 'none';
        container.classList.remove('chat-options'); 
    });
}

function appendOptions(options, callback) {
    disablePreviousOptions();
    const msgs = document.getElementById('rose-messages');
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'chat-options';
    
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'chat-option-btn';
        btn.textContent = opt.label;
        btn.onclick = () => {
            appendUserMessage(opt.label);
            callback(opt.value);
        };
        optionsContainer.appendChild(btn);
    });
    
    msgs.appendChild(optionsContainer);
    scrollToBottomOfChat();
}

function showCategories() {
    appendBotMessage("Hi! I'm Rose 🌹. Which category would you like to explore?");
    const categories = ['Millet Foods', 'Health Mixes', 'Dry Snacks', 'Herbal Products'];
    const options = categories.map(c => ({label: c, value: c}));
    appendOptions(options, selectedCategory => {
        showProductsForChat(selectedCategory);
    });
}

function showProductsForChat(category) {
    const filtered = allProductsForBot.filter(p => p.category === category);
    if(filtered.length === 0) {
        appendBotMessage(`Sorry, no products found in ${category}.`);
        showPostAction();
        return;
    }
    appendBotMessage(`Here are our ${category}:`);
    const options = filtered.map(p => ({label: p.name, value: p}));
    appendOptions(options, selectedProduct => {
        currentBotProduct = selectedProduct;
        showProductActions(selectedProduct);
    });
}

function showProductActions(product) {
    appendBotMessage(`What would you like to do with <b>${product.name}</b>?`);
    const options = [
        {label: 'View Benefits', value: 'benefits'},
        {label: 'View Price', value: 'price'},
        {label: 'Add to Cart', value: 'add'}
    ];
    appendOptions(options, action => {
        if (action === 'benefits') {
            const benefitsHtml = `<ul style="margin:0; padding-left:20px;"><li>${product.benefits.join('</li><li>')}</li></ul>`;
            appendBotMessage(`<b>Benefits:</b><br>${benefitsHtml}`);
            setTimeout(() => showProductActions(product), 800);
        } else if (action === 'price') {
            appendBotMessage(`The price is <b>₹${product.price}</b>`);
            setTimeout(() => showProductActions(product), 800);
        } else if (action === 'add') {
            addToCartBot(product);
            appendBotMessage(`<b>${product.name}</b> added to cart! 🛒`);
            setTimeout(() => showPostAction(), 800);
        }
    });
}

function addToCartBot(product) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);
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
    saveCart(cart);
}
function goToProduct(id) {
    window.location.href = `product-details.html?id=${id}`;
}

function showPostAction() {
    appendBotMessage("What would you like to do next?");
    const options = [
        {label: 'View More Products', value: 'more'},
        {label: 'Checkout', value: 'checkout'}
    ];
    appendOptions(options, action => {
        if(action === 'more') {
            showCategories();
        } else if(action === 'checkout') {
            window.location.href = 'checkout.html';
        }
    });
}
