class NeonStore {
    constructor() {
        this.products = [
            {id:1, name:"Gaming Skin Pack", price:79.90, image:"https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop", category:"gaming"},
            {id:2, name:"Streetwear Hoodie", price:199.90, image:"https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop", category:"streetwear"},
            {id:3, name:"Cyberpunk Avatar", price:49.90, image:"https://images.unsplash.com/photo-1611066770461-79c3e39072f2?w=400&h=400&fit=crop", category:"digital"},
            {id:4, name:"Controller Skin", price:129.90, image:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop", category:"gaming"},
            {id:5, name:"Limited Cap", price:89.90, image:"https://images.unsplash.com/photo-1578906952566-6e4059f7e01c?w=400&h=400&fit=crop", category:"streetwear"},
            {id:6, name:"NFT Badge", price:299.90, image:"https://images.unsplash.com/photo-1620325867503-23cefe9a29e2?w=400&h=400&fit=crop", category:"digital"}
        ];
        
        this.cart = JSON.parse(localStorage.getItem('neonCart')) || [];
        this.couponDiscount = 0;
        this.init();
    }

    init() {
        setTimeout(() => document.getElementById('loading').style.display = 'none', 1500);
        this.bindEvents();
        this.renderProducts();
        this.updateCart();
    }

    bindEvents() {
        document.getElementById('cartToggle').onclick = () => document.getElementById('cartSidebar').classList.toggle('active');
        document.getElementById('closeCart').onclick = () => document.getElementById('cartSidebar').classList.remove('active');
        document.getElementById('checkoutBtn').onclick = () => this.openCheckout();
        document.getElementById('closeCheckout').onclick = () => document.getElementById('checkoutModal').classList.remove('active');
        document.querySelector('.coupon-btn').onclick = () => this.applyCoupon();
        document.querySelector('.btn-buy-now').onclick = () => document.getElementById('products').scrollIntoView({behavior:'smooth'});
        
        document.querySelectorAll('.payment-option').forEach(btn => {
            btn.onclick = (e) => {
                document.querySelectorAll('.payment-option').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.querySelectorAll('.payment-form').forEach(f => f.classList.remove('active'));
                document.getElementById(e.currentTarget.dataset.method + 'Form').classList.add('active');
            }
        });
    }

    renderProducts() {
        document.getElementById('productsGrid').innerHTML = this.products.map(p => `
            <div class="product-card" data-id="${p.id}">
                <div class="product-image">
                    <img src="${p.image}" alt="${p.name}">
                    <div class="product-overlay">
                        <button class="btn-primary" onclick="store.addToCart(${p.id})">
                            <i class="fas fa-shopping-cart"></i> Comprar
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <div class="price">R$ ${p.price.toFixed(2).replace('.', ',')}</div>
                </div>
            </div>
        `).join('');
    }

    addToCart(id) {
        const product = this.products.find(p => p.id === id);
        const existing = this.cart.find(item => item.id === id);
        
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            this.cart.push({...product, quantity: 1});
        }
        
        this.saveCart();
        this.updateCart();
        this.toast('✅ Adicionado ao carrinho!');
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
            if (item.quantity === 0) this.removeFromCart(id);
            else {
                this.saveCart();
                this.updateCart();
            }
        }
    }

    updateCart() {
        const count = this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        document.getElementById('cartCount').textContent = count;
        this.renderCart();
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const total = this.getTotal();
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">Carrinho vazio</p>';
            document.getElementById('cartTotal').textContent = 'R$ 0,00';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <div>R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="quantity-controls">
                    <button onclick="store.updateQuantity(${item.id}, -1)">−</button>
                    <span>${item.quantity || 1}</span>
                    <button onclick="store.updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div class="price">R$ ${((item.price || 0) * (item.quantity || 1)).toFixed(2).replace('.', ',')}</div>
                <button class="remove-btn" onclick="store.removeFromCart(${item.id})">×</button>
            </div>
        `).join('');

        document.getElementById('cartTotal').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) * (1 - this.couponDiscount);
    }

    saveCart() {
        localStorage.setItem('neonCart', JSON.stringify(this.cart));
    }

    applyCoupon() {
        this.couponDiscount = 0.1;
        this.updateCart();
        this.toast('🎉 10% OFF aplicado!');
    }

    openCheckout() {
        if (this.cart.length === 0) return this.toast('❌ Carrinho vazio');
        
        document.getElementById('orderItems').innerHTML = this.cart.map(item => `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}">
                <div>${item.name}</div>
                <div>x${item.quantity || 1}</div>
            </div>
        `).join('');
        
        document.getElementById('checkoutTotal').textContent = `R$ ${this.getTotal().toFixed(2).replace('.', ',')}`;
        document.getElementById('checkoutModal').classList.add('active');
        this.generateQRCode(this.getTotal());
    }

    async generateQRCode(amount) {
        const canvas = document.getElementById('qrCode');
        const pixData = `00020101021212345678-90.12.345678-95204${amount.toFixed(2).replace('.', '').padStart(10, '0')}53039865`;
        await QRCode.toCanvas(canvas, pixData, {width: 200});
    }

    copyPixKey() {
        navigator.clipboard.writeText('12345678-90.12.345678-9 contato@neonstreet.com');
        this.toast('📋 Chave PIX copiada!');
    }

    confirmPayment() {
        this.cart = [];
        this.saveCart();
        this.updateCart();
        document.getElementById('checkoutModal').classList.remove('active');
        document.getElementById('successModal').classList.add('active');
        this.toast('🎉 Compra confirmada!');
    }

    continueShopping() {
        document.getElementById('successModal').classList.remove('active');
    }

    toast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position:fixed;top:20px;right:20px;background:var(--neon-green);color:black;
            padding:1rem 2rem;border-radius:10px;font-weight:600;z-index:9999;
            transform:translateX(400px);transition:all 0.3s ease;`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

let store;
document.addEventListener('DOMContentLoaded', () => store = new NeonStore());
