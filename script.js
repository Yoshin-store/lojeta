// ============================================
// NEON STREET - E-COMMERCE COMPLETO
// ============================================

class NeonStore {
    constructor() {
        this.products = [
            {
                id: 1,
                name: "Neon Gaming Skin Pack",
                price: 79.90,
                image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&h=500&fit=crop",
                category: "gaming"
            },
            {
                id: 2,
                name: "Streetwear Hoodie Premium",
                price: 199.90,
                image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
                category: "streetwear"
            },
            {
                id: 3,
                name: "Cyberpunk Avatar Pack",
                price: 49.90,
                image: "https://images.unsplash.com/photo-1611066770461-79c3e39072f2?w=500&h=500&fit=crop",
                category: "digital"
            },
            {
                id: 4,
                name: "Neon Controller Skin",
                price: 129.90,
                image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=500&fit=crop",
                category: "gaming"
            },
            {
                id: 5,
                name: "Limited Edition Cap",
                price: 89.90,
                image: "https://images.unsplash.com/photo-1578906952566-6e4059f7e01c?w=500&h=500&fit=crop",
                category: "streetwear"
            },
            {
                id: 6,
                name: "NFT Gaming Badge",
                price: 299.90,
                image: "https://images.unsplash.com/photo-1620325867503-23cefe9a29e2?w=500&h=500&fit=crop",
                category: "digital"
            }
        ];
        
        this.cart = JSON.parse(localStorage.getItem('neonCart')) || [];
        this.currentProduct = null;
        this.quantity = 1;
        this.couponDiscount = 0;
        
        this.init();
    }

    init() {
        // Remove loading após 2 segundos
        setTimeout(() => {
            this.hideLoading();
        }, 2000);
        
        this.bindEvents();
        this.renderProducts();
        this.updateCart();
        this.animateHero();
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    }

