import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { formatCurrencyPKR } from '../../utils/dateUtils'
import { orderStatusColor } from '../../utils/adminStatus.js'
import { ADMIN_STAT_CARD } from '../../utils/adminClasses.js'
import AdminTableWrap from '../../components/admin/AdminTableWrap.jsx'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => {
      setStats(data.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-white/50">Loading...</p>
  if (!stats) return <p className="text-sm text-red-400">Failed to load stats</p>

  const cards = [
    { label: 'Registered Users', value: stats.users, link: '/admin/users' },
    { label: 'Total Products', value: stats.products, link: '/admin/products' },
    { label: 'Total Orders', value: stats.orders, link: '/admin/orders' },
    { label: 'Active Events', value: stats.events, link: '/admin/events' },
    { label: 'Total Revenue', value: formatCurrencyPKR(stats.revenue) },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold sm:text-xl">Overview</h2>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => {
          const inner = (
            <div className={ADMIN_STAT_CARD}>
              <p className="text-[11px] text-white/50 sm:text-xs">{card.label}</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">{card.value}</p>
            </div>
          )
          return card.link
            ? <Link key={card.label} to={card.link}>{inner}</Link>
            : <div key={card.label}>{inner}</div>
        })}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white/70">Recent Orders</h3>
          <Link to="/admin/orders" className="shrink-0 text-xs text-sky-400 hover:underline">View All</Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="text-xs text-white/40">No orders yet</p>
        ) : (
          <>
            <div className="space-y-2 md:hidden">
              {stats.recentOrders.map((order) => (
                <div key={order._id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-white/45">#{order._id.slice(-8)}</p>
                      <p className="mt-0.5 truncate text-sm font-medium">
                        {order.user ? (
                          <Link to={`/admin/users/${order.user._id}`} className="text-sky-400 hover:underline">
                            {order.user.name}
                          </Link>
                        ) : 'Unknown'}
                      </p>
                      <p className="truncate text-xs text-white/45">{order.user?.email ?? '-'}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] capitalize ${orderStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/55">
                    <span className="font-medium text-white">{formatCurrencyPKR(order.totalAmount)}</span>
                    <span>Qty {order.items.reduce((sum, i) => sum + i.quantity, 0)}</span>
                    <span className="truncate">{order.items.map((i) => i.name).join(', ')}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-white/35">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="hidden md:block">
              <AdminTableWrap>
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/5 text-xs text-white/50">
                    <tr>
                      <th className="px-3 py-2">Order ID</th>
                      <th className="px-3 py-2">Customer</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Products</th>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2">Total</th>
                      <th className="px-3 py-2">Ship To</th>
                      <th className="px-3 py-2">Phone</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order._id} className="border-b border-white/5">
                        <td className="px-3 py-2 font-mono text-xs">{order._id.slice(-8)}</td>
                        <td className="px-3 py-2">
                          {order.user ? (
                            <Link to={`/admin/users/${order.user._id}`} className="text-sky-400 hover:underline">
                              {order.user.name}
                            </Link>
                          ) : 'Unknown'}
                        </td>
                        <td className="px-3 py-2 text-xs text-white/50">{order.user?.email ?? '-'}</td>
                        <td className="px-3 py-2 text-xs">
                          {order.items.map((i) => i.name).join(', ')}
                        </td>
                        <td className="px-3 py-2 text-center text-xs">
                          {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 font-medium">{formatCurrencyPKR(order.totalAmount)}</td>
                        <td className="px-3 py-2 text-xs text-white/50">
                          {order.shippingAddress ? `${order.shippingAddress.fullName}, ${order.shippingAddress.city}` : '-'}
                        </td>
                        <td className="px-3 py-2 text-xs text-white/50">{order.shippingAddress?.phone ?? '-'}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${orderStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-xs text-white/50">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminTableWrap>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
