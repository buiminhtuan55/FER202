import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import SimilarProducts from "../../components/SimilarProducts"
import Footer from "../../layouts/includes/Footer"
import SubMenu from "../../layouts/includes/SubMenu"
import MainHeader from "../../layouts/includes/MainHeader"
import TopMenu from "../../layouts/includes/TopMenu"

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isItemAdded, setIsItemAdded] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // Kiểm tra sản phẩm có trong giỏ hàng không
  const checkItemInCart = async () => {
    if (!currentUser) return false;
    try {
      const response = await fetch(`http://localhost:9999/shoppingCart?userId=${currentUser.id}`);
      const cartData = await response.json();
      const cartWithProduct = cartData.find(cart => 
        cart.productId.some(p => p.idProduct === id)
      );
      return !!cartWithProduct;
    } catch (error) {
      console.error('Error checking cart:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchProductAndCartStatus = async () => {
      try {
        // Fetch product
        const response = await fetch(`http://localhost:9999/products?id=${id}`);
        const data = await response.json();
        if (data && data[0]) {
          setProduct(data[0]);
        }
        
        // Check if item is in cart
        const inCart = await checkItemInCart();
        setIsItemAdded(inCart);
      } catch (error) {
        console.error('Error:', error);
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
      // Fetch current cart for the user
      const cartResponse = await fetch(`http://localhost:9999/shoppingCart?userId=${currentUser.id}`);
      const cartData = await cartResponse.json();

      if (isItemAdded) {
        // Remove from cart
        const cartWithProduct = cartData.find(cart => 
          cart.productId.some(p => p.idProduct === id)
        );
        
        if (cartWithProduct) {
          const updatedProducts = cartWithProduct.productId.filter(p => p.idProduct !== id);
          
          if (updatedProducts.length === 0) {
            // Delete cart if no products left
            await fetch(`http://localhost:9999/shoppingCart/${cartWithProduct.id}`, {
              method: 'DELETE'
            });
          } else {
            // Update cart with remaining products
            await fetch(`http://localhost:9999/shoppingCart/${cartWithProduct.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                productId: updatedProducts
              })
            });
          }
          setIsItemAdded(false);
        }
      } else {
        // Add to cart
        if (cartData.length > 0) {
          // Update existing cart
          const cartItem = cartData[0]; // Assuming one cart per user
          const existingProduct = cartItem.productId.find(p => p.idProduct === id);

          if (existingProduct) {
            // Increase quantity if product exists
            const updatedProducts = cartItem.productId.map(p =>
              p.idProduct === id 
                ? { ...p, quantity: (parseInt(p.quantity) + 1).toString() }
                : p
            );
            
            await fetch(`http://localhost:9999/shoppingCart/${cartItem.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                productId: updatedProducts
              })
            });
          } else {
            // Add new product to existing cart
            await fetch(`http://localhost:9999/shoppingCart/${cartItem.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                productId: [...cartItem.productId, { idProduct: id, quantity: "1" }]
              })
            });
          }
        } else {
          // Create new cart
          await fetch('http://localhost:9999/shoppingCart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: currentUser.id,
              productId: [{ idProduct: id, quantity: "1" }],
              dateAdded: new Date().toISOString()
            })
          });
        }
        setIsItemAdded(true);
      }
    } catch (error) {
      console.error('Error managing cart:', error);
      alert('Failed to update cart');
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
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center">
                  Price:
                  {product?.price ? (
                    <div className="font-bold text-[20px] ml-2">
                      GBP £{(product.price / 100).toFixed(2)}
                    </div>
                  ) : null}
                </div>

                {product.status === 'available' ? (
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
            </div>

            <div className="border-b py-1" />

            <div className="pt-3">
              <div className="font-semibold pb-1">Description:</div>
              <div className="text-sm">{product.description}</div>
            </div>

            {!currentUser && (
              <div className="mt-4 text-sm text-gray-500">
                Please <button onClick={() => navigate('/auth')} className="text-blue-500 hover:underline">login</button> to add items to cart
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