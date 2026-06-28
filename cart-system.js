// 菘蕾西 S'enlacer 購物車系統 - 完整版
// 支持：數量選擇、金額計算、ATM轉帳資訊、LINE導向

class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.atmInfo = {
      bank: '玉山銀行台中分行',
      code: '808',
      account: '1366-940-008489'
    };
    this.lineUrl = 'https://lin.ee/9zUQhq9';
    this.init();
  }

  init() {
    this.renderCart();
    this.updateCartBadge();
  }

  // 添加商品到購物車
  addToCart(product) {
    const existingItem = this.items.find(item => item.id === product.id && item.size === product.size);
    
    if (existingItem) {
      existingItem.quantity += (product.quantity || 1);
    } else {
      this.items.push({
        ...product,
        quantity: product.quantity || 1
      });
    }
    
    this.saveCart();
    this.updateCartBadge();
    this.showToast(`✓ 已加入購物車：${product.name}`);
  }

  // 更新商品數量
  updateQuantity(index, quantity) {
    if (quantity <= 0) {
      this.items.splice(index, 1);
    } else {
      this.items[index].quantity = quantity;
    }
    this.saveCart();
    this.renderCart();
  }

  // 移除商品
  removeItem(index) {
    this.items.splice(index, 1);
    this.saveCart();
    this.renderCart();
  }

  // 計算小計
  getSubtotal(item) {
    return item.price * item.quantity;
  }

  // 計算總計
  getTotal() {
    return this.items.reduce((total, item) => total + this.getSubtotal(item), 0);
  }

  // 保存購物車
  saveCart() {
    localStorage.setItem('senlacer_cart', JSON.stringify(this.items));
  }

  // 加載購物車
  loadCart() {
    const saved = localStorage.getItem('senlacer_cart');
    return saved ? JSON.parse(saved) : [];
  }

  // 更新購物車徽章
  updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      const count = this.items.reduce((total, item) => total + item.quantity, 0);
      badge.textContent = count;
      badge.style.display = count > 0 ? 'block' : 'none';
    }
  }

  // 渲染購物車
  renderCart() {
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;

    if (this.items.length === 0) {
      cartContainer.innerHTML = '<p style="text-align:center;padding:20px;">購物車為空</p>';
      return;
    }

    let html = `
      <div style="background:#fff;padding:20px;border-radius:8px;">
        <h3 style="font-family:'Fraunces',serif;font-size:1.5rem;color:#4A3F30;margin-bottom:20px;">
          購物清單
        </h3>
        
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:2px solid #C9A06B;">
                <th style="text-align:left;padding:10px;">商品</th>
                <th style="text-align:center;padding:10px;">規格</th>
                <th style="text-align:center;padding:10px;">單價</th>
                <th style="text-align:center;padding:10px;">數量</th>
                <th style="text-align:center;padding:10px;">小計</th>
                <th style="text-align:center;padding:10px;">操作</th>
              </tr>
            </thead>
            <tbody>
    `;

    this.items.forEach((item, index) => {
      const subtotal = this.getSubtotal(item);
      html += `
        <tr style="border-bottom:1px solid #EFE6D6;padding:10px 0;">
          <td style="padding:10px;">${item.name}</td>
          <td style="text-align:center;padding:10px;">${item.size || '-'}</td>
          <td style="text-align:center;padding:10px;">$${item.price}</td>
          <td style="text-align:center;padding:10px;">
            <input type="number" min="1" value="${item.quantity}" 
              onchange="window.cart.updateQuantity(${index}, this.value)"
              style="width:60px;padding:5px;text-align:center;border:1px solid #C9A06B;border-radius:4px;">
          </td>
          <td style="text-align:center;padding:10px;font-weight:bold;color:#C9A06B;">$${subtotal}</td>
          <td style="text-align:center;padding:10px;">
            <button onclick="window.cart.removeItem(${index})"
              style="padding:5px 10px;background:#d9534f;color:white;border:none;border-radius:4px;cursor:pointer;">
              刪除
            </button>
          </td>
        </tr>
      `;
    });

    const total = this.getTotal();
    html += `
            </tbody>
          </table>
        </div>

        <div style="margin-top:30px;padding:20px;background:#EFE6D6;border-radius:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h4 style="font-size:1.3rem;color:#4A3F30;margin:0;">
              訂單總計
            </h4>
            <p style="font-size:1.8rem;font-weight:bold;color:#C9A06B;margin:0;">
              $${total.toLocaleString()}
            </p>
          </div>

          <!-- ATM轉帳資訊 - 預設隱藏，點擊確認結帳後才顯示 -->
          <div id="atm-info" style="display:none;background:white;padding:15px;border-radius:8px;margin-bottom:15px;border-left:4px solid #C9A06B;">
            <h5 style="color:#4A3F30;margin:0 0 10px 0;">💳 ATM轉帳資訊</h5>
            <p style="margin:5px 0;color:#5C4A36;">
              <strong>銀行：</strong>${this.atmInfo.bank}
            </p>
            <p style="margin:5px 0;color:#5C4A36;">
              <strong>銀行代號：</strong>${this.atmInfo.code}
            </p>
            <p style="margin:5px 0;color:#5C4A36;">
              <strong>帳號：</strong><span style="font-family:monospace;letter-spacing:2px;">${this.atmInfo.account}</span>
            </p>
            <p style="margin:10px 0 0 0;font-size:0.9rem;color:#999;">
              ⚠️ 請記住您的訂單號碼，轉帳時請在備註欄註明
            </p>
          </div>

          <!-- 結帳按鈕 -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <button onclick="window.cart.checkout()"
              style="padding:15px;background:#4A3F30;color:white;border:none;border-radius:4px;cursor:pointer;font-size:1rem;font-weight:bold;">
              確認結帳
            </button>
            <a href="https://lin.ee/9zUQhq9" target="_blank"
              style="padding:15px;background:#00B900;color:white;border:none;border-radius:4px;cursor:pointer;font-size:1rem;font-weight:bold;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;">
              📱 LINE客服
            </a>
          </div>
        </div>
      </div>
    `;

    cartContainer.innerHTML = html;
  }

  // 結帳流程
  checkout() {
    if (this.items.length === 0) {
      alert('購物車為空');
      return;
    }

    // 點擊確認結帳後，才顯示ATM轉帳資訊區塊
    const atmDiv = document.getElementById('atm-info');
    if (atmDiv && atmDiv.style.display === 'none') {
      atmDiv.style.display = 'block';
      atmDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const total = this.getTotal();
    const orderNumber = 'ORDER-' + Date.now();
    
    // 生成訂單詳情
    let orderDetail = `🛍️ 菘蕾西 S'enlacer 訂單\n\n`;
    orderDetail += `訂單號碼: ${orderNumber}\n`;
    orderDetail += `訂單時間: ${new Date().toLocaleString('zh-TW')}\n\n`;
    orderDetail += `────────────────\n`;
    orderDetail += `訂單內容:\n`;
    
    this.items.forEach(item => {
      orderDetail += `• ${item.name} (${item.size})\n`;
      orderDetail += `  數量: ${item.quantity} × $${item.price} = $${item.price * item.quantity}\n\n`;
    });
    
    orderDetail += `────────────────\n`;
    orderDetail += `📊 訂單總計: $${total.toLocaleString()} 元\n\n`;
    orderDetail += `💳 ATM轉帳資訊:\n`;
    orderDetail += `銀行: ${this.atmInfo.bank}\n`;
    orderDetail += `銀行代號: ${this.atmInfo.code}\n`;
    orderDetail += `帳號: ${this.atmInfo.account}\n\n`;
    orderDetail += `轉帳後請將截圖傳給LINE客服\n`;
    orderDetail += `並告知訂單號碼: ${orderNumber}\n\n`;
    orderDetail += `感謝您的購買！`;

    // 保存訂單
    localStorage.setItem('senlacer_order_' + orderNumber, JSON.stringify({
      orderNumber,
      items: this.items,
      total,
      date: new Date().toISOString()
    }));

    // 複製訂單到剪貼板
    navigator.clipboard.writeText(orderDetail).then(() => {
      alert('訂單已複製！\n\n請點擊下方LINE客服按鈕\n將訂單信息貼上傳送給客服');
      
      // 清空購物車
      this.items = [];
      this.saveCart();
      this.renderCart();
      this.updateCartBadge();
      if (typeof renderCartSidebar === 'function') renderCartSidebar();

      // 打開LINE
      setTimeout(() => {
        window.open(this.lineUrl, '_blank');
      }, 500);
    }).catch(() => {
      alert('訂單內容:\n\n' + orderDetail + '\n\n請複製以上內容傳給LINE客服');
      
      // 清空購物車
      this.items = [];
      this.saveCart();
      this.renderCart();
      this.updateCartBadge();
      if (typeof renderCartSidebar === 'function') renderCartSidebar();

      window.open(this.lineUrl, '_blank');
    });
  }


  // 顯示優雅的提示條（取代alert）
  showToast(message, duration = 2500) {
    let toast = document.getElementById('senlacer-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'senlacer-toast';
      toast.style.cssText = `
        position: fixed; top: 24px; right: 24px; z-index: 2000;
        background: #4A3F30; color: #fff; padding: 14px 24px;
        border-radius: 8px; font-size: 0.95rem; box-shadow: 0 4px 16px rgba(0,0,0,.2);
        transform: translateX(120%); transition: transform .35s ease;
        max-width: 320px; line-height: 1.5;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
    }, duration);
  }

  // 清空購物車
  clearCart() {
    if (confirm('確定要清空購物車嗎？')) {
      this.items = [];
      this.saveCart();
      this.renderCart();
      this.updateCartBadge();
    }
  }
}

// 初始化購物車
window.cart = new ShoppingCart();
