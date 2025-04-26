import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";
import SimilarProducts from "../../components/SimilarProducts";
import Footer from "../../components/Footer";

function EmptyCart() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-2xl font-semibold mb-2">Your cart is empty</h3>
      <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet</p>
      <button
        onClick={() => navigate("/")}
        className="bg-blue-600 text-white px-8 py-2 rounded-full hover:bg-blue-700"
      >
        Start Shopping
      </button>
    </div>
  );
}

function CartItem({ product, cartItemId, onRemove, onUpdateQuantity, availableStock }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b p-4">
      <div className="flex items-center gap-4">
        <img
          src={`${product.url}/100`}
          alt={product.title}
          className="w-[100px] h-[100px] object-cover rounded-lg"
        />
        <div>
          <div className="font-semibold">{product.title}</div>
          <div className="text-sm text-gray-500">{product.description}</div>
          <div className="font-bold mt-2">£{(product.price / 100).toFixed(2)}</div>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onUpdateQuantity(cartItemId, product.idProduct, product.quantity - 1)}
              className="p-1 rounded-full hover:bg-gray-100"
              disabled={product.quantity <= 1}
            >
              <Minus size={16} />
            </button>
            <span>{product.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(cartItemId, product.idProduct, product.quantity + 1)}
              className="p-1 rounded-full hover:bg-gray-100"
              disabled={product.quantity >= availableStock}
            >
              <Plus size={16} />
            </button>
          </div>
          {availableStock === 0 && (
            <div className="text-red-500 text-sm mt-1">Out of stock</div>
          )}
        </div>
      </div>
      <button
        onClick={() => onRemove(cartItemId, product.idProduct)}
        className="text-blue-500 hover:text-blue-700"
      >
        Remove
      </button>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const fetchCartItems = async () => {
    if (!currentUser) {
      setCartItems([]);
      setIsLoading(false);
      return;
    }
    try {
      const cartResponse = await fetch(`http://localhost:9999/shoppingCart?userId=${currentUser.id}`);
      const cartData = await cartResponse.json();

      if (!cartData || cartData.length === 0) {
        setCartItems([]);
        setIsLoading(false);
        return;
      }

      const itemsWithDetails = await Promise.all(
        cartData.flatMap((cartItem) =>
          cartItem.productId.map(async (product) => {
            const productResponse = await fetch(`http://localhost:9999/products?id=${product.idProduct}`);
            if (!productResponse.ok) return null;
            const productData = await productResponse.json();
            const productInfo = Array.isArray(productData) ? productData[0] : productData;
            return {
              ...productInfo,
              quantity: parseInt(product.quantity),
              idProduct: product.idProduct,
              cartItemId: cartItem.id,
              availableStock: productInfo.quantity,
            };
          })
        )
      );

      const filteredItems = itemsWithDetails.filter((item) => item !== null);
      setCartItems(filteredItems);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setCartItems([]);
      setIsLoading(false);
    }
  };

  const removeFromCart = async (cartItemId, productId) => {
    try {
      const cartResponse = await fetch(`http://localhost:9999/shoppingCart/${cartItemId}`);
      const cartItem = await cartResponse.json();
      const productToRemove = cartItem.productId.find((p) => p.idProduct === productId);
      const quantityRemoved = parseInt(productToRemove.quantity);

      const updatedProducts = cartItem.productId.filter((p) => p.idProduct !== productId);

      if (updatedProducts.length === 0) {
        await fetch(`http://localhost:9999/shoppingCart/${cartItemId}`, { method: "DELETE" });
      } else {
        await fetch(`http://localhost:9999/shoppingCart/${cartItemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: updatedProducts }),
        });
      }

      const productResponse = await fetch(`http://localhost:9999/products?id=${productId}`);
      const productData = await productResponse.json();
      const productInfo = Array.isArray(productData) ? productData[0] : productData;
      const newStock = productInfo.quantity + quantityRemoved;

      await fetch(`http://localhost:9999/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newStock }),
      });

      await fetchCartItems();
    } catch (error) {
      console.error(error);
    }
  };

  const updateQuantity = async (cartItemId, productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const productResponse = await fetch(`http://localhost:9999/products?id=${productId}`);
      const productData = await productResponse.json();
      const productInfo = Array.isArray(productData) ? productData[0] : productData;
      const currentStock = productInfo.quantity;

      const cartResponse = await fetch(`http://localhost:9999/shoppingCart/${cartItemId}`);
      const cartItem = await cartResponse.json();
      const currentCartProduct = cartItem.productId.find((p) => p.idProduct === productId);
      const currentCartQty = parseInt(currentCartProduct.quantity);

      const quantityDifference = newQuantity - currentCartQty;
      const newStock = currentStock - quantityDifference;

      if (newStock < 0) {
        alert("Not enough stock");
        return;
      }

      const updatedProducts = cartItem.productId.map((p) =>
        p.idProduct === productId ? { ...p, quantity: newQuantity.toString() } : p
      );

      await fetch(`http://localhost:9999/shoppingCart/${cartItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: updatedProducts }),
      });

      await fetch(`http://localhost:9999/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newStock }),
      });

      await fetchCartItems();
    } catch (error) {
      console.error(error);
    }
  };

 // Coupon và Checkout liên quan
 const [couponList, setCouponList] = useState([]); 
 const [appliedCoupons, setAppliedCoupons] = useState([]); 

 const getCartTotal = () => { 
   return cartItems.reduce((sum, item) => sum + (item.price * item.quantity) / 100, 0);
 };

 const handleCheckout = () => { 
   if (!currentUser) {
     alert("Please login to checkout");
     navigate("/auth");
     return;
   }
   if (cartItems.length === 0) {
     alert("Cart is empty");
     return;
   }
   navigate("/checkout");
 };

 useEffect(() => {
   fetchCartItems();
 }, [currentUser]);

 useEffect(() => { 
   const fetchCoupons = async () => {
     try {
       const res = await fetch("http://localhost:9999/coupons");
       const data = await res.json();
       setCouponList(data);
     } catch (error) {
       console.error("Failed to fetch coupons:", error);
     }
   };
   fetchCoupons();
 }, []);

 const getTotalDiscount = () => { 
   let totalDiscount = 0;
   const now = new Date();

   appliedCoupons.forEach(coupon => {
     const start = new Date(coupon.startDate);
     const end = new Date(coupon.endDate);

     if (now >= start && now <= end) {
       if (coupon.ProductID) {
         const item = cartItems.find(item => item.id === coupon.ProductID);
         if (item) {
           totalDiscount += (item.price * item.quantity * coupon.discountpercent) / (100 * 100);
         }
       } else {
         const subtotal = getCartTotal() * 100;
         totalDiscount += (subtotal * coupon.discountpercent) / (100 * 100);
       }
     }
   });

   return totalDiscount;
 };

 const getCartTotalAfterDiscount = () => {
   const subtotal = getCartTotal();
   const discount = getTotalDiscount();
   return Math.max(0, subtotal - discount);
 };

 const handleApplyCoupon = (coupon) => {
   const now = new Date();
   const start = new Date(coupon.startDate);
   const end = new Date(coupon.endDate);

   if (!(now >= start && now <= end)) {
     alert("This coupon is not valid now.");
     return;
   }

   if (appliedCoupons.some(c => c.code === coupon.code)) {
     alert("Coupon already applied.");
     return;
   }

   if (appliedCoupons.length >= 2) {
     alert("Only 2 coupons allowed.");
     return;
   }

   setAppliedCoupons(prev => [...prev, coupon]);
 };

 const handleRemoveCoupon = (couponCode) => { 
   setAppliedCoupons(prev => prev.filter(c => c.code !== couponCode));
 };



  if (!currentUser) {
    return (
      <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
        <TopMenu />
        <MainHeader />
        <SubMenu />
        <div className="text-center py-20">
          Please{" "}
          <button onClick={() => navigate("/auth")} className="text-blue-500 hover:underline">
            login
          </button>{" "}
          to view your cart
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
      <div>
        <TopMenu />
        <MainHeader />
        <SubMenu />
      </div>

      <div className="max-w-[1200px] mx-auto mb-8 min-h-[300px]">
        <div className="text-2xl font-bold my-4">Shopping cart</div>
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {cartItems.length === 0 ? (
                <EmptyCart />
              ) : (
                <div className="space-y-4">
                  {cartItems.map((product) => (
                    <CartItem
                      key={`${product.cartItemId}-${product.idProduct}`}
                      product={product}
                      cartItemId={product.cartItemId}
                      onRemove={removeFromCart}
                      onUpdateQuantity={updateQuantity}
                      availableStock={product.availableStock}
                    />
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="md:col-span-1">
                <div className="bg-white p-4 border sticky top-4">
                  <button
                    onClick={handleCheckout}
                    className="flex items —center justify-center bg-blue-600 w-full text-white font-semibold p-3 rounded-full hover:bg-blue-700"
                  >
                    Go to checkout
                  </button>

                  <div className="flex items-center justify-between mt-4 text-sm mb-1">
                    <div>Items ({cartItems.length})</div>
                    <div>£{(getCartTotal()).toFixed(2)}</div>
                  </div>
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div>Shipping:</div>
                    <div>Free</div>
                  </div>

                  <div className="border-b border-gray-300" />

                  <div className="flex flex-col gap-6 mt-4 mb-6 text-base">
                    <div className="flex flex-col gap-6 mt-4 mb-6 text-base">
                      {/* Available Coupons */}
                      <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm mt-6">
                        <div className="text-blue-700 font-semibold mb-3 text-base">🎁 Available Coupons</div>
                        {couponList.length > 0 ? (
                          couponList.map((coupon) => {
                            const isApplied = appliedCoupons.some(c => c.code === coupon.code);
                            const now = new Date();
                            const start = new Date(coupon.startDate);
                            const end = new Date(coupon.endDate);
                            const isValid = now >= start && now <= end;

                            return (
                              <div
                                key={coupon.code}
                                className="flex flex-col gap-1 mb-3 bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-semibold text-gray-800">
                                    {coupon.code}
                                  </div>
                                  <button
                                    onClick={() => handleApplyCoupon(coupon)}
                                    disabled={isApplied || !isValid}
                                    className={`text-sm font-medium ${isApplied || !isValid ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:underline'
                                      }`}
                                  >
                                    {isApplied ? "Applied" : isValid ? "Apply" : "Expired"}
                                  </button>
                                </div>
                                <div className="text-xs text-gray-600">
                                  {coupon.discountpercent}% off
                                  {coupon.ProductID ? ` (specific product)` : ` (sitewide)`}
                                </div>
                                <div className="text-[11px] text-gray-400">
                                  Valid: {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-gray-500 text-sm">No coupons available.</div>
                        )}
                      </div>


                      {/* Applied Coupons */}
                      {appliedCoupons.length > 0 && (
                        <div className="w-full bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm mt-6">
                          <h2 className="text-green-700 font-semibold text-base mb-4">🧾 Applied Coupons</h2>

                          {appliedCoupons.map((coupon) => (
                            <div
                              key={coupon.code}
                              className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-4 mb-3 rounded-lg border border-gray-200 shadow-sm"
                            >
                              <div>
                                <div className="font-semibold text-gray-800 text-sm">
                                  {coupon.code} - {coupon.discountpercent}% OFF
                                </div>
                                <div className="text-gray-500 text-xs mt-1">
                                  Valid until: {new Date(coupon.endDate).toLocaleDateString()}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveCoupon(coupon.code)}
                                className="text-red-500 hover:underline text-sm mt-2 md:mt-0"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>


                    {/* Subtotal */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl border text-sm text-gray-700">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span>£{getCartTotal().toFixed(2)}</span> {/* Tổng tiền giỏ hàng */}
                      </div>

                      {appliedCoupons.length > 0 && (
                        <div className="flex justify-between mb-2 text-green-600">
                          <span>Discount:</span>
                          <span>-£{getTotalDiscount().toFixed(2)}</span> {/* Tổng giảm giá */}
                        </div>
                      )}

                      <div className="border-t pt-2 flex justify-between font-semibold text-base">
                        <span>Total:</span>
                        <span>£{getCartTotalAfterDiscount().toFixed(2)}</span> {/* Tổng thanh toán sau giảm giá */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-12">
          <SimilarProducts />
        </div>
      </div>
      <Footer />
    </div>
  );
}