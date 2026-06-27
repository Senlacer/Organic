// 購物車系統
class Cart {
  constructor() {
    this.items = this.loadCart();
    this.render();
  }

  loadCart() {
    const saved = localStorage.getItem('senlacer_cart');
    return saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    localStorage.setItem('senlacer_cart', JSON.stringify(this.items));
  }

  addItem(product) {
    const existing = this.items.find(
      item => item.id === product.id && item.size === product.size
    );
    
    if (existing) {
      existing.quantity += product.quantity;
    } else {
      this.items.push(product);
    }
    
    this.saveCart();
    this.render();
    this.showNotification(`已加入購物車：${product.name}`);
  }

  removeItem(id, size) {
    this.items = this.items.filter(item => !(item.id === id && item.size === size));
    this.saveCart();
    this.render();
  }

  updateQuantity(id, size, quantity) {
    const item = this.items.find(item => item.id === id && item.size === size);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
      this.render();
    }
  }

  clear() {
    this.items = [];
    this.saveCart();
    this.render();
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  render() {
    // 更新購物車圖標數量
    const badge = document.getElementById('cart-badge');
    const count = this.getCount();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }

    // 更新購物車內容
    const cartContent = document.getElementById('cart-content');
    if (cartContent) {
      if (this.items.length === 0) {
        cartContent.innerHTML = '<p style="padding:20px;text-align:center;opacity:.7;">購物車為空</p>';
        return;
      }

      let html = '<div style="padding:16px;max-height:400px;overflow-y:auto;">';
      this.items.forEach(item => {
        html += `
          <div style="display:grid;grid-template-columns:1fr auto;gap:12px;padding:12px;border-bottom:1px solid rgba(74,63,48,.1);">
            <div>
              <div style="font-size:.9rem;font-weight:500;margin-bottom:4px;">${item.name}</div>
              <div style="font-size:.8rem;opacity:.7;margin-bottom:6px;">${item.size}</div>
              <div style="display:flex;align-items:center;gap:8px;">
                <button onclick="window.cart.updateQuantity('${item.id}', '${item.size}', ${item.quantity - 1})" style="width:24px;height:24px;border:1px solid #ccc;background:#fff;cursor:pointer;">−</button>
                <span style="width:30px;text-align:center;">${item.quantity}</span>
                <button onclick="window.cart.updateQuantity('${item.id}', '${item.size}', ${item.quantity + 1})" style="width:24px;height:24px;border:1px solid #ccc;background:#fff;cursor:pointer;">+</button>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:600;margin-bottom:16px;">$${(item.price * item.quantity).toLocaleString()}</div>
              <button onclick="window.cart.removeItem('${item.id}', '${item.size}')" style="font-size:.75rem;color:#C97C3D;background:none;border:none;cursor:pointer;text-decoration:underline;">刪除</button>
            </div>
          </div>
        `;
      });
      
      html += `
        <div style="padding:16px;border-top:2px solid rgba(74,63,48,.15);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-weight:600;">小計</span>
            <span style="font-family:'Fraunces',serif;font-size:1.3rem;color:#4A3F30;">$${this.getTotal().toLocaleString()}</span>
          </div>
          <button onclick="window.cart.checkout()" style="width:100%;padding:12px;background:#4A3F30;color:#fff;border:none;border-radius:4px;font-weight:600;cursor:pointer;margin-bottom:8px;">前往 LINE 結帳</button>
          <button onclick="window.cart.clear()" style="width:100%;padding:8px;background:#f0f0f0;border:none;border-radius:4px;font-size:.9rem;cursor:pointer;">清空購物車</button>
        </div>
      `;
      html += '</div>';
      cartContent.innerHTML = html;
    }
  }

  checkout() {
    if (this.items.length === 0) {
      alert('購物車為空，請先選擇商品');
      return;
    }

    const summary = this.items
      .map(item => `${item.name} (${item.size}) x${item.quantity} = $${item.price * item.quantity}`)
      .join('\n');
    
    const message = `我要購買以下商品：\n\n${summary}\n\n總金額：$${this.getTotal()}`;
    const encoded = encodeURIComponent(message);
    
    window.open(`https://lin.ee/t9Hj7ef`, '_blank');
  }

  showNotification(text) {
    const notif = document.createElement('div');
    notif.textContent = text;
    notif.style.cssText = `
      position:fixed;bottom:20px;right:20px;background:#4A3F30;color:#fff;
      padding:12px 16px;border-radius:4px;font-size:.9rem;z-index:999;
      animation:slideIn .3s ease-out;
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
  }
}

// 初始化購物車
window.cart = new Cart();

// 切換購物車側欄
function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

// 關閉購物車側欄
function closeCart() {
  const sidebar = document.getElementById('cart-sidebar');
  if (sidebar) {
    sidebar.classList.remove('open');
  }
}

// 點擊外面關閉購物車
document.addEventListener('click', function(e) {
  const sidebar = document.getElementById('cart-sidebar');
  const cartBtn = document.getElementById('cart-button');
  if (sidebar && !sidebar.contains(e.target) && !cartBtn.contains(e.target)) {
    closeCart();
  }
});
