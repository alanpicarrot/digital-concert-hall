import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import userService from '../../services/userService';

/**
 * 用戶個人資料頁面
 */
function UserProfilePage() {
  const { user, updateUserInfo } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredLanguage: 'zh-TW',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // 載入用戶資料
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        preferredLanguage: user.preferredLanguage || 'zh-TW',
      });
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const updatedUserInfo = await userService.updateProfile(formData);
      updateUserInfo(updatedUserInfo);
      
      toast.showSuccess('個人資料已更新');
      setIsEditing(false);
    } catch (error) {
      console.error('更新個人資料失敗:', error);
      toast.showError('更新個人資料失敗', error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">個人資料</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
              姓名
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
              電子郵件
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              className="w-full px-3 py-2 border rounded-md bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">電子郵件無法更改</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
              電話號碼
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="preferredLanguage">
              偏好語言
            </label>
            <select
              id="preferredLanguage"
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="zh-TW">繁體中文</option>
              <option value="en-US">English</option>
            </select>
          </div>
          
          <div className="flex justify-between">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? '儲存中...' : '儲存變更'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/user/tickets')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  我的票券
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  編輯資料
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfilePage;
