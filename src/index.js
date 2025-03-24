import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProductDetail from './product/[id]/page';
import Cart from './cart/page';
import Checkout from './checkout/page';
import Success from './success/page';
import Orders from './orders/page';
import AuthPage from './auth/page';
import CategoryPage from './listCategory/page';
import ListCategory from './listCategory/page';
import Wishlist from './wishlist/page';
import Sell from './sell/page';
import SellerProducts from './sellerProduct/page';
import OrderHistory from './OrderHistory/page';
import { Search } from 'lucide-react';
import SearchResults from './SearchResults/SearchResults';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart/" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/list-category/:categoryId" element={<ListCategory />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/sellerProduct" element={<SellerProducts />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
