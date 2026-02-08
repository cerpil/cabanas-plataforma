'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calendar, 
  Users, 
  Home, 
  MessageSquare, 
  LayoutDashboard,
  Settings,
  ShieldCheck,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendário', href: '/calendario', icon: Calendar },
  { name: 'Reservas', href: '/reservas', icon: Home },
  { name: 'Conteúdo', href: '/cabanas', icon: ImageIcon },
  { name: 'Tarifas', href: '/tarifas', icon: TrendingUp },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart2 },
  { name: 'Mensagens', href: '/mensagens', icon: MessageSquare },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-stone-900 text-stone-300 h-screen sticky top-0 flex flex-col shadow-xl`}>
      <div className={`p-6 border-b border-stone-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="w-10 h-10 overflow-hidden rounded-lg flex items-center justify-center shrink-0">
              <img 
                src="/assets/branding/logo-sidebar.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            Cabanas
          </h1>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 overflow-hidden rounded-lg flex items-center justify-center shrink-0">
            <img 
              src="/assets/branding/logo-sidebar.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      <div className="px-4 py-2">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <div className="flex items-center gap-2"><ChevronLeft size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Recolher Menu</span></div>}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              title={isCollapsed ? item.name : ''}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-stone-800 text-white shadow-inner' 
                  : 'hover:bg-stone-800/50 hover:text-white'
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}

        {/* Menu Administrativo */}
        {user?.username === 'admin' && (
          <div className={`pt-4 mt-4 border-t border-stone-800 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
            {!isCollapsed && <p className="px-4 text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">Administração</p>}
            <Link 
              href="/usuarios"
              title={isCollapsed ? 'Equipe' : ''}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-all duration-200 ${
                pathname === '/usuarios' 
                  ? 'bg-stone-800 text-white shadow-inner' 
                  : 'hover:bg-stone-800/50 hover:text-white'
              }`}
            >
              <ShieldCheck size={20} className="shrink-0" />
              {!isCollapsed && <span className="font-medium whitespace-nowrap">Equipe</span>}
            </Link>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-stone-800">
        <Link 
          href="/configuracoes"
          title={isCollapsed ? 'Configurações' : ''}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg hover:bg-stone-800 text-stone-500 hover:text-white transition-all`}
        >
          <Settings size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-medium whitespace-nowrap">Configurações</span>}
        </Link>
      </div>
    </aside>
  );
};
