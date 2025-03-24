import React from "react";

const Account = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Tài khoản</h2>
      <p className="text-gray-600 mb-6">
        Nơi bạn quản lý thông tin tài khoản cá nhân.
      </p>

      {/* Personal Info */}
      <div className="border rounded p-4 mb-4">
        <h3 className="text-md font-semibold mb-2">Thông tin cá nhân</h3>
        <p className="text-gray-500 mb-1">Tên: Nguyễn Văn A</p>
        <p className="text-gray-500 mb-1">Địa chỉ: 123 Đường Láng, Hà Nội</p>
        <p className="text-gray-500 mb-1">Email: nguyen.van.a@example.com</p>
        <p className="text-gray-500 mb-2">Số điện thoại: 0123 456 789</p>
        <button className="text-blue-500 hover:underline">
          Cập nhật thông tin
        </button>
      </div>

      {/* Payment & Payouts */}
      <div className="border rounded p-4 mb-4">
        <h3 className="text-md font-semibold mb-2">Thanh toán & Nhận tiền</h3>
        <p className="text-gray-500 mb-1">Phương thức thanh toán: Thẻ Visa</p>
        <p className="text-gray-500 mb-1">Phương thức nhận tiền: PayPal</p>
        <p className="text-gray-500 mb-2">Trạng thái: Đã xác minh</p>
        <button className="text-blue-500 hover:underline">
          Quản lý phương thức thanh toán
        </button>
      </div>

      {/* Preferences */}
      <div className="border rounded p-4 mb-4">
        <h3 className="text-md font-semibold mb-2">Tùy chỉnh</h3>
        <p className="text-gray-500 mb-1">Thông báo: Bật (Email + Ứng dụng)</p>
        <p className="text-gray-500 mb-1">Ngôn ngữ: Tiếng Việt</p>
        <p className="text-gray-500 mb-2">Chế độ bảo mật: Xác minh 2 bước (Bật)</p>
        <button className="text-blue-500 hover:underline">
          Thay đổi tùy chỉnh
        </button>
      </div>

      {/* Subscriptions */}
      <div className="border rounded p-4">
        <h3 className="text-md font-semibold mb-2">Gói dịch vụ</h3>
        <p className="text-gray-500 mb-2">
          Theo dõi các gói đăng ký của eBay nếu có.
        </p>
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
        <button className="text-blue-500 hover:underline mt-2">
          Quản lý gói dịch vụ
        </button>
      </div>
    </div>
  );
};

export default Account;