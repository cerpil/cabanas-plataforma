'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesAPI } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ClienteForm } from '@/components/ClienteForm';
import { Cliente } from '@/types';
import { Search, UserPlus, Edit2, Trash2, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesAPI.listar,
  });

  const deleteMutation = useMutation({
    mutationFn: clientesAPI.deletar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente removido');
    },
    onError: () => toast.error('Não foi possível remover o cliente. Verifique se ele possui reservas.'),
  });

  const upsertMutation = useMutation({
    mutationFn: (data: any) => 
      editingCliente 
        ? clientesAPI.atualizar(editingCliente.id, data) 
        : clientesAPI.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setIsModalOpen(false);
      setEditingCliente(null);
      toast.success(editingCliente ? 'Dados atualizados' : 'Cliente cadastrado!');
    },
    onError: () => toast.error('Erro ao salvar dados do cliente.'),
  });

  const filteredClientes = clientes?.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefone.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Clientes</h2>
          <p className="text-stone-500 dark:text-stone-400">Gerencie o cadastro de hóspedes do sistema.</p>
        </div>
        <Button onClick={() => { setEditingCliente(null); setIsModalOpen(true); }} className="gap-2">
          <UserPlus size={18} />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou e-mail..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all text-sm dark:text-stone-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800 text-stone-400 dark:text-stone-500 text-xs font-black uppercase tracking-widest">
                <th className="py-4 px-4">Nome</th>
                <th className="py-4 px-4">Contato</th>
                <th className="py-4 px-4">E-mail</th>
                <th className="py-4 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredClientes && filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="border-b border-stone-50 dark:border-stone-800/50 hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors group">
                    <td className="py-4 px-4 font-bold text-stone-800 dark:text-stone-100">{cliente.nome}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                        <Phone size={14} className="text-stone-400 dark:text-stone-500" />
                        {cliente.telefone}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-stone-600 dark:text-stone-300">
                      {cliente.email ? (
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-stone-400 dark:text-stone-500" />
                          {cliente.email}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingCliente(cliente); setIsModalOpen(true); }}
                          className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg text-stone-600 dark:text-stone-400 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => { if(confirm('Excluir cliente?')) deleteMutation.mutate(cliente.id); }}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-stone-400 dark:text-stone-600 italic">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCliente ? "Editar Cliente" : "Cadastrar Novo Cliente"}
      >
        <ClienteForm 
          initialData={editingCliente || undefined}
          onSubmit={(data) => upsertMutation.mutate(data)}
          isLoading={upsertMutation.isPending}
        />
      </Modal>
    </div>
  );
}
