import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedOptions: {
      color: { type: String, default: '' },
      size: { type: String, default: '' },
      waistSize: { type: Number, default: null },
    },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered'],
      default: 'pending',
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['jazzcash', 'easypaisa', 'cod'],
      default: null,
    },
    /** Zone used to sum per-product shipping (see Product.shippingRates). */
    shippingDestination: { type: String, default: null },
    /** Total shipping in PKR for this order. */
    shippingAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
)

export const Order = mongoose.model('Order', orderSchema)
