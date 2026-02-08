'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosAPI } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, Shield, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsuariosPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: usuariosAPI.listar,
  });

  const createMutation = useMutation({
    mutationFn: usuariosAPI.criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setIsModalOpen(false);
      toast.success('Usuário criado com sucesso!');
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Erro ao criar usuário.'),
  });

  const deleteMutation = useMutation({
    mutationFn: usuariosAPI.deletar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuário removido.');
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Erro ao remover usuário.'),
  });

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    createMutation.mutate(data);
  };

  if (isLoading) return <Loading />;
  if (currentUser?.username !== 'admin') return <div className="p-8 text-center text-red-600 font-bold">Acesso negado. Apenas o administrador principal pode gerenciar usuários.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Equipe e Usuários</h2>
          <p className="text-stone-500">Gerencie quem tem acesso ao painel administrativo.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <UserPlus size={18} />
          Novo Usuário
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuarios?.map((u) => (
          <Card key={u.id} className="relative group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${u.role === 'admin' ? 'bg-stone-800' : 'bg-green-600'}`}>
                  {u.role === 'admin' ? <Shield size={24} /> : <User size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-stone-800">{u.full_name}</h3>
                  <p className="text-xs text-stone-400">@{u.username}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                u.role === 'admin' ? 'bg-stone-100 text-stone-700' : 'bg-green-50 text-green-700'
              }`}>
                {u.role}
              </span>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-50 flex justify-between items-center">
              <span className={`text-[10px] font-bold ${u.is_active ? 'text-green-500' : 'text-red-500'}`}>
                ● {u.is_active ? 'ATIVO' : 'INATIVO'}
              </span>
              {u.username !== 'admin' && (
                <button 
                  onClick={() => { if(confirm('Remover acesso deste usuário?')) deleteMutation.mutate(u.id); }}
                  className="p-2 text-stone-300 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Novo Funcionário">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input name="full_name" label="Nome Completo" placeholder="Ex: Maria Oliveira" required />
          <Input name="username" label="Nome de Usuário" placeholder="maria.oliveira" required />
          <Input name="password" type="password" label="Senha Inicial" placeholder="••••••••" required />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">Cargo / Permissões</label>
            <select name="role" className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm">
              <option value="staff">Funcionário (Gestão de Reservas)</option>
              <option value="admin">Administrador (Controle Total)</option>
            </select>
          </div>
          <div className="pt-4">
            <Button type="submit" className="w-full" isLoading={createMutation.isPending}>
              Criar Acesso
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
