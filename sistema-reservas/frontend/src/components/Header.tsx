'use client';

import React from 'react';
import { Bell, Search, User, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

export const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-8 flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
      <div className="flex items-center gap-4 bg-stone-50 dark:bg-stone-800 px-4 py-2 rounded-full border border-stone-100 dark:border-stone-700 w-96">
        <Search size={18} className="text-stone-400" />
        <input 
          type="text" 
          placeholder="Buscar reserva ou cliente..." 
          className="bg-transparent border-none focus:outline-none text-sm w-full dark:text-stone-200"
        />
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={toggleTheme}
          className="p-2 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button className="relative text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white transition-colors">
          <Bell size={22} />
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-stone-200 dark:border-stone-800">
          <div className="text-right">
            <p className="text-sm font-bold text-stone-800 dark:text-stone-100">{user?.full_name || 'Usuário'}</p>
            <p className="text-[10px] text-stone-500 uppercase font-black">Administrador</p>
          </div>
          <button 
            onClick={logout}
            className="w-10 h-10 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 rounded-full flex items-center justify-center transition-colors"
            title="Sair do sistema"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
