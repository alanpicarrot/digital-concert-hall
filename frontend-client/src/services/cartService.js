import authService from './authService';

// 這裡我們使用localStorage來存儲購物車數據
// 在真實場景中，你可能需要同步到後端API

const { axiosInstance } = authService;
const CART_STORAGE_KEY = 'digital_concert_hall_cart';

// 獲取購物車數據
const getCart = () => {
  const cartData = localStorage.getItem(CART_STORAGE_KEY);
  return cartData ? JSON.parse(cartData) : { items: [], total: 0 };
};

// 保存購物車數據
const saveCart = (cart) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
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
  const cart = getCart();
  
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
  const response = await axiosInstance.post('/api/orders', orderData);
  
  // 成功下單後清空購物車
  if (response.status === 200 || response.status === 201) {
    clearCart();
  }
  
  return response.data;
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