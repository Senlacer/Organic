class ShoppingCart {
  constructor() {
    this.items = [];
    this.lineUrl = 'https://lin.ee/9zUQhq9';
    this.loadCart();
  }

  addToCart(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.quantity += (product.quantity || 1);
    } else {
      this.items.push({...product, quantity: product.quantity || 1});
    }
    this.saveCart();
    this.updateCartBadge();
    this.showToast('✓ ' + product.name + ' 已加入購物車');
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.saveCart();
    this.updateCartBadge();
  }

  updateQuantity(index, qty) {
    const q = parseInt(qty);
    if (q > 0) {
      this.items[index].quantity = q;
    } else {
      this.items.splice(index, 1);
    }
    this.saveCart();
    this.updateCartBadge();
  }

  getTotal() {
    return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  saveCart() {
    try { localStorage.setItem('senlacer_cart', JSON.stringify(this.items)); } catch(e){}
  }

  loadCart() {
    try {
      const saved = localStorage.getItem('senlacer_cart');
      if (saved) this.items = JSON.parse(saved);
    } catch(e){ this.items = []; }
  }

  updateCartBadge() {
    const count = this.items.length;
    // 更新側欄內 badge
    document.querySelectorAll('#cart-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
    // 更新導覽列 badge
    document.querySelectorAll('.cart-nav-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#4A3B2F;color:#F3ECE0;padding:14px 28px;border-radius:30px;z-index:10000;font-size:.92rem;box-shadow:0 4px 16px rgba(0,0,0,.2);white-space:nowrap;';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  checkout() {
    if (this.items.length === 0) {
      this.showToast('⚠️ 購物車為空');
      return;
    }
    // 關閉側欄
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.style.display = 'none';
    // 跳轉至訂單表單
    window.location.href = 'order-form.html';
  }
}

window.cart = new ShoppingCart();
window.addEventListener('DOMContentLoaded', function() {
  window.cart.updateCartBadge();
});
