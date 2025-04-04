import authService from './authService';
import { validateApiPath } from '../utils/apiUtils';

// 這裡我們使用localStorage來存儲購物車數據
// 在真實場景中，你可能需要同步到後端API

const { axiosInstance } = authService;
const CART_STORAGE_KEY = 'digital_concert_hall_cart';

// 獲取購物車數據
const getCart = () => {
  const cartData = localStorage.getItem(CART_STORAGE_KEY);
  return cartData ? JSON.parse(cartData) : { items: [], total: 0 };
};

// 保存購物車數據並發出自定義事件
const saveCart = (cart) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
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
  return saveCart({ items: [], total: 0 });
};

// 計算總金額
const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// 創建訂單 (連接到後端 API)
const checkout = async () => {
  try {
    // 檢查用戶登入和令牌狀態
    const currentUser = authService.getCurrentUser();
    const isTokenValid = authService.isTokenValid();
    
    console.log('用戶資訊:', currentUser);
    console.log('令牌有效性:', isTokenValid);
    
    if (!currentUser || !isTokenValid) {
      throw new Error('用戶未登入或令牌無效');
    }
    
    const cart = getCart();
    
    // 檢查購物車是否為空
    if (cart.items.length === 0) {
      throw new Error('購物車為空');
    }
    
    // 準備訂單資料
    const orderData = {
      items: cart.items.map(item => ({
        id: item.id,
        type: item.type,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        image: item.image,
        date: item.date
      }))
    };
    
    // 創建訂單
    const path = validateApiPath('/api/orders');
    const response = await axiosInstance.post(path, orderData);
    
    // 檢查回應狀態
    if (response.status === 200 || response.status === 201) {
      console.log('訂單創建成功');
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
          throw new Error('未授權，請重新登入');
        case 403:
          throw new Error('無權限訪問');
        case 500:
          throw new Error('伺服器錯誤，請稍後再試');
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