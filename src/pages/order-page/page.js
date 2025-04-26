import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";
import Footer from "../../components/Footer";

const PageOrder = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [address, setAddress] = useState(""); // State để lưu địa chỉ
  const [phone, setPhone] = useState(""); // State để lưu số điện thoại
  const navigate = useNavigate();

  // Hàm tính tổng tiền đơn hàng
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Lấy dữ liệu đơn hàng từ localStorage
  useEffect(() => {
    const storedOrderProducts = JSON.parse(
      localStorage.getItem("orderProducts")
    );

    if (storedOrderProducts) {
      setOrderItems(storedOrderProducts);
      setTotalAmount(calculateTotal(storedOrderProducts));
    } else {
      navigate("/cart");
    }

    // Lấy thông tin địa chỉ và số điện thoại từ localStorage (nếu có)
    const savedAddress = localStorage.getItem("userAddress");
    const savedPhone = localStorage.getItem("userPhone");

    if (savedAddress) setAddress(savedAddress);
    if (savedPhone) setPhone(savedPhone);
  }, [navigate]);

  // Xử lý thanh toán
  const handlePayment = async () => {
    try {
      // Lưu thông tin địa chỉ và số điện thoại vào localStorage
      localStorage.setItem("userAddress", address);
      localStorage.setItem("userPhone", phone);

      // Giả lập quá trình thanh toán
      alert("Payment successful!");
      localStorage.removeItem("orderProducts"); // Xóa sản phẩm khỏi localStorage sau khi thanh toán thành công
      navigate("/checkout");
    } catch (error) {
      console.error("Payment failed:", error);
      alert(
        "An error occurred while processing your payment. Please try again."
      );
    }
  };

  const renderOrderItems = () => {
    return orderItems.map((item) => (
      <div
        key={item.idProduct}
        className="order-item flex justify-between py-2 border-b"
      >
        <div className="item-info">
          <p>{item.bookName}</p>
          <p className="text-gray-500">Quantity: {item.quantity}</p>
        </div>
        <div className="item-price">
          <p>£{(item.price / 100).toFixed(2)}</p> {/* Định dạng giá tiền */}
        </div>
      </div>
    ));
  };

  const renderEmptyOrder = () => (
    <div className="text-center py-10">
      <p>No items in your order.</p>
      <button
        onClick={() => navigate("/")}
        className="text-blue-500 hover:underline"
      >
        Go back to shop
      </button>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="order-summary">
      <div className="order-items">{renderOrderItems()}</div>

      <div className="order-total py-4">
        <div className="flex justify-between">
          <p className="font-semibold">Total Amount</p>
          <p>£{(totalAmount / 100).toFixed(2)}</p> {/* Định dạng tổng tiền */}
        </div>
      </div>

      {/* Form nhập địa chỉ và số điện thoại */}
      <div className="order-details py-4">
        <div>
          <label htmlFor="address" className="block font-semibold">
            Address:
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-2"
            placeholder="Enter your address"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="phone" className="block font-semibold">
            Phone:
          </label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-2"
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      <div className="payment-actions flex justify-end gap-4">
        <button
          onClick={() => navigate("/cart")}
          className="bg-gray-500 text-white py-2 px-4 rounded"
        >
          Edit Order
        </button>
        <button
          onClick={handlePayment}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );

  return (
    <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
      <TopMenu />
      <MainHeader />
      <SubMenu />

      <div className="max-w-[1200px] mx-auto mb-8 min-h-[300px]">
        <div className="text-2xl font-bold my-4">Order Details</div>

        {orderItems.length === 0 ? renderEmptyOrder() : renderOrderSummary()}
      </div>

      <Footer />
    </div>
  );
};

export default PageOrder;
