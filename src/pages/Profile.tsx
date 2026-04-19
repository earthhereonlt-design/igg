import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    // Add theme toggle logic if needed, Apple/Nike theme follows system by default 
    // but can be forced here
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-6 md:p-12 max-w-3xl mx-auto space-y-8 pt-8"
    >
      <header>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Profile</h1>
      </header>

      <section className="glass-card p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF6600] to-[#2997FF] flex items-center justify-center text-white text-3xl font-bold">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{user?.username}</h2>
          <p className="text-[var(--text-sec)] flex items-center gap-2 mt-1">
            <User size={16} /> 
            {user?.isAdmin ? 'Administrator' : 'Student'}
          </p>
        </div>
      </section>

      <section className="glass-card p-2">
        <div className="p-4 flex items-center gap-4 hover:bg-[var(--border)] rounded-xl transition-colors cursor-pointer">
          <Settings className="text-[var(--text-sec)]" size={24} />
          <div className="flex-1">
            <h3 className="font-medium">Account Settings</h3>
          </div>
        </div>
        
        <div 
          onClick={handleLogout}
          className="p-4 flex items-center gap-4 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors cursor-pointer mt-1"
        >
          <LogOut size={24} />
          <div className="flex-1">
            <h3 className="font-medium">Sign Out</h3>
          </div>
        </div>
      </section>

    </motion.div>
  );
}
