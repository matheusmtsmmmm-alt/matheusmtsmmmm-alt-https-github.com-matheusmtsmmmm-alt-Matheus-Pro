import React, { useState } from 'react';
import { 
  Settings, 
  X, 
  Save, 
  RotateCcw, 
  User, 
  Phone, 
  Mail, 
  Layout, 
  Check, 
  AlertTriangle,
  Factory,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetFactoryData: () => void;
  p1Count: number;
  p2Count: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetFactoryData,
  p1Count,
  p2Count
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    onResetFactoryData();
    setConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho Neutro com Ícone de Configuração */}
        <div className="bg-zinc-950 px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-zinc-300 shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Configurações do Sistema</span>
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Kadu Manutenção • Parâmetros Globais
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário de Configurações */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Alerta de Sucesso */}
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-zinc-950 border border-emerald-500 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Configurações salvas com sucesso!</span>
            </div>
          )}

          {/* Nome da Empresa */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Building2 className="w-4 h-4 text-zinc-400" />
              <span>Nome da Empresa / Fábrica:</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Ex: Kadu Manutenção Industrial"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 font-medium"
            />
          </div>

          {/* Técnico Padrão */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <User className="w-4 h-4 text-zinc-400" />
              <span>Técnico Padrão para Novos Relatórios:</span>
            </label>
            <input
              type="text"
              value={formData.defaultTechnician}
              onChange={(e) => setFormData({ ...formData, defaultTechnician: e.target.value })}
              placeholder="Ex: Renato Silva ou Kadu"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 font-medium"
            />
          </div>

          {/* WhatsApp Padrão */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Phone className="w-4 h-4 text-zinc-400" />
              <span>Número de WhatsApp Padrão (com DDD):</span>
            </label>
            <input
              type="tel"
              value={formData.defaultPhone}
              onChange={(e) => setFormData({ ...formData, defaultPhone: e.target.value })}
              placeholder="Ex: 5511999998888"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 font-medium"
            />
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Preenche automaticamente o destinatário ao enviar relatórios pelo WhatsApp.
            </span>
          </div>

          {/* E-mail Padrão */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Mail className="w-4 h-4 text-zinc-400" />
              <span>E-mail Padrão para Relatórios:</span>
            </label>
            <input
              type="email"
              value={formData.defaultEmail}
              onChange={(e) => setFormData({ ...formData, defaultEmail: e.target.value })}
              placeholder="Ex: manutencao@empresa.com"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 font-medium"
            />
          </div>

          {/* Tela Inicial Padrão */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Layout className="w-4 h-4 text-zinc-400" />
              <span>Ao Abrir o Sistema, Iniciar em:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, initialScreen: 'home' })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  formData.initialScreen === 'home'
                    ? 'bg-zinc-800 border-zinc-500 text-zinc-100 shadow-md'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span>Tela Inicial</span>
                <span className="text-[10px] font-normal text-zinc-400">Menu LEDs</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, initialScreen: 'P1' })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  formData.initialScreen === 'P1'
                    ? 'bg-zinc-800 border-zinc-500 text-zinc-100 shadow-md'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span>Planta P1</span>
                <span className="text-[10px] font-normal text-zinc-400">1 a 13</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, initialScreen: 'P2' })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  formData.initialScreen === 'P2'
                    ? 'bg-zinc-800 border-zinc-500 text-zinc-100 shadow-md'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span>Planta P2</span>
                <span className="text-[10px] font-normal text-zinc-400">A a O</span>
              </button>
            </div>
          </div>

          {/* Resumo de Máquinas Cadastradas */}
          <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <Factory className="w-4 h-4 text-zinc-400" />
              <span>Total no Sistema:</span>
            </div>
            <div className="flex items-center gap-3 font-mono font-bold">
              <span className="text-zinc-200">P1: {p1Count} Máq.</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-200">P2: {p2Count} Máq.</span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800">
            
            {/* Restaurar Padrão */}
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full sm:w-auto text-xs text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Fábrica</span>
              </button>
            ) : (
              <div className="w-full sm:w-auto flex items-center gap-2 bg-zinc-950 border border-red-500/80 rounded-xl p-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-[11px] text-red-200 font-bold">Resetar tudo?</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold cursor-pointer"
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs cursor-pointer"
                >
                  Não
                </button>
              </div>
            )}

            {/* Salvar Configurações */}
            <div className="w-full sm:w-auto flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
