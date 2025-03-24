import React, { useState, useEffect } from "react";

const PersonalInfo = ({ userInfo, onSave }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(userInfo);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="border rounded p-4 mb-4">
      <h3 className="text-md font-semibold mb-2">Thông tin cá nhân</h3>
      <p className="text-gray-500 mb-1">Tên: {userInfo.fullname}</p>
      <p className="text-gray-500 mb-1">
        Địa chỉ: {`${userInfo.address.street}, ${userInfo.address.city}, ${userInfo.address.zipcode}, ${userInfo.address.country}`}
      </p>
      <p className="text-gray-500 mb-1">Email: {userInfo.email}</p>
      <p className="text-gray-500 mb-2">Số điện thoại: Không có</p>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-blue-500 hover:underline"
      >
        Cập nhật thông tin
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Cập nhật thông tin</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Tên</label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Đường</label>
                <input
                  type="text"
                  name="street"
                  value={formData.address.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value },
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Thành phố</label>
                <input
                  type="text"
                  name="city"
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Mã bưu điện</label>
                <input
                  type="text"
                  name="zipcode"
                  value={formData.address.zipcode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, zipcode: e.target.value },
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Quốc gia</label>
                <input
                  type="text"
                  name="country"
                  value={formData.address.country}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, country: e.target.value },
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentPayouts = ({ paymentMethods, onSave }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [methods, setMethods] = useState(paymentMethods);
  const [newMethod, setNewMethod] = useState({
    name: "",
    description: "",
    processingFee: 0,
    currency: [],
    status: "Active",
  });

  const handleAddMethod = async (e) => {
    e.preventDefault();
    const methodToAdd = {
      id: `pm${Date.now()}`,
      ...newMethod,
    };
    const updatedMethods = [...methods, methodToAdd];
    setMethods(updatedMethods);
    onSave(updatedMethods);
    setNewMethod({ name: "", description: "", processingFee: 0, currency: [], status: "Active" });

    try {
      await fetch("http://localhost:9999/paymentMethods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(methodToAdd),
      });
    } catch (err) {
      console.error("Lỗi khi thêm phương thức:", err);
    }
  };

  const handleRemoveMethod = async (id) => {
    const updatedMethods = methods.filter((method) => method.id !== id);
    setMethods(updatedMethods);
    onSave(updatedMethods);

    try {
      await fetch(`http://localhost:9999/paymentMethods/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Lỗi khi xóa phương thức:", err);
    }
  };

  return (
    <div className="border rounded p-4 mb-4">
      <h3 className="text-md font-semibold mb-2">Thanh toán & Nhận tiền</h3>
      <p className="text-gray-500 mb-1">
        Phương thức thanh toán: {methods.find((m) => m.name === "Credit Card") ? "Thẻ tín dụng" : "Chưa có"}
      </p>
      <p className="text-gray-500 mb-1">
        Phương thức nhận tiền: {methods.find((m) => m.name === "PayPal") ? "PayPal" : "Chưa có"}
      </p>
      <p className="text-gray-500 mb-2">Trạng thái: {methods.length > 0 ? "Đã xác minh" : "Chưa xác minh"}</p>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-blue-500 hover:underline"
      >
        Quản lý phương thức thanh toán
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Quản lý phương thức thanh toán</h3>

            {/* Danh sách phương thức thanh toán - hiển thị ngang */}
            <div className="mb-6">
              {methods.length === 0 ? (
                <p className="text-gray-500">Chưa có phương thức thanh toán nào.</p>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex space-x-4">
                    {methods.map((method) => (
                      <div
                        key={method.id}
                        className="flex-shrink-0 w-64 p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="font-semibold">{method.name}</div>
                        <p className="text-sm text-gray-500">{method.description}</p>
                        <p className="text-sm text-gray-500">Phí: {method.processingFee}%</p>
                        <p className="text-sm text-gray-500">Tiền tệ: {method.currency.join(", ")}</p>
                        <p className="text-sm text-gray-500">Trạng thái: {method.status}</p>
                        <button
                          onClick={() => handleRemoveMethod(method.id)}
                          className="mt-2 text-red-500 hover:text-red-700 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form thêm phương thức mới */}
            <form onSubmit={handleAddMethod}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Tên phương thức</label>
                <input
                  type="text"
                  value={newMethod.name}
                  onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Ví dụ: Credit Card"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Mô tả</label>
                <input
                  type="text"
                  value={newMethod.description}
                  onChange={(e) => setNewMethod({ ...newMethod, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Ví dụ: Visa, MasterCard,..."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Phí xử lý (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newMethod.processingFee}
                  onChange={(e) =>
                    setNewMethod({ ...newMethod, processingFee: parseFloat(e.target.value) })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Tiền tệ (cách nhau bởi dấu phẩy)</label>
                <input
                  type="text"
                  value={newMethod.currency.join(", ")}
                  onChange={(e) =>
                    setNewMethod({
                      ...newMethod,
                      currency: e.target.value.split(", ").map((c) => c.trim()),
                    })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="Ví dụ: USD, EUR, GBP"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Account = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = localStorage.getItem("currentUser");
      if (!storedUser) {
        setError("Vui lòng đăng nhập để xem thông tin tài khoản.");
        setLoading(false);
        return;
      }

      const currentUser = JSON.parse(storedUser);
      try {
        const userResponse = await fetch(`http://localhost:9999/user?id=${currentUser.id}`);
        if (!userResponse.ok) throw new Error("Không thể lấy thông tin người dùng từ server.");
        const userData = await userResponse.json();
        const user = Array.isArray(userData) ? userData[0] : userData;
        setUserInfo(user);

        const paymentResponse = await fetch("http://localhost:9999/paymentMethods");
        if (!paymentResponse.ok) throw new Error("Không thể lấy phương thức thanh toán.");
        const paymentData = await paymentResponse.json();
        setPaymentMethods(paymentData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveUserInfo = async (updatedInfo) => {
    try {
      const response = await fetch(`http://localhost:9999/user/${updatedInfo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedInfo),
      });
      if (!response.ok) throw new Error("Không thể cập nhật thông tin.");
      setUserInfo(updatedInfo);
      console.log("Thông tin đã được cập nhật:", updatedInfo);
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin:", err);
    }
  };

  const handleSavePaymentMethods = async (updatedMethods) => {
    setPaymentMethods(updatedMethods);
    try {
      await fetch("http://localhost:9999/paymentMethods", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMethods),
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật phương thức thanh toán:", err);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!userInfo) return <div>Không có thông tin người dùng.</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Tài khoản</h2>
      <p className="text-gray-600 mb-6">Nơi bạn quản lý thông tin tài khoản cá nhân.</p>

      <PersonalInfo userInfo={userInfo} onSave={handleSaveUserInfo} />
      <PaymentPayouts paymentMethods={paymentMethods} onSave={handleSavePaymentMethods} />

      <div className="border rounded p-4 mb-4">
        <h3 className="text-md font-semibold mb-2">Tùy chỉnh</h3>
        <p className="text-gray-500 mb-1">Thông báo: Bật (Email + Ứng dụng)</p>
        <p className="text-gray-500 mb-1">Ngôn ngữ: Tiếng Việt</p>
        <p className="text-gray-500 mb-2">Chế độ bảo mật: Xác minh 2 bước (Bật)</p>
        <button className="text-blue-500 hover:underline">Thay đổi tùy chỉnh</button>
      </div>

      <div className="border rounded p-4">
        <h3 className="text-md font-semibold mb-2">Gói dịch vụ</h3>
        <p className="text-gray-500 mb-2">Theo dõi các gói đăng ký của eBay nếu có.</p>
        <ul className="space-y-2">
          <li className="flex justify-between items-center">
            <span>Gói bán hàng Pro</span>
            <span className="text-gray-400 text-sm">Hết hạn: 30/04/2025</span>
          </li>
          <li className="flex justify-between items-center">
            <span>Gói quảng cáo nâng cao</span>
            <span className="text-gray-400 text-sm">Không hoạt động</span>
          </li>
        </ul>
        <button className="text-blue-500 hover:underline mt-2">Quản lý gói dịch vụ</button>
      </div>
    </div>
  );
};

export default Account;