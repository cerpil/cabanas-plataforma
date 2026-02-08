'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ConfiguracoesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/calendar/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.status === 'success') {
        setResult(data.stats);
        toast.success('Arquivo processado com sucesso!');
      } else {
        toast.error('Erro ao processar arquivo.');
      }
    } catch (error) {
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Configurações e Integrações</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">Gerencie a sincronização de dados externos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Importar CSV do Airbnb">
          <div className="space-y-4">
            <p className="text-xs text-stone-500 leading-relaxed">
              Suba o relatório de reservas ou ganhos do Airbnb para atualizar os nomes dos hóspedes e valores financeiros que foram importados via iCal.
            </p>
            
            <div className="border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-stone-50/50 dark:bg-stone-900/50">
              <Upload className="text-stone-300" size={48} />
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                className="hidden" 
                id="csv-upload"
              />
              <label 
                htmlFor="csv-upload" 
                className="cursor-pointer bg-white dark:bg-stone-800 px-4 py-2 rounded-lg border border-stone-200 dark:border-stone-700 font-bold text-sm hover:bg-stone-50 transition-colors"
              >
                {file ? file.name : 'Selecionar Arquivo CSV'}
              </label>
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
              className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900"
              isLoading={uploading}
            >
              Processar e Sincronizar Dados
            </Button>

            {result && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-sm">
                  <CheckCircle2 size={16} />
                  Resultado do Processamento
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="text-stone-600 dark:text-stone-400">Reservas Atualizadas: <span className="font-bold text-green-600">{result.atualizados}</span></div>
                  <div className="text-stone-600 dark:text-stone-400">Não encontradas no iCal: <span className="font-bold text-stone-500">{result.ignorados}</span></div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title="Links de Sincronização (iCal)">
          <div className="space-y-4">
            <p className="text-xs text-stone-500">Links para você cadastrar no painel "Importar Calendário" do Airbnb:</p>
            <div className="space-y-3">
              {[
                { name: 'Cabana na Mata', url: 'http://localhost:8000/calendar/1.ics' },
                { name: 'Cabana sobre a Mata', url: 'http://localhost:8000/calendar/2.ics' },
                { name: 'Cabana Hobbit', url: 'http://localhost:8000/calendar/3.ics' },
              ].map(item => (
                <div key={item.name} className="p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{item.name}</p>
                  <code className="text-[10px] text-stone-600 dark:text-stone-300 break-all">{item.url}</code>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
