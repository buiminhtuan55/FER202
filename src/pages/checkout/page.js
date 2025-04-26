import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Footer from "../../components/Footer";
import SubMenu from "../../components/SubMenu";
import MainHeader from "../../components/MainHeader";
import TopMenu from "../../components/TopMenu";

// Định nghĩa CheckoutItem
function CheckoutItem({ product }) {
    return (
        <div className="flex items-center gap-4 p-4 border-b">
            <img
                src={`${product.url}/100`}
                alt={product.title}
                className="w-[100px] h-[100px] object-cover rounded-lg"
            />
            <div>
                <div className="font-semibold">{product.title}</div>
                <div className="text-sm text-gray-500">{product.description}</div>
                <div className="font-bold mt-2">
                    £{(product.price * product.quantity / 100).toFixed(2)}
                </div>
            </div>
        </div>
    );
}

function PayPalCheckoutSimulation({ amount, onComplete, onCancel }) {
    const [stage, setStage] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    
    const handlePayPalFlow = () => {
      if (stage === "login" && email && password) {
        setStage("payment");
      } else if (stage === "login") {
        setErrorMessage("Please enter your email and password");
      }
    };
    
    const handleProcessPayment = () => {
      setStage("processing");
      
      setTimeout(() => setStage("complete"), 3500);
      setTimeout(() => onComplete(), 5000);
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl">
          <div className="bg-[#003087] px-6 py-4 flex justify-between items-center">
            <img 
              src="/images/paypal-white-logo.svg" 
              alt="PayPal" 
              className="h-8"
              onError={(e) => e.target.src = "https://picsum.photos/id/200/80/30"} 
            />
            <button 
              onClick={onCancel} 
              className="text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content area */}
          <div className="p-6">
            {/* Login Stage */}
            {stage === "login" && (
              <div>
                <h2 className="text-xl font-bold mb-6 text-center">Log in to your PayPal account</h2>
                {errorMessage && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                    {errorMessage}
                  </div>
                )}
                <form onSubmit={(e) => { e.preventDefault(); handlePayPalFlow(); }}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Email or mobile number</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Email or mobile number"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold py-3 px-4 rounded-md transition duration-200"
                  >
                    Log In
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <a href="#" className="text-sm text-[#0070ba] hover:underline">Forgot email or password?</a>
                </div>
                <div className="mt-6 text-center">
                  <span className="text-sm text-gray-600">Don't have an account? </span>
                  <a href="#" className="text-sm text-[#0070ba] hover:underline">Sign Up</a>
                </div>
              </div>
            )}
            
            {/* Payment Confirmation Stage */}
            {stage === "payment" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Review your payment</h2>
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Pay to:</span>
                    <span className="font-medium">Your E-Commerce Store</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold">£{(amount / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment method:</span>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#003087" className="mr-1">
                        <path d="M20.1 6.75H16.9c-.2 0-.35.1-.4.25L15 13.1c-.1.4.2.75.6.75h1.6c.25 0 .5-.2.55-.45l.4-1.65h1.55c1.85 0 3.3-1.2 3.55-3.05.35-2.3-1.35-3.95-3.15-3.95z" />
                        <path d="M14.55 6.75H9.65c-.2 0-.35.1-.4.25l-1.5 6.1c-.1.4.2.75.6.75h1.65c.2 0 .35-.1.4-.25l.4-1.7c.05-.15.2-.25.4-.25h1.3c1.85 0 3.3-1.2 3.55-3.05.35-2.3-1.35-3.85-3-3.85z" />
                        <path d="M7.5 10.75l-.8 3.1c-.1.4.2.75.6.75h1.55c.2 0 .35-.1.4-.25l.8-3.1c.1-.4-.2-.75-.6-.75H8c-.25 0-.4.1-.5.25z" />
                      </svg>
                      <span>PayPal Balance</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleProcessPayment}
                  className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold py-3 px-4 rounded-md transition duration-200 mb-3"
                >
                  Pay Now
                </button>
                
                <button
                  onClick={onCancel}
                  className="w-full bg-white hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 border border-gray-300 rounded-md transition duration-200"
                >
                  Cancel
                </button>
              </div>
            )}
            
            {/* Processing Stage */}
            {stage === "processing" && (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-6 text-lg">Processing your payment...</p>
                <p className="mt-2 text-sm text-gray-500">Please don't close this window</p>
              </div>
            )}
            
            {/* Complete Stage */}
            {stage === "complete" && (
              <div className="text-center py-6">
                <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-bold text-green-600">Payment successful!</h3>
                <p className="mt-2 text-gray-600">Your transaction has been completed</p>
                <p className="mt-4 text-sm text-gray-500">Redirecting to merchant site...</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 text-center border-t">
            <div className="flex justify-center space-x-4 mb-2">
              <a href="#" className="text-xs text-gray-600 hover:underline">Help</a>
              <a href="#" className="text-xs text-gray-600 hover:underline">Contact Us</a>
              <a href="#" className="text-xs text-gray-600 hover:underline">Privacy</a>
              <a href="#" className="text-xs text-gray-600 hover:underline">Legal</a>
            </div>
            <p className="text-xs text-gray-500">© 1999-2025 PayPal</p>
          </div>
        </div>
      </div>
    );
  }

