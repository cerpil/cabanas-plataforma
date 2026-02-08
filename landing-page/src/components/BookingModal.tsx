'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import axios from 'axios';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCabana?: any;
}

// URL temporária para acesso externo via Serveo
const API_BASE_URL = 'https://7a66ca5f5bf0ad88-216-234-209-114.serveousercontent.com';

export default function BookingModal({ isOpen, onClose, initialCabana }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [cabanas, setCabanas] = useState<any[]>([]);
  const [selectedCabana, setSelectedCabana] = useState<any>(null);
  const [range, setRange] = useState<DateRange | undefined>();
  const [disabledDays, setDisabledDays] = useState<Date[]>([]);
  const [adultos, setAdultos] = useState(2);
  const [criancas, setCriancas] = useState(0);
  const [formData, setFormData] = useState({ nome: '', telefone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orcamento, setOrcamento] = useState<any>(null);

  // Reiniciar estado quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setAdultos(2);
      setCriancas(0);
      if (initialCabana) {
        setSelectedCabana(initialCabana);
        setStep(1.5);
      } else {
        setStep(1);
        setSelectedCabana(null);
      }
    }
  }, [isOpen, initialCabana]);

  // Garantir que os limites sejam respeitados ao trocar de cabana manualmente no Step 1
  useEffect(() => {
    if (selectedCabana) {
      const max = selectedCabana.id === 3 ? 5 : 2;
      if (adultos > max) setAdultos(max);
      if (selectedCabana.id !== 3) setCriancas(0);
    }
  }, [selectedCabana]);

  // Carregar cabanas
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      axios.get(`${API_BASE_URL}/api/cabanas`)
        .then(res => {
          setCabanas(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Erro ao carregar cabanas", err);
          setCabanas([
            { id: 1, nome: 'Cabana na Mata', descricao: 'Experiência intimista e silêncio absoluto.', preco_base_semana: 490, preco_base_fds: 690 },
            { id: 2, nome: 'Cabana sobre a Mata', descricao: 'Ofurô exclusivo com vista panorâmica.', preco_base_semana: 590, preco_base_fds: 890 },
            { id: 3, nome: 'Cabana Hobbit', descricao: 'Arquitetura moderna e conforto premium.', preco_base_semana: 550, preco_base_fds: 790 }
          ]);
          setLoading(false);
        });
    }
  }, [isOpen]);

  // Buscar datas ocupadas
  useEffect(() => {
    if (selectedCabana) {
      axios.get(`${API_BASE_URL}/api/public/ocupacao/${selectedCabana.id}`)
        .then(res => {
          const dates = res.data.map((d: string) => new Date(d + 'T12:00:00'));
          setDisabledDays(dates);
        })
        .catch(err => console.error("Erro ao carregar ocupação", err));
    }
  }, [selectedCabana]);

  // Calculadora de Preço
  useEffect(() => {
    const calcularPreco = async () => {
      if (selectedCabana && range?.from && range?.to) {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/public/calcular-preco`, {
            params: {
              cabana_id: selectedCabana.id,
              data_checkin: format(range.from, 'yyyy-MM-dd'),
              data_checkout: format(range.to, 'yyyy-MM-dd'),
              adultos: adultos,
              criancas: criancas
            }
          });
          setOrcamento(res.data);
        } catch (err) {
          console.error("Erro ao calcular orçamento");
        }
      }
    };
    calcularPreco();
  }, [selectedCabana?.id, range?.from, range?.to, adultos, criancas]);

  const handleFinalize = async () => {
    if (!range?.from || !range?.to || !selectedCabana) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/public/reservar`, {
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        cabana_id: selectedCabana.id,
        data_checkin: format(range.from, 'yyyy-MM-dd'),
        data_checkout: format(range.to, 'yyyy-MM-dd'),
        adultos: adultos,
        criancas: criancas
      });
      setSuccess(true);
    } catch (error) {
      console.error("Erro ao finalizar reserva", error);
      alert('Erro ao processar reserva.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Lado Esquerdo - Info */}
        <div className="md:w-1/3 bg-stone-100 p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-serif text-stone-900 mb-4">Sua Estadia</h2>
            <p className="text-stone-700 text-sm leading-relaxed">
              Prepare-se para uma experiência única de conexão com a natureza na Serra da Moeda.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-stone-800 text-sm font-medium">
              <CheckCircle size={18} className="text-green-700" />
              Check-in a partir das 16h
            </div>
            <div className="flex items-center gap-3 text-stone-800 text-sm font-medium">
              <CheckCircle size={18} className="text-green-700" />
              Check-out até as 12h
            </div>
          </div>
        </div>

        {/* Lado Direito - Form */}
        <div className="flex-1 p-8 overflow-y-auto bg-white">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition-colors z-10">
            <X size={24} className="text-stone-600" />
          </button>

          {!success ? (
            <div className="space-y-8">
              {/* Progresso */}
              <div className="flex gap-2">
                {[1, 1.5, 2, 3].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-stone-900' : 'bg-stone-200'}`} />
                ))}
              </div>

              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-xl font-bold text-stone-900 mb-6">Qual cabana você deseja?</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {cabanas.map(c => (
                      <button 
                        key={c.id}
                        type="button"
                        onClick={() => { setSelectedCabana(c); setStep(1.5); }}
                        className={`w-full p-6 border-2 rounded-2xl text-left transition-all duration-200 group flex items-center justify-between
                          ${selectedCabana?.id === c.id ? 'border-stone-900 bg-stone-50 shadow-md ring-1 ring-stone-900' : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50/50'}`}
                      >
                        <div className="flex-1">
                          <p className="font-bold text-xl text-stone-900 group-hover:text-black">{c.nome}</p>
                          <p className="text-sm text-stone-600 mt-1">{c.descricao}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                          ${selectedCabana?.id === c.id ? 'border-stone-900 bg-stone-900' : 'border-stone-300'}`}>
                          {selectedCabana?.id === c.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1.5 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                  <h3 className="text-xl font-bold text-stone-900 mb-6">Quantidade de Hóspedes</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div>
                        <p className="font-bold text-stone-900 text-lg">Adultos</p>
                        <p className="text-xs text-stone-500">{selectedCabana?.id === 3 ? 'A partir de 13 anos' : 'A partir de 18 anos'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setAdultos(Math.max(1, adultos - 1))} 
                          className="w-10 h-10 rounded-full border-2 border-stone-200 flex items-center justify-center font-bold text-stone-600 hover:border-stone-900"
                        >-</button>
                        <span className="text-2xl font-black w-6 text-center text-stone-900">{adultos}</span>
                        <button 
                          onClick={() => {
                            const totalAtual = adultos + criancas;
                            const maxPermitido = selectedCabana?.id === 3 ? 5 : 2;
                            if (totalAtual < maxPermitido) {
                              setAdultos(adultos + 1);
                            } else {
                              alert(`O limite total para a ${selectedCabana?.nome} é de ${maxPermitido} pessoas.`);
                            }
                          }}
                          className="w-10 h-10 rounded-full border-2 border-stone-200 flex items-center justify-center font-bold text-stone-600 hover:border-stone-900"
                        >+</button>
                      </div>
                    </div>

                    {/* Crianças (Apenas Hobbit) */}
                    {selectedCabana?.id === 3 && (
                      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                        <div>
                          <p className="font-bold text-stone-900 text-lg">Crianças</p>
                          <p className="text-xs text-stone-500">Até 12 anos</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setCriancas(Math.max(0, criancas - 1))} 
                            className="w-10 h-10 rounded-full border-2 border-stone-200 flex items-center justify-center font-bold text-stone-600 hover:border-stone-900"
                          >-</button>
                          <span className="text-2xl font-black w-6 text-center text-stone-900">{criancas}</span>
                          <button 
                            onClick={() => {
                              const totalAtual = adultos + criancas;
                              if (totalAtual < 5) {
                                setCriancas(criancas + 1);
                              } else {
                                alert("O limite total para a Cabana Hobbit é de 5 pessoas (adultos + crianças).");
                              }
                            }}
                            className="w-10 h-10 rounded-full border-2 border-stone-200 flex items-center justify-center font-bold text-stone-600 hover:border-stone-900"
                          >+</button>
                        </div>
                      </div>
                    )}

                    {selectedCabana?.id === 3 && (adultos + criancas) >= 5 && (
                      <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-800 text-xs font-medium">
                        Atenção: Limite de 5 hóspedes atingido para a Cabana Hobbit.
                      </div>
                    )}
                  </div>
                  <div className="mt-8 flex justify-between w-full border-t pt-6 border-stone-100">
                    <button onClick={() => setStep(1)} className="text-stone-600 font-bold hover:text-stone-900 transition-colors">← Voltar</button>
                    <button onClick={() => setStep(2)} className="bg-stone-900 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all">Selecionar Datas</button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 flex flex-col items-center">
                  <h3 className="text-xl font-bold text-stone-900 mb-6 self-start">Selecione o período da estadia</h3>
                  <div className="p-4 bg-stone-50 rounded-3xl border border-stone-100 shadow-inner">
                    <style>{`
                      .rdp { --rdp-accent-color: #1c1917; --rdp-background-color: #e7e5e4; margin: 0; }
                      .rdp-day { width: 44px; height: 44px; font-weight: 600; font-size: 1rem; color: #44403c; border-radius: 12px !important; }
                      .rdp-day_selected { background-color: #1c1917 !important; color: white !important; font-weight: 800; }
                      .rdp-day_range_middle { background-color: #f5f5f4 !important; color: #1c1917 !important; border-radius: 0 !important; }
                      .rdp-day_disabled { color: #d6d3d1 !important; text-decoration: line-through; opacity: 0.5; cursor: not-allowed; }
                    `}</style>
                    <DayPicker
                      mode="range"
                      selected={range}
                      onSelect={setRange}
                      locale={ptBR}
                      disabled={[{ before: new Date() }, ...disabledDays]}
                    />
                  </div>
                  <div className="mt-8 flex justify-between w-full border-t pt-6 border-stone-100">
                    <button onClick={() => setStep(1.5)} className="text-stone-600 font-bold hover:text-stone-900 transition-colors">← Voltar</button>
                    <button onClick={() => setStep(3)} disabled={!range?.from || !range?.to} className="bg-stone-900 text-white px-10 py-3 rounded-xl font-bold disabled:opacity-30 shadow-lg">Continuar</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                  <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-stone-400">Resumo da Reserva</h4>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-stone-900">{selectedCabana?.nome}</p>
                        <p className="text-xs text-stone-500">{orcamento?.diarias} diárias • {range?.from ? format(range.from, "dd/MM") : ''} a {range?.to ? format(range.to, "dd/MM") : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-stone-900">R$ {orcamento?.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-[10px] text-stone-400 uppercase font-bold">Total da Estadia</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-stone-200 flex justify-between items-center text-xs">
                      <span className="text-stone-500 font-medium uppercase tracking-widest">Hóspedes</span>
                      <span className="font-bold text-stone-900">{adultos} Adultos {criancas > 0 ? `e ${criancas} Crianças` : ''}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <input placeholder="Nome Completo" className="w-full p-4 border-2 border-stone-200 rounded-xl" onChange={e => setFormData({...formData, nome: e.target.value})} />
                    <input placeholder="WhatsApp" className="w-full p-4 border-2 border-stone-200 rounded-xl" onChange={e => setFormData({...formData, telefone: e.target.value})} />
                    <input placeholder="E-mail" className="w-full p-4 border-2 border-stone-200 rounded-xl" onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="pt-6 flex justify-between items-center">
                    <button onClick={() => setStep(2)} className="text-stone-600 font-bold underline">Voltar</button>
                    <button onClick={handleFinalize} disabled={loading || !formData.nome || !formData.telefone} className="bg-green-700 text-white px-10 py-4 rounded-2xl font-bold">Solicitar Reserva</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <CheckCircle size={56} className="text-green-600" />
              <h3 className="text-3xl font-bold text-stone-900">Solicitação Enviada!</h3>
              <p className="text-stone-700">Entraremos em contato via WhatsApp em breve.</p>
              <button onClick={onClose} className="mt-8 bg-stone-900 text-white px-12 py-4 rounded-xl font-bold">Entendi</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}