import React, { useContext, useState } from 'react';
import { ProductContext } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart } = useContext(ProductContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // Create order
      const orderResponse = await fetch('http://localhost:9999/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total: total,
          status: 'pending',
          createdAt: new Date().toISOString()
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      // Create order items
      const order = await orderResponse.json();
      const orderItemsPromises = cart.map(item => 
        fetch('http://localhost:9999/orderItems', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }),
        })
      );

      await Promise.all(orderItemsPromises);

      // Clear cart
      cart.forEach(item => removeFromCart(item.id));
      
      // Redirect to success page
      navigate('/success');
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
      
      <div className="space-y-4">
        {cart.map(item => (
          <div key={item.id} className="flex items-center border rounded-lg p-4 gap-4">
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-24 h-24 object-cover rounded"
            />
            
            <div className="flex-grow">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-gray-600">Quantity: {item.quantity}</p>
              <p className="text-blue-600">${item.price * item.quantity}</p>
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
              className="text-red-500 hover:text-red-700"
              disabled={isProcessing}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-4">
        <div className="text-xl font-bold">
          Total: ${total.toFixed(2)}
        </div>
        
        <button
          className={`mt-4 px-6 py-3 rounded-lg ${
            isProcessing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
          onClick={handleCheckout}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
};

export default Cart;
