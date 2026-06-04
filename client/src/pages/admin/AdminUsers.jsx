import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { ADMIN_INPUT, ADMIN_SELECT } from '../../utils/adminClasses.js'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminTableWrap from '../../components/admin/AdminTableWrap.jsx'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })

  const fetchUsers = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 100 })
    if (search) params.set('search', search)
    api.get(`/admin/users?${params}`).then(({ data }) => {
      setUsers(data.data)
      setPagination(data.pagination)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [page, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleRoleChange = async (userId, role) => {
    await api.put(`/admin/users/${userId}/role`, { role })
    fetchUsers()
  }

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user?')) return
    await api.delete(`/admin/users/${userId}`)
    fetchUsers()
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Users" count={pagination.total}>
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search by name or email..."
          className={`${ADMIN_INPUT} w-full sm:max-w-xs`}
        />
      </AdminPageHeader>

      {loading ? (
        <p className="text-sm text-white/50">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-white/40">No users found</p>
      ) : (
        <AdminTableWrap>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs text-white/50">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Auth</th>
                <th className="px-4 py-2">Joined</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-white/5">
                  <td className="px-4 py-2">
                    <Link to={`/admin/users/${u._id}`} className="text-blue-400 hover:underline">{u.name}</Link>
                  </td>
                  <td className="px-4 py-2 text-white/60">{u.email}</td>
                  <td className="px-4 py-2">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className={`${ADMIN_SELECT} !min-h-0 rounded-md px-2 py-1 text-xs`}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-xs text-white/50">{u.googleId ? 'Google' : 'Email'}</td>
                  <td className="px-4 py-2 text-xs text-white/50">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleDelete(u._id)} className="text-xs text-red-400 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableWrap>
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
          <span className="text-xs text-white/50">
            Page {page} of {pagination.pages}
          </span>
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
