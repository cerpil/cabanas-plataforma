'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cabanasAPI } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Image as ImageIcon, Settings, Info, ListChecks, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function CabanasGestaoPage() {
  const queryClient = useQueryClient();
  const { data: cabanas, isLoading } = useQuery({
    queryKey: ['cabanas'],
    queryFn: cabanasAPI.listar,
  });

  const updateCabanaMutation = useMutation({
    mutationFn: (data: any) => axios.put(`http://localhost:8000/api/cabanas/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabanas'] });
      toast.success('Conteúdo atualizado com sucesso!');
    },
    onError: () => toast.error('Erro ao salvar alterações.'),
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 font-serif">Gestão de Conteúdo</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">Edite as informações que aparecem para os clientes na Landing Page.</p>
      </div>

      <div className="space-y-12">
        {cabanas?.map((cabana) => (
          <CabanaEditor 
            key={cabana.id} 
            cabana={cabana} 
            onSave={(data) => updateCabanaMutation.mutate({ ...data, id: cabana.id })}
            isSaving={updateCabanaMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}

function CabanaEditor({ cabana, onSave, isSaving }: { cabana: any, onSave: (data: any) => void, isSaving: boolean }) {
  const [formData, setFormData] = useState({
    nome: cabana.nome,
    numero: cabana.numero,
    descricao: cabana.descricao || '',
    full_description: cabana.full_description || '',
    amenities: cabana.amenities || '',
    galeria_urls: cabana.galeria_urls || '',
    capacidade: cabana.capacidade,
    preco_base_semana: cabana.preco_base_semana,
    preco_base_fds: cabana.preco_base_fds,
    imagem_url: cabana.imagem_url || ''
  });

  return (
    <Card className="border-stone-200 dark:border-stone-800">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Básica */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-400">
              <Settings size={20} />
            </div>
            <h3 className="font-bold text-xl text-stone-900 dark:text-stone-100">{cabana.nome}</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Título Curto (Card)</label>
              <input 
                value={formData.nome} 
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Resumo (Max 150 caracteres)</label>
              <textarea 
                value={formData.descricao} 
                onChange={e => setFormData({...formData, descricao: e.target.value})}
                className="w-full p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm h-24"
              />
            </div>
          </div>
        </div>

        {/* Descrição Longa e Amenidades */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                <Info size={14} /> Descrição Detalhada (Modal)
              </label>
              <textarea 
                value={formData.full_description} 
                onChange={e => setFormData({...formData, full_description: e.target.value})}
                className="w-full p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm h-40 leading-relaxed"
                placeholder="Descreva a experiência completa, banheiras, vistas..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                <ListChecks size={14} /> Comodidades (Separadas por vírgula)
              </label>
              <input 
                value={formData.amenities} 
                onChange={e => setFormData({...formData, amenities: e.target.value})}
                className="w-full p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm"
                placeholder="Ex: Ar Condicionado, Wi-fi, Banheira, Ofurô..."
              />
            </div>
          </div>
        </div>

        {/* Galeria de Fotos */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                <ImageIcon size={14} /> URLs das Fotos (Separadas por vírgula)
              </label>
              <textarea 
                value={formData.galeria_urls} 
                onChange={e => setFormData({...formData, galeria_urls: e.target.value})}
                className="w-full p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm h-40 font-mono"
                placeholder="/assets/cabanas/foto1.png, /assets/cabanas/foto2.png"
              />
            </div>
          </div>

          <Button 
            onClick={() => onSave(formData)} 
            isLoading={isSaving}
            className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 h-12"
          >
            <Save size={18} className="mr-2" /> Salvar Conteúdo da {cabana.nome}
          </Button>
        </div>
      </div>
    </Card>
  );
}