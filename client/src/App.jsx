import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import CategoryBrowse from './pages/CategoryBrowse'
import ProductDetails from './pages/ProductDetails'
import Login from './pages/Login'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import NotFound from './pages/NotFound'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminUserDetail from './pages/admin/AdminUserDetail'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminEvents from './pages/admin/AdminEvents'
import AdminCategories from './pages/admin/AdminCategories'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop/:categorySlug" element={<CategoryBrowse />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:id" element={<OrderConfirmation />} />
        <Route path="/404" element={<NotFound />} />
      </Route>

      <Route path="/admin/*" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="events" element={<AdminEvents />} />
      </Route>

      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
