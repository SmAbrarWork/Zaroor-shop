import { configureStore } from '@reduxjs/toolkit'
import eventReducer from '../features/event/eventSlice'
import productsReducer from '../features/products/productSlice'
import authReducer from '../features/auth/authSlice'
import cartReducer from '../features/cart/cartSlice'

export const store = configureStore({
  reducer: {
    event: eventReducer,
    products: productsReducer,
    auth: authReducer,
    cart: cartReducer,
  },
})
