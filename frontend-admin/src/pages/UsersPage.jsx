import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Key,
  User,
} from "lucide-react";
import axios from "axios";
import { validateApiPath } from "../utils/apiUtils";
import { useAuth } from "../contexts/AuthContext";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(""); // 'edit', 'delete', 'view'
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(null);

  const { axiosInstance } = useAuth();

  // 獲取用戶列表
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        validateApiPath("/api/admin/users")
      );
      setUsers(response.data);
    } catch (err) {
      console.error("獲取用戶列表失敗:", err);
      setError("無法載入用戶資料，請檢查網路連接或重新登入");
    } finally {
      setLoading(false);
    }
  };

  // 首次載入頁面時獲取用戶列表
  useEffect(() => {
    fetchUsers();
  }, []);

  // 過濾用戶
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.name && user.name.toLowerCase().includes(query))
    );
  });

  // 根據角色獲取角色標籤樣式
  const getRoleBadgeClass = (role) => {
    if (role.includes("ADMIN")) {
      return "bg-red-100 text-red-800";
    } else if (role.includes("MODERATOR")) {
      return "bg-yellow-100 text-yellow-800";
    } else {
      return "bg-blue-100 text-blue-800";
    }
  };

  // 格式化角色名稱
  const formatRoleName = (role) => {
    return role.replace("ROLE_", "");
  };

  // 開啟模態框
  const openModal = (mode, user = null) => {
    setSelectedUser(user);
    setModalMode(mode);
    setModalError(null);
    setModalSuccess(null);
    setIsModalOpen(true);
  };

  // 關閉模態框
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setModalMode("");
    setModalError(null);
    setModalSuccess(null);
  };

  // 創建新用戶
  const handleCreateUser = async (newUser) => {
    try {
      setModalLoading(true);
      setModalError(null);

      await axiosInstance.post(
        validateApiPath("/api/admin/users"),
        newUser
      );

      setModalSuccess("用戶創建成功！");

      // 重新獲取用戶列表
      await fetchUsers();

      // 延遲關閉模態框
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      console.error("創建用戶失敗:", err);
      setModalError(err.response?.data?.message || "創建用戶失敗，請稍後再試");
    } finally {
      setModalLoading(false);
    }
  };
  
  // 更新用戶
  const handleUpdateUser = async (updatedUser) => {
    try {
      setModalLoading(true);
      setModalError(null);

      await axiosInstance.put(
        validateApiPath(`/api/admin/users/${selectedUser.id}`),
        updatedUser
      );

      setModalSuccess("用戶更新成功！");

      // 重新獲取用戶列表
      await fetchUsers();

      // 延遲關閉模態框，讓使用者看到成功訊息
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      console.error("更新用戶失敗:", err);
      setModalError(err.response?.data?.message || "更新用戶失敗，請稍後再試");
    } finally {
      setModalLoading(false);
    }
  };
  
  // 更新用戶角色
  const handleUpdateRoles = async (userId, roles) => {
    try {
      setModalLoading(true);
      setModalError(null);

      await axiosInstance.put(
        validateApiPath(`/api/admin/users/${userId}/roles`),
        { roles }
      );

      setModalSuccess("用戶角色更新成功！");
      
      // 重新獲取用戶列表
      await fetchUsers();
    } catch (err) {
      console.error("更新用戶角色失敗:", err);
      setModalError(err.response?.data?.message || "更新用戶角色失敗，請稍後再試");
    } finally {
      setModalLoading(false);
    }
  };
  
  // 重置用戶密碼
  const handleResetPassword = async (userId, newPassword) => {
    try {
      setModalLoading(true);
      setModalError(null);

      await axiosInstance.put(
        validateApiPath(`/api/admin/users/${userId}/password-reset?newPassword=${encodeURIComponent(newPassword)}`)
      );

      setModalSuccess("用戶密碼重置成功！");

      // 延遲關閉模態框
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      console.error("重置密碼失敗:", err);
      setModalError(err.response?.data?.message || "重置密碼失敗，請稍後再試");
    } finally {
      setModalLoading(false);
    }
  };

  // 刪除用戶
  const handleDeleteUser = async () => {
    try {
      setModalLoading(true);
      setModalError(null);

      await axiosInstance.delete(
        validateApiPath(`/api/admin/users/${selectedUser.id}`)
      );

      setModalSuccess("用戶已成功刪除！");

      // 重新獲取用戶列表
      await fetchUsers();

      // 延遲關閉模態框，讓使用者看到成功訊息
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      console.error("刪除用戶失敗:", err);
      setModalError(err.response?.data?.message || "刪除用戶失敗，請稍後再試");
    } finally {
      setModalLoading(false);
    }
  };
  
  // 處理用戶表單提交
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (modalMode === "create") {
      const newUser = {
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        roles: getSelectedRoles(formData),
      };
      handleCreateUser(newUser);
    } else if (modalMode === "edit") {
      const updatedUser = {
        email: formData.get("email"),
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
      };
      // 更新用戶資料
      handleUpdateUser(updatedUser);
      
      // 更新用戶角色
      const roles = getSelectedRoles(formData);
      handleUpdateRoles(selectedUser.id, roles);
    } else if (modalMode === "reset-password") {
      const newPassword = formData.get("newPassword");
      handleResetPassword(selectedUser.id, newPassword);
    }
  };
  
  // 獲取選中的角色
  const getSelectedRoles = (formData) => {
    const roles = [];
    if (formData.get("role-admin")) roles.push("ROLE_ADMIN");
    if (formData.get("role-moderator")) roles.push("ROLE_MODERATOR");
    if (formData.get("role-user")) roles.push("ROLE_USER");
    return roles;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Users className="mr-2" />
          用戶管理
        </h1>
        <p className="text-gray-600">管理系統用戶和權限</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="搜尋用戶..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        <button
          className="px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center hover:bg-teal-700 transition"
          onClick={() => openModal("create")}
        >
          <UserPlus size={20} className="mr-2" />
          新增用戶
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertTriangle
            className="text-red-500 mr-2 flex-shrink-0 mt-1"
            size={20}
          />
          <div>
            <p className="text-red-700 font-medium">載入用戶資料時發生錯誤</p>
            <p className="text-red-600">{error}</p>
            <button
              className="mt-2 text-red-700 hover:text-red-900 flex items-center"
              onClick={fetchUsers}
            >
              <RefreshCw size={16} className="mr-1" />
              重試
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用戶名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  電子郵件
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    未找到用戶
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 
                             user.firstName ? user.firstName : 
                             user.lastName ? user.lastName : "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.roles &&
                          user.roles.map((role, index) => (
                            <span
                              key={index}
                              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(
                                role
                              )}`}
                            >
                              {formatRoleName(role)}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={14} className="mr-1" />
                          啟用
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <XCircle size={14} className="mr-1" />
                          禁用
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal("edit", user)}
                        className="text-teal-600 hover:text-teal-900 mr-3"
                        title="編輯用戶"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => openModal("reset-password", user)}
                        className="text-amber-600 hover:text-amber-900 mr-3"
                        title="重置密碼"
                      >
                        <Key size={18} />
                      </button>
                      <button
                        onClick={() => openModal("delete", user)}
                        className="text-red-600 hover:text-red-900"
                        title="刪除用戶"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 模態框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {modalMode === "edit" && `編輯用戶: ${selectedUser?.username}`}
                {modalMode === "delete" && `刪除用戶: ${selectedUser?.username}`}
                {modalMode === "create" && "新增用戶"}
                {modalMode === "reset-password" && `重置密碼: ${selectedUser?.username}`}
              </h2>

              {modalError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {modalError}
                </div>
              )}

              {modalSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center">
                  <CheckCircle size={18} className="mr-2" />
                  {modalSuccess}
                </div>
              )}

              {modalMode === "delete" && (
                <div>
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle
                        className="text-amber-500 mr-2 flex-shrink-0 mt-1"
                        size={20}
                      />
                      <div>
                        <p className="text-amber-700 font-medium">
                          確定要刪除此用戶嗎？
                        </p>
                        <p className="text-amber-600">
                          此操作無法撤銷，用戶的所有資料將被永久刪除。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg mr-2 hover:bg-gray-50"
                      disabled={modalLoading}
                    >
                      取消
                    </button>
                    <button
                      onClick={handleDeleteUser}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                      disabled={modalLoading}
                    >
                      {modalLoading ? (
                        <>
                          <RefreshCw className="animate-spin mr-2" size={16} />
                          處理中...
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} className="mr-2" />
                          確認刪除
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {modalMode === "reset-password" && (
                <form onSubmit={handleFormSubmit}>
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle
                        className="text-amber-500 mr-2 flex-shrink-0 mt-1"
                        size={20}
                      />
                      <div>
                        <p className="text-amber-700 font-medium">
                          確定要重置此用戶的密碼嗎？
                        </p>
                        <p className="text-amber-600">
                          此操作將會設置一個新密碼，舊密碼將無法使用。
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="newPassword">
                      新密碼
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg mr-2 hover:bg-gray-50"
                      disabled={modalLoading}
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center"
                      disabled={modalLoading}
                    >
                      {modalLoading ? (
                        <>
                          <RefreshCw className="animate-spin mr-2" size={16} />
                          處理中...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="mr-2" />
                          確認重置
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
              
              {(modalMode === "edit" || modalMode === "create") && (
                <form onSubmit={handleFormSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="username">
                      用戶名
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      defaultValue={selectedUser?.username || ""}
                      disabled={modalMode === "edit"}
                      required={modalMode === "create"}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">
                      電子郵件
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      defaultValue={selectedUser?.email || ""}
                      required
                    />
                  </div>
                  
                  {modalMode === "create" && (
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="password">
                        密碼
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required={modalMode === "create"}
                        minLength={6}
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="firstName">
                      名字
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      defaultValue={selectedUser?.firstName || ""}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="lastName">
                      姓氏
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      defaultValue={selectedUser?.lastName || ""}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      角色
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="role-admin"
                          name="role-admin"
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          defaultChecked={selectedUser?.roles?.includes(
                            "ROLE_ADMIN"
                          )}
                        />
                        <label
                          htmlFor="role-admin"
                          className="ml-2 text-gray-700"
                        >
                          管理員
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="role-moderator"
                          name="role-moderator"
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          defaultChecked={selectedUser?.roles?.includes(
                            "ROLE_MODERATOR"
                          )}
                        />
                        <label
                          htmlFor="role-moderator"
                          className="ml-2 text-gray-700"
                        >
                          版主
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="role-user"
                          name="role-user"
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          defaultChecked={selectedUser?.roles?.includes(
                            "ROLE_USER"
                          ) || modalMode === "create"}
                        />
                        <label
                          htmlFor="role-user"
                          className="ml-2 text-gray-700"
                        >
                          用戶
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg mr-2 hover:bg-gray-50"
                      disabled={modalLoading}
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
                      disabled={modalLoading}
                    >
                      {modalLoading ? (
                        <>
                          <RefreshCw className="animate-spin mr-2" size={16} />
                          處理中...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="mr-2" />
                          確認
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
