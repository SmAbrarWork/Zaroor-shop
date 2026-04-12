import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../utils/api'
import { formatCurrencyPKR } from '../../utils/dateUtils'

export default function AdminUserDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/admin/users/${id}`).then(({ data: res }) => {
      setData(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-sm text-white/50">Loading...</p>
  if (!data) return <p className="text-sm text-red-400">User not found</p>

  return (
    <div className="space-y-6">
      <Link to="/admin/users" className="text-xs text-white/40 hover:text-white/70">← Back to Users</Link>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-bold">{data.name}</h2>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <p><span className="text-white/40">Email:</span> {data.email}</p>
          <p><span className="text-white/40">Role:</span> {data.role}</p>
          <p><span className="text-white/40">Google ID:</span> {data.googleId || 'None'}</p>
          <p><span className="text-white/40">Joined:</span> {new Date(data.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-white/70">Cart ({data.cart.length} items)</h3>
        {data.cart.length === 0 ? (
          <p className="text-xs text-white/40">Empty cart</p>
        ) : (
          <div className="space-y-2">
            {data.cart.map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                <span className="font-medium">{item.product?.name ?? 'Deleted product'}</span>
                <span className="text-white/50">x{item.quantity}</span>
                <span className="ml-auto text-xs">{formatCurrencyPKR((item.product?.price ?? 0) * item.quantity)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-white/70">Orders ({data.orders.length})</h3>
        {data.orders.length === 0 ? (
          <p className="text-xs text-white/40">No orders</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-xs text-white/50">
                <tr>
                  <th className="px-4 py-2">Order ID</th>
                  <th className="px-4 py-2">Items</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr key={order._id} className="border-b border-white/5">
                    <td className="px-4 py-2 font-mono text-xs">{order._id.slice(-8)}</td>
                    <td className="px-4 py-2">{order.items.length}</td>
                    <td className="px-4 py-2">{formatCurrencyPKR(order.totalAmount)}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-white/10 text-white/60'
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-white/50">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
