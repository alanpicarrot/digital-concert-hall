import storageService from './storageService';
import authService from './authService';
import { validateApiPath } from '../utils/apiUtils';
import axios from 'axios';

// 這裡我們使用localStorage來存儲購物車數據
// 在真實場景中，你可能需要同步到後端API

const { axiosInstance } = authService;
const CART_STORAGE_KEY = 'digital_concert_hall_cart';

// 獲取購物車數據
const getCart = () => {
  return storageService.cart.getCart() || { items: [], total: 0 };
};

// 保存購物車數據並發出自定義事件
const saveCart = (cart) => {
  storageService.cart.saveCart(cart);
  
  // 發出自定義事件，通知購物車數據已更新
  const event = new CustomEvent('cartUpdated', { detail: cart });
  window.dispatchEvent(event);
  
  return cart;
};

// 添加商品到購物車
const addToCart = (item) => {
  const cart = getCart();
  
  // 檢查商品是否已存在
  const existingItemIndex = cart.items.findIndex(
    (i) => i.id === item.id && i.type === item.type
  );
  
  if (existingItemIndex >= 0) {
    // 更新數量
    cart.items[existingItemIndex].quantity += item.quantity || 1;
  } else {
    // 添加新商品
    cart.items.push({
      ...item,
      quantity: item.quantity || 1
    });
  }
  
  // 更新總金額
  cart.total = calculateTotal(cart.items);
  
  return saveCart(cart);
};

// 從購物車中移除商品
const removeFromCart = (itemId, itemType) => {
  const cart = getCart();
  cart.items = cart.items.filter(
    (item) => !(item.id === itemId && item.type === itemType)
  );
  
  // 更新總金額
  cart.total = calculateTotal(cart.items);
  
  return saveCart(cart);
};

// 更新購物車中商品的數量
const updateQuantity = (itemId, itemType, quantity) => {
  const cart = getCart();
  const itemIndex = cart.items.findIndex(
    (item) => item.id === itemId && item.type === itemType
  );
  
  if (itemIndex >= 0) {
    cart.items[itemIndex].quantity = quantity;
    
    // 如果數量為0，則移除該商品
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }
    
    // 更新總金額
    cart.total = calculateTotal(cart.items);
    
    return saveCart(cart);
  }
  
  return cart;
};

// 清空購物車
const clearCart = () => {
  storageService.cart.clearCart();
  return saveCart({ items: [], total: 0 });
};

// 計算總金額 - 確保此方法被一致地使用並呈現正確的價格
const calculateTotal = (items) => {
  console.log('計算購物車總額，項目數:', items.length);
  
  // 確保 items 是數組且非空
  if (!Array.isArray(items) || items.length === 0) {
    console.log('項目為空或不是有效數組');
    return 0;
  }
  
  // 確保每個項目的價格是有效的數字
  const total = items.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    const itemTotal = price * quantity;
    
    console.log(`項目: ${item.name}, 價格: ${price}, 數量: ${quantity}, 小計: ${itemTotal}`);
    
    // 確保我們不會因一個項目的價格或數量不正確而使總金額計算出錯
    if (isNaN(itemTotal)) {
      console.warn('購物車項目計算結果非數字:', item);
      return total;
    }
    
    return total + itemTotal;
  }, 0);
  
  console.log('購物車總金額:', total);
  return total;
};

// 創建訂單 (連接到後端 API)
const checkout = async () => {
  try {
    const cart = getCart();
    
    // 檢查購物車是否為空
    if (cart.items.length === 0) {
      throw new Error('購物車為空');
    }
    
    // 準備訂單資料
    const orderData = {
      items: cart.items.map(item => {
        // 嘗試提取數字部分ID (例如 "2-vip" -> "2")
        // 如果ID是複合格式，取第一個破折號前的數字
        const numericId = item.id.toString().split('-')[0];
        console.log(`處理商品ID: ${item.id}, 轉換為數字ID: ${numericId}`);
        
        return {
          id: numericId,
          type: item.type,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          image: item.image,
          date: item.date
        };
      })
    };
    
    console.log('處理後的訂單數據:', orderData);
    
    // 創建訂單 - 直接使用基本 axios，不使用帶有認證的 axiosInstance
    const path = 'http://localhost:8080/api/cart';
    console.log('發送訂單請求到:', path);
    
    // 不使用認證令牌，直接發送請求
    const response = await axios.post(path, orderData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    // 檢查回應狀態
    if (response.status === 200 || response.status === 201) {
      console.log('訂單創建成功:', response.data);
      clearCart();
      return response.data;
    } else {
      console.error('訂單創建失敗:', response);
      throw new Error('無法創建訂單');
    }
  } catch (error) {
    console.error('結帳過程中發生錯誤:', error);
    
    // 客製化錯誤訊息
    if (error.response) {
      switch (error.response.status) {
        case 400:
          throw new Error('訂單資料無效');
        case 401:
          throw new Error('認證失敗，請登入後再試');
        case 403:
          throw new Error('無權限訪問');
        case 500:
          // 提供更詳細的錯誤信息
          const errorMsg = error.response.data && error.response.data.message 
              ? error.response.data.message 
              : '伺服器錯誤，請稍後再試';
          console.error('伺服器錯誤詳情:', errorMsg);
          throw new Error(errorMsg);
        default:
          throw new Error(`服務異常：${error.message}`);
      }
    } else if (error.request) {
      throw new Error('無法連接伺服器，請檢查網路');
    } else {
      throw error;
    }
  }
};

const CartService = {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  checkout,
  calculateTotal
};

export default CartService;
