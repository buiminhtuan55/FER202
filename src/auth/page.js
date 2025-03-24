import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import TopMenu from "../layouts/includes/TopMenu"
import MainHeader from "../layouts/includes/MainHeader"
import SubMenu from "../layouts/includes/SubMenu"
import SimilarProducts from "../components/SimilarProducts"
import Footer from "../layouts/includes/Footer"

function EmptyCart() {
  const navigate = useNavigate()

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
  )
}

function CartItem({ product, cartItemId, onRemove, onUpdateQuantity }) {
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
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      <button 
        onClick={() => onRemove(cartItemId, product.idProduct)} 
        className="text-blue-500 hover:text-blue-700"
      >
        Remove
      </button>
    </div>
  )
}

export default function Cart() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  const fetchCartItems = async () => {
    if (!currentUser) {
      setIsLoading(false)
      return
    }
    
    try {
      const cartResponse = await fetch(`http://localhost:9999/shoppingCart?userId=${currentUser.id}`)
      const cartData = await cartResponse.json()

      // Flatten the cart items and fetch product details
      const itemsWithDetails = await Promise.all(
        cartData.flatMap(cartItem => 
          cartItem.productId.map(async (product) => {
            const productResponse = await fetch(`http://localhost:9999/products?id=${product.idProduct}`)
            const productData = await productResponse.json()
            return {
              ...productData[0],
              quantity: parseInt(product.quantity),
              idProduct: product.idProduct,
              cartItemId: cartItem.id
            }
          })
        )
      )

      setCartItems(itemsWithDetails)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching cart:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCartItems()
  }, [currentUser])

  const removeFromCart = async (cartItemId, productId) => {
    try {
      // Get current cart item
      const cartResponse = await fetch(`http://localhost:9999/shoppingCart/${cartItemId}`)
      const cartItem = await cartResponse.json()
      
      // Filter out the product to remove
      const updatedProducts = cartItem.productId.filter(p => p.idProduct !== productId)
      
      if (updatedProducts.length === 0) {
        // If no products left, delete the cart item
        await fetch(`http://localhost:9999/shoppingCart/${cartItemId}`, {
          method: 'DELETE'
        })
      } else {
        // Update the cart item with remaining products
        await fetch(`http://localhost:9999/shoppingCart/${cartItemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId: updatedProducts
          })
        })
      }
      
      await fetchCartItems()
    } catch (error) {
      console.error('Error removing item:', error)
      alert('Failed to remove item from cart')
    }
  }

  const updateQuantity = async (cartItemId, productId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      // Get current cart item
      const cartResponse = await fetch(`http://localhost:9999/shoppingCart/${cartItemId}`)
      const cartItem = await cartResponse.json()
      
      // Update quantity for specific product
      const updatedProducts = cartItem.productId.map(p => 
        p.idProduct === productId ? { ...p, quantity: newQuantity.toString() } : p
      )

      const response = await fetch(`http://localhost:9999/shoppingCart/${cartItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: updatedProducts
        })
      })
      
      if (response.ok) {
        await fetchCartItems()
      } else {
        throw new Error('Failed to update quantity')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      alert('Failed to update quantity')
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = () => {
    if (!currentUser) {
      alert("Please login to checkout")
      navigate("/auth")
      return
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty!")
      return
    }
    navigate("/checkout")
  }

  if (!currentUser) {
    return (
      <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
        <div>
          <TopMenu />
          <MainHeader />
          <SubMenu />
        </div>
        <div className="text-center py-20">
          Please <button onClick={() => navigate('/auth')} className="text-blue-500 hover:underline">login</button> to view your cart
        </div>
        <Footer />
      </div>
    )
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
                    className="flex items-center justify-center bg-blue-600 w-full text-white font-semibold p-3 rounded-full hover:bg-blue-700"
                  >
                    Go to checkout
                  </button>

                  <div className="flex items-center justify-between mt-4 text-sm mb-1">
                    <div>Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</div>
                    <div>£{(getCartTotal() / 100).toFixed(2)}</div>
                  </div>
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div>Shipping:</div>
                    <div>Free</div>
                  </div>

                  <div className="border-b border-gray-300" />

                  <div className="flex items-center justify-between mt-4 mb-1 text-lg font-semibold">
                    <div>Subtotal</div>
                    <div>£{(getCartTotal() / 100).toFixed(2)}</div>
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
  )
}