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
  try {
    const cart = getCart();
    
    // 確保 item.price 是數字，如果不是或 NaN，則預設為 0
    const numericPrice = Number(item.price);
    const validatedPrice = isNaN(numericPrice) ? 0 : numericPrice;

    // 檢查商品是否已存在
    const existingItemIndex = cart.items.findIndex(
      (i) => i.id === item.id && i.type === item.type
    );
    
    if (existingItemIndex >= 0) {
      // 更新數量
      cart.items[existingItemIndex].quantity += item.quantity || 1;
      // 如果需要，也可以在這裡更新價格，但通常購物車中已存在商品的價格不會改變
      // cart.items[existingItemIndex].price = validatedPrice; 
    } else {
      // 添加新商品
      cart.items.push({
        ...item,
        price: validatedPrice, // 使用驗證後的價格
        quantity: item.quantity || 1
      });
    }
    
    // 更新總金額
    cart.total = calculateTotal(cart.items);
    
    const updatedCart = saveCart(cart);
    return Promise.resolve(updatedCart); // Return a resolved promise with the updated cart
  } catch (error) {
    console.error("Error in addToCart:", error); // Optional: log any synchronous error
    return Promise.reject(error); // Return a rejected promise if an error occurs
  }
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
  const total = items.reduce((sum, item) => {
    const itemPrice = Number(item.price);
    // 如果價格不是數字 (NaN)，則視為0
    const validatedPrice = isNaN(itemPrice) ? 0 : itemPrice;
    
    const itemQuantity = Number(item.quantity);
    // 如果數量不是數字 (NaN)，則視為0
    const validatedQuantity = isNaN(itemQuantity) ? 0 : itemQuantity;

    if (isNaN(itemPrice)) {
      console.warn(`項目 "${item.name || item.id}" 的價格無效: ${item.price}，計算時將視為 0`);
    }
    if (isNaN(itemQuantity)) {
      console.warn(`項目 "${item.name || item.id}" 的數量無效: ${item.quantity}，計算時將視為 0`);
    }
    
    const itemTotal = validatedPrice * validatedQuantity;
    
    console.log(`項目: ${item.name || item.id}, 價格: ${validatedPrice}, 數量: ${validatedQuantity}, 小計: ${itemTotal}`);
    
    // 再次檢查 itemTotal 是否為 NaN，以防萬一
    if (isNaN(itemTotal)) {
      console.warn('購物車項目小計計算結果為 NaN:', item);
      return sum; // 如果是 NaN，則不將此項目金額加入總計
    }
    
    return sum + itemTotal;
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
        // const numericId = item.id.toString().split('-')[0]; // Removed this line
        // console.log(`處理商品ID: ${item.id}, 轉換為數字ID: ${numericId}`); // Removed this line
        
        return {
          id: item.id, // Use item.id directly
          type: item.type,
          quantity: item.quantity,
          price: item.price, // Backend CartController now ignores this for OrderItem.unitPrice
          name: item.name,
          image: item.image,
          date: item.date
        };
      })
    };
    
    console.log('處理後的訂單數據:', orderData);
    
    // 確保認證資訊存在
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      console.error('結帳前無效的認證資訊');
      throw new Error('您需要先登入才能完成結帳。');
    }
    
    // 設置請求頁頭
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // 創建訂單 - 使用帶有認證的 axiosInstance
    const path = validateApiPath('/orders');
    console.log('發送訂單請求到:', path);
    
    // 直接使用 axiosInstance 發送請求，已有8acb認證商產
    const response = await axiosInstance.post(path, orderData);
    
    // 檢查回應狀態
    if (response.status === 200 || response.status === 201) {
      console.log('訂單創建成功:', response.data);
      // 先儲存訂單資訊，再清除購物車
      const orderInfo = response.data;
      clearCart();
      return orderInfo;
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
          throw new Error('結帳失敗：您的帳戶目前可能沒有完成購買所需的權限，或者您的登入狀態需要刷新。請嘗試完全登出後再重新登入。如果問題持續，請聯繫客服。');
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

// 導出所有購物車相關函數
const cartService = {
  getCart,
  addToCart,
  addItem: addToCart, // Add this line to alias addItem to addToCart
  removeFromCart,
  updateQuantity,
  clearCart,
  checkout,
  calculateTotal,
};

export default cartService;