    bindEvents() {
        // Navbar
        document.querySelector('.hamburger').addEventListener('click', this.toggleMobileMenu);
        document.getElementById('cartToggle').addEventListener('click', this.toggleCart);
        document.getElementById('closeCart').addEventListener('click', this.closeCart);
        
        // Modals
        document.getElementById('closeModal').addEventListener('click', this.closeProductModal);
        document.getElementById('closeCheckout').addEventListener('click', this.closeCheckout);
        document.getElementById('closeSuccess').addEventListener('click', this.closeSuccess);
        
        // Hero buttons
        document.querySelector('.btn-buy-now').addEventListener('click', () => {
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        });
        
        // Payment methods
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectPaymentMethod(e));
        });
        
        // Window click to close modals
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) this.closeProductModal();
            if (e.target.classList.contains('checkout-modal')) this.closeCheckout();
        });
        
        // Smooth scroll for nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    renderProducts(products = this.products) {
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="product-overlay">
                        <button class="btn-quick-buy" onclick="store.quickBuy(${product.id})">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                    <button class="btn-primary add-to-cart" onclick="store.addToCart(${product.id})">
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        `).join('');

        // Add click events to product cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-primary, .btn-quick-buy')) {
                    const id = parseInt(card.dataset.id);
                    this.openProductModal(id);
                }
            });
        });
    }

    quickBuy(id) {
        this.addToCart(id, 1, true);
    }

    addToCart(id, qty = 1, skipModal = false) {
        const product = this.products.find(p => p.id === id);
        const existing = this.cart.find(item => item.id === id);

        if (existing) {
            existing.quantity += qty;
        } else {
            this.cart.push({ ...product, quantity: qty });
        }

        this.saveCart();
        this.updateCart();
        
        if (!skipModal) {
            this.showNotification('Produto adicionado ao carrinho!');
        }
    }

    removeFromCart(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCart();
        this.updateCart();
    }

    updateQuantity(id, change) {
        const item = this.cart.find(item => item.id === id);
        if (item) {
            item.quantity = Math.max(1, item.quantity + change);
            this.saveCart();
            this.updateCart();
        }
    }

    saveCart() {
        localStorage.setItem('neonCart', JSON.stringify(this.cart));
    }

    updateCart() {
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartCount').textContent = count;
        this.renderCart();
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const total = this.getCartTotal();

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Carrinho vazio</p>';
            document.getElementById('cartTotal').textContent = 'R$ 0,00';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="quantity-controls">
                    <button onclick="store.updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="store.updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div class="cart-item-total">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
                <button class="remove-item" onclick="store.removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        document.getElementById('cartTotal').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (1 - this.couponDiscount);
    }

    toggleCart() {
        document.getElementById('cartSidebar').classList.toggle('active');
    }

    closeCart() {
        document.getElementById('cartSidebar').classList.remove('active');
    }

    toggleMobileMenu() {
        document.querySelector('.nav-menu').classList.toggle('active');
        document.querySelector('.hamburger').classList.toggle('active');
    }

    openProductModal(id) {
        this.currentProduct = this.products.find(p => p.id === id);
        this.quantity = 1;
        
        document.getElementById('modalProductName').textContent = this.currentProduct.name;
        document.getElementById('modalProductImage').src = this.currentProduct.image;
        document.getElementById('modalProductPrice').textContent = `R$ ${this.currentProduct.price.toFixed(2).replace('.', ',')}`;
        document.getElementById('quantityInput').value = 1;
        document.getElementById('modalTotal').textContent = `R$ ${this.currentProduct.price.toFixed(2).replace('.', ',')}`;
        
        document.getElementById('productModal').classList.add('active');
    }

    closeProductModal() {
        document.getElementById('productModal').classList.remove('active');
    }

    changeQuantity(change) {
        this.quantity = Math.max(1, this.quantity + change);
        document.getElementById('quantityInput').value = this.quantity;
        const total = this.currentProduct.price * this.quantity;
        document.getElementById('modalTotal').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    openCheckout() {
        if (!this.currentProduct) return;
        
        document.getElementById('checkoutProductName').textContent = this.currentProduct.name;
        document.getElementById('checkoutProductImage').src = this.currentProduct.image;
        document.getElementById('checkoutProductPrice').textContent = `R$ ${this.currentProduct.price.toFixed(2).replace('.', ',')}`;
        document.getElementById('checkoutQuantity').textContent = this.quantity;
        document.getElementById('checkoutTotal').textContent = `R$ ${(this.currentProduct.price * this.quantity).toFixed(2).replace('.', ',')}`;
        
        this.closeProductModal();
        document.getElementById('checkoutModal').classList.add('active');
        this.generateQRCode(this.currentProduct.price * this.quantity);
    }

    closeCheckout() {
        document.getElementById('checkoutModal').classList.remove('active');
    }

    selectPaymentMethod(e) {
        const method = e.currentTarget.dataset.method;
        document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        document.getElementById('pixForm').classList.toggle('hidden', method !== 'pix');
        document.getElementById('cardForm').classList.toggle('hidden', method !== 'card');
    }

    async generateQRCode(amount) {
        const canvas = document.getElementById('qrCode');
        const pixKey = '12345678-90.12.345678-9 contato@neonstreet.com';
        const pixData = `000201010212${pixKey}5204000053039865802BR5925NEON STREET6008Sao Paulo621405${amount.toFixed(2).replace('.', '')}6304ABCD`;
        
        try {
            await QRCode.toCanvas(canvas, pixData, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
        } catch (err) {
            console.error('Erro ao gerar QR Code:', err);
        }
    }

    copyPixKey() {
        const pixKey = document.getElementById('pixKey');
        pixKey.select();
        document.execCommand('copy');
        this.showNotification('Chave PIX copiada!');
    }

    confirmPayment() {
        this.showSuccess();
    }

    showSuccess() {
        this.closeCheckout();
        document.getElementById('successModal').classList.add('active');
        this.cart = []; // Limpa carrinho após compra
        this.saveCart();
        this.updateCart();
    }

    closeSuccess() {
        document.getElementById('successModal').classList.remove('active');
    }

    showNotification(message) {
        // Toast notification
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    animateHero() {
        const heroTitle = document.querySelector('.hero-title');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    heroTitle.classList.add('animate');
                }
            });
        });
        observer.observe(heroTitle);
    }

    applyCoupon() {
        const code = document.getElementById('couponInput').value.toUpperCase();
        if (code === 'NEON10') {
            this.couponDiscount = 0.1;
            this.updateCart();
            this.showNotification('Cupom aplicado! 10% OFF');
        } else {
            this.showNotification('Cupom inválido');
        }
    }
}

// Global functions
let store;

window.changeQuantity = function(change) {
    store.changeQuantity(change);
}

window.openCheckout = function() {
    store.openCheckout();
}

window.copyPixKey = function() {
    store.copyPixKey();
}

window.applyCoupon = function() {
    store.applyCoupon();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    store = new NeonStore();
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        }
    });
});
