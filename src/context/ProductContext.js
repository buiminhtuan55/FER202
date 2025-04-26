import React, { createContext, useState, useEffect } from 'react';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  useEffect(() => {
    fetchData();
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const fetchData = async () => {
    try {
      // Updated endpoints to match your database structure
      const [
        productsData,
        categoriesData,
        usersData,
        ordersData,
        cartData
      ] = await Promise.all([
        fetch('http://localhost:9999/products').then(res => res.json()),
        fetch('http://localhost:9999/categories').then(res => res.json()),
        fetch('http://localhost:9999/users').then(res => res.json()),
        fetch('http://localhost:9999/orders').then(res => res.json()),
        fetch('http://localhost:9999/shoppingCart').then(res => res.json())
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    try {
      // Add to shopping cart in the database
      const response = await fetch('http://localhost:9999/shoppingCart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          // Add any other required fields for your shopping cart
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      const updatedCart = [...cart];
      const existingItem = updatedCart.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        updatedCart.push({ ...product, quantity: 1 });
      }
      
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      // Remove from shopping cart in the database
      const response = await fetch(`http://localhost:9999/shoppingCart/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from cart');
      }

      const updatedCart = cart.filter(item => item.id !== productId);
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    return (
      (!filters.category || product.categoryId === filters.category) &&
      (!filters.minPrice || product.price >= Number(filters.minPrice)) &&
      (!filters.maxPrice || product.price <= Number(filters.maxPrice)) &&
      (!filters.search || product.title.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  return (
    <ProductContext.Provider value={{
      products: filteredProducts,
      categories,
      cart,
      loading,
      filters,
      setFilters,
      addToCart,
      removeFromCart
    }}>
      {children}
    </ProductContext.Provider>
  );
};
