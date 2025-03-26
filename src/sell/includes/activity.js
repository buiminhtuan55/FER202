import React from "react";
import { useNavigate } from "react-router-dom";


const Activity = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Hoạt động</h2>
      <p className="text-gray-600 mb-6">
        Đây là nơi bạn có thể theo dõi các hoạt động mua và bán hàng của mình.
      </p>

      {/* Get more out of My eBay Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Get more out of My eBay</h3>
        <p className="text-gray-600 mb-4">
          eBay's a big place, here’s your space. Keep an eye on the items that
          matter most to you.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded flex items-center">
            <span className="text-2xl mr-2">🔍</span>
            <div>
              <p>Find deals & items just for you.</p>
              <a href="#" className="text-blue-500 text-sm">
                Learn more
              </a>
            </div>
          </div>
          <div className="p-4 border rounded flex items-center">
            <span className="text-2xl mr-2">👓</span>
            <div>
              <p>Watch items you want to buy or bid on.</p>
              <a href="#" className="text-blue-500 text-sm">
                Learn more
              </a>
            </div>
          </div>
          <div className="p-4 border rounded flex items-center">
            <span className="text-2xl mr-2">❤️</span>
            <div>
              <p>Save favorite sellers & searches.</p>
              <a href="#" className="text-blue-500 text-sm">
                Learn more
              </a>
            </div>
          </div>
          <div className="p-4 border rounded flex items-center">
            <span className="text-2xl mr-2">🏷️</span>
            <div>
              <p>List items and start selling.</p>
              <a href="#" className="text-blue-500 text-sm">
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <div className="border rounded p-4 mb-4">
        <h3 className="text-md font-semibold mb-2">Lịch sử mua hàng</h3>
        <p className="text-gray-500 mb-2">Xem lại các đơn hàng đã mua.</p>

        <a onClick={() => navigate("/order-history")}
          className="text-blue-500 text-sm mt-2 inline-block hover:underline"
        >
          Xem tất cả lịch sử mua hàng
        </a>
      </div>

      {/* Selling */}
      <div className="border rounded p-4 mb-4">
        <h3 className="text-md font-semibold mb-2">Bán hàng</h3>
        <p className="text-gray-500 mb-2">
          Theo dõi các sản phẩm bạn đang bán, đã bán hoặc chưa thanh toán.
        </p>
        <div className="mb-4">
          <h4 className="text-sm font-medium">Đang bán</h4>
          <ul className="space-y-2 mt-2">
            <li className="flex justify-between items-center">
              <span>Máy ảnh Canon EOS</span>
              <span className="text-blue-500">$450.00</span>
              <span className="text-gray-400 text-sm">Còn 3 ngày</span>
            </li>
          </ul>
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-medium">Đã bán</h4>
          <ul className="space-y-2 mt-2">
            <li className="flex justify-between items-center">
              <span>Áo khoác da</span>
              <span className="text-green-500">$120.00 (Đã bán)</span>
              <span className="text-gray-400 text-sm">20/03/2025</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium">Chưa thanh toán</h4>
          <ul className="space-y-2 mt-2">
            <li className="flex justify-between items-center">
              <span>Đồng hồ thông minh</span>
              <span className="text-blue-500">$200.00</span>
              <span className="text-red-500 text-sm">Chưa thanh toán</span>
            </li>
          </ul>
        </div>
        <a onClick={() => navigate("/sellerProduct")} className="text-blue-500 text-sm mt-2 inline-block">
          Xem tất cả hoạt động bán hàng
        </a>
      </div>

      <div className="border rounded p-4 mb-4">
        <h3 className="text-md font-semibold mb-2">Tổng số doanh thu</h3>
        <p className="text-gray-500 mb-2">
          Lưu trữ các sản phẩm bạn quan tâm.
        </p>
        <ul className="space-y-2">
          <li className="flex justify-between items-center">
            <span>Laptop Dell XPS 13</span>
            <span className="text-blue-500">$1,200.00</span>
            <span className="text-gray-400 text-sm">Còn 5 ngày</span>
          </li>
          <li className="flex justify-between items-center">
            <span>Giày thể thao Nike</span>
            <span className="text-blue-500">$80.00</span>
            <span className="text-gray-400 text-sm">Còn 2 ngày</span>
          </li>
        </ul>
        <a onClick={() => navigate("/totalSell")}  className="text-blue-500 text-sm mt-2 inline-block">
          Xem toàn bộ danh sách theo dõi
        </a>
      </div>

      {/* Watchlist */}
      <div className="border rounded p-4 mb-4">
        <h3 className="text-md font-semibold mb-2">Danh sách theo dõi</h3>
        <p className="text-gray-500 mb-2">
          Lưu trữ các sản phẩm bạn quan tâm.
        </p>
        <ul className="space-y-2">
          <li className="flex justify-between items-center">
            <span>Laptop Dell XPS 13</span>
            <span className="text-blue-500">$1,200.00</span>
            <span className="text-gray-400 text-sm">Còn 5 ngày</span>
          </li>
          <li className="flex justify-between items-center">
            <span>Giày thể thao Nike</span>
            <span className="text-blue-500">$80.00</span>
            <span className="text-gray-400 text-sm">Còn 2 ngày</span>
          </li>
        </ul>
        <a href="#" className="text-blue-500 text-sm mt-2 inline-block">
          Xem toàn bộ danh sách theo dõi
        </a>
      </div>

      {/* Saved Searches */}
      <div className="border rounded p-4">
        <h3 className="text-md font-semibold mb-2">Tìm kiếm đã lưu</h3>
        <p className="text-gray-500 mb-2">
          Lưu lại các tìm kiếm sản phẩm để dễ dàng kiểm tra sau này.
        </p>
        <ul className="space-y-2">
          <li className="flex justify-between items-center">
            <span>"Điện thoại Samsung"</span>
            <span className="text-gray-400 text-sm">10 kết quả mới</span>
          </li>
          <li className="flex justify-between items-center">
            <span>"Máy chơi game PS5"</span>
            <span className="text-gray-400 text-sm">3 kết quả mới</span>
          </li>
        </ul>
        <a href="#" className="text-blue-500 text-sm mt-2 inline-block">
          Xem tất cả tìm kiếm đã lưu
        </a>
      </div>
    </div>
  );
};

export default Activity;