export default function Checkout() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [addressDetails, setAddressDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState("paypal");
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [products, setProducts] = useState();
    const [dataFetched, setDataFetched] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    // Fetch payment methods
    const fetchPaymentMethods = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:9999/paymentMethods?status=Active");
            if (!response.ok) {
                throw new Error(`Failed to fetch payment methods: ${response.status}`);
            }
            const data = await response.json();
            setPaymentMethods(data);
        } catch (error) {
            console.error("Error fetching payment methods:", error);
            // Provide fallback payment methods if API fails
            setPaymentMethods([
                { id: "pm001", name: "Credit Card" },
                { id: "pm002", name: "PayPal" },
                { id: "pm007", name: "Cash on Delivery (COD)" }
            ]);
        }
    }, []);

    const fetchAllProducts = useCallback(async () => {
      try {
          const res = await fetch("http://localhost:9999/products");
          const data = await res.json();
          setProducts(data);
      } catch (error) {
          console.error("Error fetching all products:", error);
          setProducts([]);
      }
  }, []);

    // Hàm lấy dữ liệu từ API
    const fetchCartItems = useCallback(async () => {
        if (!currentUser) {
            setCartItems([]);
            return;
        }

        try {
            const cartResponse = await fetch(
                `http://localhost:9999/shoppingCart?userId=${currentUser.id}`
            );
            if (!cartResponse.ok) {
                throw new Error(`Failed to fetch cart: ${cartResponse.status}`);
            }
            const cartData = await cartResponse.json();

            if (!cartData || cartData.length === 0) {
                setCartItems([]);
                return;
            }

            // Lấy chi tiết sản phẩm cho từng mục trong giỏ hàng
            const itemsWithDetails = await Promise.all(
                cartData.flatMap(cartItem =>
                    cartItem.productId.map(async (product) => {
                        const productResponse = await fetch(
                            `http://localhost:9999/products?id=${product.idProduct}`
                        );
                        if (!productResponse.ok) {
                            return null;
                        }
                        const productData = await productResponse.json();

                        // Xử lý cả trường hợp API trả về mảng hoặc object
                        let productInfo = Array.isArray(productData) ? productData[0] : productData;
                        if (productInfo) {
                            return {
                                ...productInfo,
                                quantity: parseInt(product.quantity),
                                idProduct: product.idProduct,
                                cartItemId: cartItem.id,
                            };
                        }
                        return null;
                    })
                )
            );

            const filteredItems = itemsWithDetails.filter(item => item !== null);
            setCartItems(filteredItems);
        } catch (error) {
            console.error("Error fetching cart:", error);
            setCartItems([]);
        }
    }, [currentUser]);

    const fetchAddressDetails = useCallback(async () => {
        if (!currentUser) return;
    
        try {
            const addressResponse = await fetch(`http://localhost:9999/address?userId=${currentUser.id}`);
            if (!addressResponse.ok) {
                throw new Error(`Failed to fetch address: ${addressResponse.status}`);
            }
            const addressData = await addressResponse.json();
    
            const defaultAddress = addressData.find(addr => addr.isDefault);
            if (defaultAddress) {
                setAddressDetails({
                    name: defaultAddress.fullName,
                    address: defaultAddress.street,
                    zipcode: defaultAddress.state,
                    city: defaultAddress.city,
                    country: defaultAddress.country,
                });
            } else {
                setAddressDetails({
                    name: "N/A",
                    address: "N/A",
                    zipcode: "N/A",
                    city: "N/A",
                    country: "N/A",
                });
            }
        } catch (error) {
            console.error("Error fetching address:", error);
            setAddressDetails({
                name: "N/A",
                address: "N/A",
                zipcode: "N/A",
                city: "N/A",
                country: "N/A",
            });
        }
    }, [currentUser]);
    
    // Fetch all data only once when component mounts
    useEffect(() => {
        const fetchData = async () => {
            if (dataFetched) return;
            
            setIsLoading(true);
            await Promise.all([
                fetchCartItems(),
                fetchAddressDetails(),
                fetchPaymentMethods(),
                fetchAllProducts()
            ]);
            setIsLoading(false);
            setDataFetched(true);
        };
        
        fetchData();
    }, [fetchCartItems, fetchAddressDetails, fetchPaymentMethods, dataFetched]);

    // Tính tổng tiền
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const createOrderNotification = async (currentUser, orderId, orderData, isSuccess) => {
        try {
          let notification;
          
          if (isSuccess) {
            notification = {
              id: `n${Date.now()}`,
              user_id: currentUser.id,
              type: "order",
              title: `Đơn hàng #${orderId} đã được xác nhận`,
              content: `Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị. Tổng giá trị: £${orderData.totalPrice.toFixed(2)}`,
              order_id: orderId,
              status: "unread",
              created_at: new Date().toISOString(),
              action_url: `/order-history`,
              senderId: "system",
              reiceiverId: currentUser.id,
            };
          } else {
            notification = {
              id: `n${Date.now()}`,
              user_id: currentUser.id,
              type: "order",
              title: `Thanh toán đơn hàng #${orderId} không thành công`,
              content: `Đã xảy ra lỗi khi xử lý thanh toán cho đơn hàng của bạn. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.`,
              order_id: orderId,
              status: "unread",
              created_at: new Date().toISOString(),
              action_url: `/checkout`
            };
          }
      
          await fetch("http://localhost:9999/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(notification),
          });
          
          console.log(`Order ${isSuccess ? "success" : "failure"} notification created successfully`);
        } catch (error) {
          console.error("Error creating order notification:", error);
        }
      };
      
      const processOrder = async (paymentStatus) => {
        if (!currentUser) {
          alert("Please login to checkout");
          navigate("/auth");
          return;
        }
      
        if (cartItems.length === 0) {
          alert("Your cart is empty!");
          return;
        }
        
        const orderId = "ORD" + Math.floor(100 + Math.random() * 900);
        const orderData = {
          id: orderId,
          buyerId: currentUser.id,
          order_date: new Date().toISOString(),
          totalPrice: parseFloat((getCartTotal() / 100).toFixed(2)),
          status: paymentMethod === "cod" ? "pending_payment" : "paid",
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          shipping_address: {
            address: addressDetails ? addressDetails.address : "N/A",
            zipcode: addressDetails ? addressDetails.zipcode : "N/A",
            country: addressDetails ? addressDetails.country : "N/A",
            city: addressDetails ? addressDetails.country : "N/A",
            state: addressDetails ? addressDetails.state : "N/A",
          },
        };
      
        try {
          await fetch("http://localhost:9999/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
          });
      
          const updatedOrderIds = [...(currentUser.order_id || []), orderId];
          await fetch(`http://localhost:9999/user/${currentUser.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: updatedOrderIds }),
          });
          for (let item of cartItems) {
            const product = products.find(p => p.id === item.idProduct);
            if (!product) {
              console.error("Product not found for id:", item.idProduct);
              continue;
            }
          
            const orderItemData = {
              orderId: orderId,
              productId: item.idProduct,
              quantity: item.quantity,
              unitPrice: parseFloat((product.price / 100).toFixed(2)),
            };
          
            await fetch("http://localhost:9999/orderItems", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(orderItemData),
            });
          }
          const cartRes = await fetch(`http://localhost:9999/shoppingCart?userId=${currentUser.id}`);
          const cartData = await cartRes.json();
          for (let cart of cartData) {
            await fetch(`http://localhost:9999/shoppingCart/${cart.id}`, { method: "DELETE" });
          }
      
          await createOrderNotification(currentUser, orderId, orderData, true);
      
          localStorage.setItem("currentUser", JSON.stringify({ ...currentUser, order_id: updatedOrderIds }));
      
          navigate("/success", {
            state: {
              cartItems: cartItems,
              addressDetails: addressDetails,
              orderTotal: getCartTotal(),
              paymentMethod: paymentMethod
            },
          });
        } catch (error) {
          console.error("Payment error:", error);
          await createOrderNotification(currentUser, orderId, orderData, false);
          alert("Đã xảy ra lỗi khi thanh toán.");
        }
      };
      
      const handlePayment = async () => {
        if (paymentMethod === "paypal") {
          setIsProcessingPayment(true);
        } else if (paymentMethod === "cod") {
          await processOrder("pending");
        } else {
          alert("This payment method is not yet implemented");
        }
      };
      
      const handlePaymentComplete = async () => {
        await processOrder("completed");
        setIsProcessingPayment(false);
      };
      
      const handlePaymentCancel = () => {
        setIsProcessingPayment(false);
        
        try {
          const notification = {
            id: `n${Date.now()}`,
            user_id: currentUser.id,
            type: "order",
            title: "Thanh toán đã bị hủy",
            content: "Bạn đã hủy quá trình thanh toán. Giỏ hàng của bạn vẫn được giữ nguyên.",
            status: "unread",
            created_at: new Date().toISOString(),
            action_url: "/cart",
            senderId: "system",
            reiceiverId: currentUser.id,
          };
      
          fetch("http://localhost:9999/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(notification),
          });
        } catch (error) {
          console.error("Error creating cancel payment notification:", error);
        }
      };

    if (!currentUser) {
        return (
            <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
                <div>
                    <TopMenu />
                    <MainHeader />
                    <SubMenu />
                </div>
                <div className="text-center py-20">
                    Please{" "}
                    <button
                        onClick={() => navigate("/auth")}
                        className="text-blue-500 hover:underline"
                    >
                        login
                    </button>{" "}
                    to proceed to checkout
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
                <div>
                    <TopMenu />
                    <MainHeader />
                    <SubMenu />
                </div>
                <div id="CheckoutPage" className="mt-4 max-w-[1100px] mx-auto">
                    <div className="text-2xl font-bold mt-4 mb-4">Checkout</div>

                    {isLoading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : (
                        <div className="relative flex items-baseline gap-4 justify-between mx-auto w-full">
                            <div className="w-[65%]">
                                <div className="bg-white rounded-lg p-4 border">
                                    <div className="text-xl font-semibold mb-2">
                                        Shipping Address
                                    </div>
                                    <div>
                                        <a
                                            href="/address"
                                            className="text-blue-500 text-sm underline"
                                        >
                                            Update Address
                                        </a>
                                        {addressDetails ? (
                                            <ul className="text-sm mt-2">
                                                <li>Name: {addressDetails.name}</li>
                                                <li>Address: {addressDetails.address}</li>
                                                <li>Zip: {addressDetails.zipcode}</li>
                                                <li>City: {addressDetails.city}</li>
                                                <li>Country: {addressDetails.country}</li>
                                            </ul>
                                        ) : (
                                            <div className="text-sm mt-2">
                                                No address available
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border mt-4">
                                    <div className="text-xl font-semibold mb-2">
                                        Payment Method
                                    </div>
                                    <div className="mt-2 space-y-3">
                                        {/* Payment method selection */}
                                        <div className="flex flex-col gap-3">
                                            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                <input 
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="paypal"
                                                    checked={paymentMethod === "paypal"}
                                                    onChange={() => setPaymentMethod("paypal")}
                                                    className="h-4 w-4 text-blue-600"
                                                />
                                                <div className="ml-3 flex items-center">
                                                    <div className="mr-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#003087">
                                                            <path d="M20.1 6.75H16.9c-.2 0-.35.1-.4.25L15 13.1c-.1.4.2.75.6.75h1.6c.25 0 .5-.2.55-.45l.4-1.65h1.55c1.85 0 3.3-1.2 3.55-3.05.35-2.3-1.35-3.95-3.15-3.95zm.55 3.5c-.15 1-.95 1.7-2 1.7h-1.1l.35-1.7c0-.1.15-.2.25-.2h.6c.95 0 1.6.2 1.9.8.1.2.1.4 0 .6zm-6.1-3.5H9.65c-.2 0-.35.1-.4.25l-1.5 6.1c-.1.4.2.75.6.75h1.65c.2 0 .35-.1.4-.25l.4-1.7c.05-.15.2-.25.4-.25h1.3c1.85 0 3.3-1.2 3.55-3.05.35-2.3-1.35-3.85-3-3.85zm.55 3.5c-.15 1-.95 1.7-2 1.7h-1.1l.35-1.7c0-.1.15-.2.25-.2h.6c.95 0 1.6.2 1.9.8.1.2.1.4 0 .6zM7.5 10.75l-.8 3.1c-.1.4.2.75.6.75h1.55c.2 0 .35-.1.4-.25l.8-3.1c.1-.4-.2-.75-.6-.75H8c-.25 0-.4.1-.5.25z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">PayPal</span>
                                                        <p className="text-sm text-gray-500">Pay securely using your PayPal account</p>
                                                    </div>
                                                </div>
                                            </label>
                                            
                                            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                <input 
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="cod"
                                                    checked={paymentMethod === "cod"}
                                                    onChange={() => setPaymentMethod("cod")}
                                                    className="h-4 w-4 text-blue-600"
                                                />
                                                <div className="ml-3 flex items-center">
                                                    <div className="mr-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="2" y="6" width="20" height="12" rx="2" />
                                                            <circle cx="12" cy="12" r="2" />
                                                            <path d="M6 12h.01M18 12h.01" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Cash on Delivery</span>
                                                        <p className="text-sm text-gray-500">Pay with cash when your order is delivered</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div id="Items" className="bg-white rounded-lg mt-4">
                                    <div className="text-xl font-semibold p-4 border-b">Order Items</div>
                                    {cartItems.length === 0 ? (
                                        <div className="text-center py-4">
                                            No items in cart
                                        </div>
                                    ) : (
                                        cartItems.map((product) => (
                                            <CheckoutItem
                                                key={`${product.cartItemId}-${product.idProduct}`}
                                                product={product}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>

                            <div
                                id="PlaceOrder"
                                className="relative -top-[6px] w-[35%] border rounded-lg"
                            >
                                <div className="p-4">
                                    <div className="text-xl font-semibold mb-4">Order Summary</div>
                                    <div className="flex items-baseline justify-between text-sm mb-1">
                                        <div>
                                            Items (
                                            {cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                                        </div>
                                        <div>£{(getCartTotal() / 100).toFixed(2)}</div>
                                    </div>
                                    <div className="flex items-center justify-between mb-4 text-sm">
                                        <div>Shipping:</div>
                                        <div>Free</div>
                                    </div>

                                    <div className="border-t" />

                                    <div className="flex items-center justify-between my-4">
                                        <div className="font-semibold">Order total</div>
                                        <div className="text-2xl font-semibold">
                                            £{(getCartTotal() / 100).toFixed(2)}
                                        </div>
                                    </div>

                                    <button
                                        className={`mt-4 w-full text-lg text-white font-semibold p-3 rounded-full ${
                                            cartItems.length === 0 
                                                ? "bg-gray-400 cursor-not-allowed" 
                                                : paymentMethod === "paypal" 
                                                    ? "bg-blue-600 hover:bg-blue-700" 
                                                    : "bg-green-600 hover:bg-green-700"
                                        }`}
                                        onClick={handlePayment}
                                        disabled={cartItems.length === 0}
                                    >
                                        {paymentMethod === "paypal" ? "Pay with PayPal" : "Place Order (COD)"}
                                    </button>
                                </div>

                                <div className="flex items-center p-4 justify-center gap-2 border-t">
                                    <img width={50} src="/images/logo.svg" alt="Logo" 
                                         onError={(e) => e.target.src = "https://picsum.photos/id/237/50/50"}/>
                                    <div className="font-light mb-2 mt-2">
                                        MONEY BACK GUARANTEE
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <Footer />
                </div>
            </div>

             {isProcessingPayment && (
                <PayPalCheckoutSimulation 
                    amount={getCartTotal()}
                    onComplete={handlePaymentComplete}
                    onCancel={handlePaymentCancel}
                />
            )}
        </>
    );
}