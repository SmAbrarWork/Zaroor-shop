import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { formatCurrencyPKR } from '../../utils/dateUtils'

const statusColor = (s) =>
  s === 'delivered' ? 'bg-green-500/20 text-green-400' :
  s === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
  s === 'confirmed' ? 'bg-yellow-500/20 text-yellow-400' :
  'bg-white/10 text-white/60'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })

  const fetchOrders = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 100 })
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    api.get(`/admin/orders?${params}`).then(({ data }) => {
      setOrders(data.data)
      setPagination(data.pagination)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [page, search, statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1) }
  const handleStatusFilter = (e) => { setStatusFilter(e.target.value); setPage(1) }

  const handleStatusChange = async (orderId, status) => {
    await api.put(`/admin/orders/${orderId}/status`, { status })
    fetchOrders()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Orders ({pagination.total})</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search name, email, phone, city..."
            className="w-64 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-white/30"
          />
          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-white/50">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-white/40">No orders found</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs text-white/50">
              <tr>
                <th className="px-3 py-2">Order ID</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Products Ordered</th>
                <th className="px-3 py-2">Total Qty</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Ship To</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <>
                  <tr
                    key={order._id}
                    className="cursor-pointer border-b border-white/5 hover:bg-white/5"
                    onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                  >
                    <td className="px-3 py-2 font-mono text-xs">{order._id.slice(-8)}</td>
                    <td className="px-3 py-2">
                      {order.user ? (
                        <Link
                          to={`/admin/users/${order.user._id}`}
                          className="text-blue-400 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {order.user.name}
                        </Link>
                      ) : 'Unknown'}
                    </td>
                    <td className="px-3 py-2 text-xs text-white/50">{order.user?.email ?? '-'}</td>
                    <td className="max-w-[200px] truncate px-3 py-2 text-xs">
                      {order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="px-3 py-2 text-center text-xs">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-medium">{formatCurrencyPKR(order.totalAmount)}</td>
                    <td className="px-3 py-2 text-xs text-white/50">
                      {order.shippingAddress ? `${order.shippingAddress.fullName}, ${order.shippingAddress.city}` : '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-white/50">{order.shippingAddress?.phone ?? '-'}</td>
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`rounded-full px-2 py-0.5 text-xs ${statusColor(order.status)}`}
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="shipped">shipped</option>
                        <option value="delivered">delivered</option>
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-white/50">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                  {expanded === order._id && (
                    <tr key={`${order._id}-detail`} className="border-b border-white/5">
                      <td colSpan={10} className="bg-white/[0.02] px-4 py-3">
                        <div className="mb-2 text-xs text-white/40">
                          Shipping: {order.shippingAddress?.fullName} | {order.shippingAddress?.address}, {order.shippingAddress?.city} | Phone: {order.shippingAddress?.phone}
                        </div>
                        <table className="w-full text-xs">
                          <thead className="text-white/40">
                            <tr>
                              <th className="py-1 text-left">Product</th>
                              <th className="py-1 text-right">Price</th>
                              <th className="py-1 text-right">Qty</th>
                              <th className="py-1 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, i) => (
                              <tr key={i} className="border-t border-white/5">
                                <td className="py-1">{item.name}</td>
                                <td className="py-1 text-right">{formatCurrencyPKR(item.price)}</td>
                                <td className="py-1 text-right">{item.quantity}</td>
                                <td className="py-1 text-right font-medium">{formatCurrencyPKR(item.price * item.quantity)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs disabled:opacity-30"
          >
            Prev
          </button>
          <span className="text-xs text-white/50">Page {page} of {pagination.pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
