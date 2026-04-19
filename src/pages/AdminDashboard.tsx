import { useState, useEffect } from 'react';
import { fetchAPI } from '../lib/api';
import { motion } from 'framer-motion';
import { Users, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/admin/users')
      .then(data => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading admin data...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-6 md:p-12 max-w-7xl mx-auto space-y-8 pt-8"
    >
      <header>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Admin Center</h1>
        <p className="text-[var(--text-sec)] flex items-center gap-2">
          <AlertCircle size={16} /> Restricted Access
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="glass-card p-6 flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 text-blue-500 rounded-full">
            <Users size={32} />
          </div>
          <div>
            <p className="text-[var(--text-sec)] text-sm font-medium uppercase tracking-wider">Total Users</p>
            <h2 className="text-3xl font-bold">{users.length}</h2>
          </div>
        </section>
      </div>

      <section className="glass-card overflow-hidden">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold">User Directory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--border)] text-[var(--text-sec)] text-sm">
                <th className="p-4 font-medium">Username</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--border)]/50 transition-colors">
                  <td className="p-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF6600]/20 to-[#2997FF]/20 flex items-center justify-center text-sm font-bold">
                        {u.username[0].toUpperCase()}
                      </div>
                      {u.username}
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-sec)]">
                    {u.is_admin ? (
                      <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs font-medium uppercase tracking-wider">Admin</span>
                    ) : 'User'}
                  </td>
                  <td className="p-4 text-[var(--text-sec)]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </motion.div>
  );
}
