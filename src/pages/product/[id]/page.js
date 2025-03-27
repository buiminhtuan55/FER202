import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimilarProducts from "../../../components/SimilarProducts";
import Footer from "../../../components/Footer";
import TopMenu from "../../../components/TopMenu";
import MainHeader from "../../../components/MainHeader";
import SubMenu from "../../../components/SubMenu";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isItemAdded, setIsItemAdded] = useState(false);
  const [bidAmount, setBidAmount] = useState(""); // State để lưu giá trị bid nhập vào
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Kiểm tra sản phẩm có trong giỏ hàng không
  const checkItemInCart = async () => {
    if (!currentUser) return false;
    try {
      const response = await fetch(`http://localhost:9999/shoppingCart?userId=${currentUser.id}`);
      const cartData = await response.json();
      const cartWithProduct = cartData.find((cart) =>
        cart.productId.some((p) => p.idProduct === id)
      );
      return !!cartWithProduct;
    } catch (error) {
      console.error("Error checking cart:", error);
      return false;
    }
  };

  useEffect(() => {
    const fetchProductAndCartStatus = async () => {
      try {
        const response = await fetch(`http://localhost:9999/products?id=${id}`);
        const data = await response.json();
        if (data && data[0]) {
          setProduct(data[0]);
        }
        const inCart = await checkItemInCart();
        setIsItemAdded(inCart);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductAndCartStatus();
  }, [id, currentUser]);

  const handleCartAction = async () => {
    if (!currentUser) {
      alert("Please login to manage cart");
      navigate("/auth");
      return;
    }

    try {
      const cartResponse = await fetch(`http://localhost:9999/shoppingCart?userId=${currentUser.id}`);
      const cartData = await cartResponse.json();

      if (isItemAdded) {
        const cartWithProduct = cartData.find((cart) =>
          cart.productId.some((p) => p.idProduct === id)
        );

        if (cartWithProduct) {
          const updatedProducts = cartWithProduct.productId.filter((p) => p.idProduct !== id);

          if (updatedProducts.length === 0) {
            await fetch(`http://localhost:9999/shoppingCart/${cartWithProduct.id}`, {
              method: "DELETE",
            });
          } else {
            await fetch(`http://localhost:9999/shoppingCart/${cartWithProduct.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productId: updatedProducts,
              }),
            });
          }
          setIsItemAdded(false);
        }
      } else {
        if (cartData.length > 0) {
          const cartItem = cartData[0];
          const existingProduct = cartItem.productId.find((p) => p.idProduct === id);

          if (existingProduct) {
            const updatedProducts = cartItem.productId.map((p) =>
              p.idProduct === id
                ? { ...p, quantity: (parseInt(p.quantity) + 1).toString() }
                : p
            );

            await fetch(`http://localhost:9999/shoppingCart/${cartItem.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productId: updatedProducts,
              }),
            });
          } else {
            await fetch(`http://localhost:9999/shoppingCart/${cartItem.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productId: [...cartItem.productId, { idProduct: id, quantity: "1" }],
              }),
            });
          }
        } else {
          await fetch("http://localhost:9999/shoppingCart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: currentUser.id,
              productId: [{ idProduct: id, quantity: "1" }],
              dateAdded: new Date().toISOString(),
            }),
          });
        }
        setIsItemAdded(true);
      }
    } catch (error) {
      console.error("Error managing cart:", error);
      alert("Failed to update cart");
    }
  };

  const handlePlaceBid = async () => {
    if (!currentUser) {
      alert("Please login to place a bid");
      navigate("/auth");
      return;
    }

    if (!bidAmount || isNaN(bidAmount) || bidAmount <= 0) {
      alert("Please enter a valid bid amount");
      return;
    }

    const bidInPennies = Math.round(parseFloat(bidAmount) * 100); // Chuyển từ GBP sang penny
    if (bidInPennies <= product.price) {
      alert(`Your bid must be higher than the current bid of £${(product.price / 100).toFixed(2)}`);
      return;
    }

    try {
      // Lấy danh sách bid hiện tại để kiểm tra giá cao nhất
      const bidsResponse = await fetch(`http://localhost:9999/auctionBids?productId=${id}`);
      const existingBids = await bidsResponse.json();
      
      // Tạo ID mới cho bid
      const newBidId = `bid${Date.now()}`;

      // Xác định isWinningBid
      const highestBid = existingBids.length > 0
        ? Math.max(...existingBids.map((bid) => bid.bidAmount))
        : product.price;
      const isWinning = bidInPennies > highestBid;

      // Tạo bản ghi bid mới
      const newBid = {
        id: newBidId,
        productId: id,
        userId: currentUser.id,
        bidAmount: bidInPennies,
        bidDate: new Date().toISOString(),
        isWinningBid: isWinning,
      };

      // Gửi bid mới tới API
      const response = await fetch("http://localhost:9999/auctionBids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBid),
      });

      if (!response.ok) {
        throw new Error("Failed to place bid");
      }

      // Nếu bid mới là cao nhất, cập nhật các bid khác
      if (isWinning && existingBids.length > 0) {
        const updatePromises = existingBids.map((bid) =>
          fetch(`http://localhost:9999/auctionBids/${bid.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ isWinningBid: false }),
          })
        );
        await Promise.all(updatePromises);
      }

      alert("Bid placed successfully!");
      setBidAmount(""); // Reset ô nhập
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Failed to place bid: " + error.message);
    }
  };

  if (isLoading) {
    return (
      <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
        <div>
          <TopMenu />
          <MainHeader />
          <SubMenu />
        </div>
        <div className="text-center py-20">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
        <div>
          <TopMenu />
          <MainHeader />
          <SubMenu />
        </div>
        <div className="text-center py-20">Product not found</div>
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
      <div className="max-w-[1200px] mx-auto">
        <div className="flex px-4 py-10">
          {product?.url ? (
            <img className="w-[40%] rounded-lg" src={`${product.url}/280`} alt={product.title} />
          ) : (
            <div className="w-[40%]"></div>
          )}

          <div className="px-4 w-full">
            <div className="font-bold text-xl">{product.title}</div>
            <div className="text-sm text-gray-700 pt-2">Brand New - Full Warranty</div>

            <div className="border-b py-1" />

            <div className="pt-3 pb-2">
              <div className="flex items-center">
                Condition: <span className="font-bold text-[17px] ml-2">New</span>
              </div>
            </div>

            <div className="border-b py-1" />

            <div className="pt-3">
              {product.isAuction === true ? (
                <div className="w-full flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      Current Bid:
                      <div className="font-bold text-[20px] ml-2">
                        GBP £{(product.price / 100).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Time Left: 2d 3h 45m</div>
                  </div>

                  {product.status === "available" ? (
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        step="0.01"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Enter bid (> £${(product.price / 100).toFixed(2)})`}
                        className="border p-2 rounded w-1/2"
                      />
                      <button
                        onClick={handlePlaceBid}
                        className="bg-[#3498C9] hover:bg-[#0054A0] text-white py-2 px-8 rounded-full cursor-pointer"
                      >
                        Place Bid
                      </button>
                    </div>
                  ) : (
                    <div className="text-red-500 font-semibold">Auction Ended</div>
                  )}

                  {product.status === "available" && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        Buy It Now:
                        <div className="font-bold text-[18px] ml-2">
                          GBP £{(product.price * 1.2 / 100).toFixed(2)}
                        </div>
                      </div>
                      <button
                        className="bg-[#e67e22] hover:bg-[#d35400] text-white py-2 px-8 rounded-full cursor-pointer"
                      >
                        Buy It Now
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center">
                    Price:
                    {product?.price ? (
                      <div className="font-bold text-[20px] ml-2">
                        GBP £{(product.price / 100).toFixed(2)}
                      </div>
                    ) : null}
                  </div>

                  {product.status === "available" ? (
                    <button
                      onClick={handleCartAction}
                      className={`
                        text-white py-2 px-20 rounded-full cursor-pointer
                        ${isItemAdded ? "bg-[#e9a321] hover:bg-[#bf851a]" : "bg-[#3498C9] hover:bg-[#0054A0]"}
                      `}
                    >
                      {isItemAdded ? "Remove From Cart" : "Add To Cart"}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="text-white py-2 px-20 rounded-full cursor-not-allowed bg-gray-400"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="border-b py-1" />

            <div className="pt-3">
              <div className="font-semibold pb-1">Description:</div>
              <div className="text-sm">{product.description}</div>
            </div>

            {!currentUser && (
              <div className="mt-4 text-sm text-gray-500">
                Please{" "}
                <button onClick={() => navigate("/auth")} className="text-blue-500 hover:underline">
                  login
                </button>{" "}
                to {product.isAuction === true ? "place a bid or buy" : "add items to cart"}
              </div>
            )}
          </div>
        </div>

        <SimilarProducts categoryId={product.categoryId} />
      </div>
      <Footer />
    </div>
  );
}