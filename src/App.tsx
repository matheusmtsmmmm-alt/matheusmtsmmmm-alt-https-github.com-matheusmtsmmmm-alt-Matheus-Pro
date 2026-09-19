import React, { useState, useEffect } from 'react';
import { 
  Factory, 
  FileText, 
  ArrowLeft, 
  Settings, 
  ArrowRight, 
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Machine, MaintenanceReport, LedColor, PlantId, AppSettings, normalizeLedColor } from './types';
import { INITIAL_MACHINES } from './data/initialMachines';
import { MachineRow } from './components/MachineRow';
import { MaintenanceModal } from './components/MaintenanceModal';
import { GeneralReportModal } from './components/GeneralReportModal';
import { HomeScreen } from './components/HomeScreen';
import { SettingsModal } from './components/SettingsModal';
import { sortMachines } from './utils/pdfGenerator';

const STORAGE_KEY = 'kadu_manutencao_injetoras_v9';
const SETTINGS_KEY = 'kadu_manutencao_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'Kadu Manutenção',
  defaultTechnician: 'Kadu',
  defaultPhone: '',
  defaultEmail: '',
  initialScreen: 'home'
};

function loadInitialMachines(): Machine[] {
  try {
    const saved = 
      localStorage.getItem(STORAGE_KEY) || 
      localStorage.getItem('kadu_manutencao_injetoras_v8') ||
      localStorage.getItem('kadu_manutencao_injetoras_v7') ||
      localStorage.getItem('cardes_injetoras_led_v6');
      
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Mapeia máquinas existentes para preservar relatórios e cores
        const map = new Map<string, any>();
        parsed.forEach((m: any) => {
          const plant = m.plant || (typeof m.number === 'number' ? 'P1' : 'P2');
          const key = `${plant}_${m.number}`;
          map.set(key, m);
        });

        // Atualiza com as especificações oficiais de cada máquina (P1: 01 a 13 e P2: A a O)
        return INITIAL_MACHINES.map((base) => {
          const key = `${base.plant}_${base.number}`;
          const existing = map.get(key) || (base.plant === 'P1' ? parsed.find((p: any) => p.number === base.number) : null);
          if (existing) {
            return {
              ...base,
              ledColor: existing.ledColor ? normalizeLedColor(existing.ledColor) : base.ledColor,
              technician: existing.technician || base.technician,
              maintenanceReports: existing.maintenanceReports || base.maintenanceReports || []
            };
          }
          return base;
        });
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar máquinas do localStorage:', err);
  }
  return INITIAL_MACHINES;
}

function loadInitialSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn('Erro ao carregar configurações do localStorage:', err);
  }
  return DEFAULT_SETTINGS;
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadInitialSettings);
  const [machines, setMachines] = useState<Machine[]>(loadInitialMachines);
  
  // Visualização ativa: 'home' (3 ícones LED), 'P1' (1 a 13) ou 'P2' (A a O)
  const [currentView, setCurrentView] = useState<'home' | PlantId>(settings.initialScreen || 'home');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedMachineForMaintenance, setSelectedMachineForMaintenance] = useState<Machine | null>(null);
  const [isGeneralReportOpen, setIsGeneralReportOpen] = useState<boolean>(false);
  const [generalReportPlant, setGeneralReportPlant] = useState<'todas' | PlantId>('todas');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'verde' | 'amarelo' | 'vermelho'>('todas');

  // Persiste máquinas e relatórios no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(machines));
    } catch (err) {
      console.warn('Erro ao salvar máquinas no localStorage:', err);
    }
  }, [machines]);

  // Persiste configurações
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (err) {
      console.warn('Erro ao salvar configurações:', err);
    }
  };

  // Restaurar dados de fábrica
  const handleResetFactoryData = () => {
    setMachines(INITIAL_MACHINES);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MACHINES));
    } catch (err) {
      console.warn('Erro ao restaurar dados:', err);
    }
  };

  const handleSaveReport = (machineId: number, report: MaintenanceReport) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === machineId) {
          const currentReports = m.maintenanceReports || [];
          return {
            ...m,
            technician: report.technician || m.technician,
            maintenanceReports: [report, ...currentReports]
          };
        }
        return m;
      })
    );

    setSelectedMachineForMaintenance((prev) => {
      if (prev && prev.id === machineId) {
        return {
          ...prev,
          technician: report.technician || prev.technician,
          maintenanceReports: [report, ...(prev.maintenanceReports || [])]
        };
      }
      return prev;
    });
  };

  const handleDeleteReport = (machineId: number, reportId: string) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === machineId) {
          return {
            ...m,
            maintenanceReports: (m.maintenanceReports || []).filter((r) => r.id !== reportId)
          };
        }
        return m;
      })
    );

    setSelectedMachineForMaintenance((prev) => {
      if (prev && prev.id === machineId) {
        return {
          ...prev,
          maintenanceReports: (prev.maintenanceReports || []).filter((r) => r.id !== reportId)
        };
      }
      return prev;
    });
  };

  const handleChangeLedColor = (machineId: number, color: LedColor) => {
    setMachines((prev) =>
      prev.map((m) => (m.id === machineId ? { ...m, ledColor: color } : m))
    );

    setSelectedMachineForMaintenance((prev) => {
      if (prev && prev.id === machineId) {
        return { ...prev, ledColor: color };
      }
      return prev;
    });
  };

  const handleOpenGeneralReport = (plant?: PlantId) => {
    setGeneralReportPlant(plant || (currentView === 'home' ? 'todas' : currentView));
    setIsGeneralReportOpen(true);
  };

  // Separação por plantas
  const p1Machines = machines.filter((m) => m.plant === 'P1');
  const p2Machines = machines.filter((m) => m.plant === 'P2');

  // Máquinas ativas na visualização atual (seja P1 ou P2)
  const currentPlantMachines = currentView === 'home' 
    ? machines 
    : machines.filter((m) => m.plant === currentView);

  const greenCount = currentPlantMachines.filter((m) => normalizeLedColor(m.ledColor) === 'verde').length;
  const yellowCount = currentPlantMachines.filter((m) => normalizeLedColor(m.ledColor) === 'amarelo').length;
  const redCount = currentPlantMachines.filter((m) => normalizeLedColor(m.ledColor) === 'vermelho').length;

  // Lista ordenada de máquinas filtradas por status
  const sortedCurrentMachines = sortMachines(currentPlantMachines).filter(
    (m) => statusFilter === 'todas' || normalizeLedColor(m.ledColor) === statusFilter
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-2 sm:p-3 md:p-4 flex flex-col items-center">
      
      {/* =========================================================================
          1. TELA INICIAL: 3 ÍCONES EM LED REDONDOS (P1, P2 E CONFIGURAÇÕES)
         ========================================================================= */}
      {currentView === 'home' ? (
        <HomeScreen
          machines={machines}
          companyName={settings.companyName}
          onSelectPlant={(plant) => {
            setCurrentView(plant);
            setStatusFilter('todas');
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenGeneralReport={(plant) => handleOpenGeneralReport(plant)}
        />
      ) : (
        /* =========================================================================
            2. TELA DA PLANTA SELECIONADA: P1 (1 a 13) OU P2 (A a O)
           ========================================================================= */
        <main className="w-full max-w-5xl space-y-3 animate-in fade-in duration-200">
          
          {/* CABEÇALHO DA PLANTA COM NAVEGAÇÃO E CONTROLES */}
          <header className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-[0_0_20px_rgba(0,0,0,0.8)] space-y-3">
            
            {/* Linha Superior: Identificação da Planta (Esquerda) + Ações e Botão Voltar com Seta no Canto Superior Direito */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              
              {/* Navegação e Identificação da Planta */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Ícone LED Circular da Planta Ativa */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-heading font-black text-base sm:text-lg border shrink-0 bg-zinc-800 border-zinc-700 text-zinc-100 shadow-md">
                  {currentView}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-heading font-black text-lg sm:text-xl text-white tracking-wide leading-none">
                      {settings.companyName.toUpperCase()}
                    </h1>
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded border bg-zinc-800 border-zinc-700 text-zinc-300">
                      {currentView === 'P1' ? 'PLANTA 1 (1 A 13)' : 'PLANTA 2 (A A O)'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {currentView === 'P1'
                      ? '13 Máquinas Injetoras Numéricas (01 a 13)'
                      : '14 Máquinas Injetoras Alfabéticas (A até O)'}
                  </p>
                </div>
              </div>

              {/* Ações da Direita com BOTÃO DE VOLTAR COM SETA no Canto Superior Direito */}
              <div className="flex items-center gap-2 flex-wrap ml-auto">
                
                {/* Alternador Rápido entre P1 e P2 */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView(currentView === 'P1' ? 'P2' : 'P1');
                    setStatusFilter('todas');
                  }}
                  className="py-2 px-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold text-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title={currentView === 'P1' ? 'Mudar para Planta 2 (A a O)' : 'Mudar para Planta 1 (1 a 13)'}
                >
                  <span>Ir para {currentView === 'P1' ? 'P2 (A a O)' : 'P1 (1 a 13)'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Botão Configurações */}
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-md"
                  title="Configurações do Sistema"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* BOTÃO RELATÓRIO GERAL (COM TODAS AS INFORMAÇÕES) */}
                <button
                  type="button"
                  onClick={() => handleOpenGeneralReport(currentView)}
                  className="py-2 px-3.5 sm:px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-heading font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  title={`Abrir o Relatório Técnico da ${currentView}`}
                >
                  <FileText className="w-4 h-4 text-zinc-300 stroke-[2.5]" />
                  <span>Relatório {currentView}</span>
                  <span className="bg-zinc-900 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ml-0.5 border border-zinc-700">
                    PDF / ZAP
                  </span>
                </button>

                {/* BOTÃO COM SETA PARA VOLTAR NA PÁGINA ANTERIOR (CANTO SUPERIOR DIREITO COM SETA AZUL PULSANTE) */}
                <button
                  type="button"
                  onClick={() => setCurrentView('home')}
                  className="py-2 px-3.5 sm:px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700/90 border-2 border-blue-500/50 hover:border-blue-400 text-white font-heading font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.25)] hover:shadow-[0_0_22px_rgba(59,130,246,0.45)] active:scale-95 shrink-0 group"
                  title="Voltar para a página anterior (Tela Inicial)"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[3] arrow-pulse-blue" />
                  <span className="text-zinc-100 group-hover:text-blue-100 transition-colors">Voltar</span>
                </button>

              </div>

            </div>

            {/* Linha Inferior: Botões de Filtro de LED Verde (Liberada), Amarelo (Atenção) e Vermelho (Em Manutenção) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1 border-t border-zinc-800">
              
              {/* Botão Liberada (Verde) */}
              <button
                type="button"
                onClick={() => setStatusFilter((prev) => (prev === 'verde' ? 'todas' : 'verde'))}
                className={`py-2 sm:py-2.5 px-3 rounded-xl font-mono font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  statusFilter === 'verde'
                    ? 'bg-emerald-600 border-2 border-emerald-300 text-white shadow-[0_0_20px_#22c55e] scale-[1.01]'
                    : 'bg-zinc-900 border border-emerald-500/50 text-emerald-300 hover:bg-zinc-800 hover:border-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                }`}
                title="Filtrar máquinas liberadas (LED Verde)"
              >
                <span className="w-2.5 h-2.5 rounded-full led-beacon-verde shrink-0" />
                <span className="tracking-wide">LIBERADAS</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                  statusFilter === 'verde' 
                    ? 'bg-emerald-950 text-white border border-emerald-300' 
                    : 'bg-black/60 border border-emerald-500/40 text-emerald-300'
                }`}>
                  {greenCount}
                </span>
              </button>

              {/* Botão Atenção (Amarelo) */}
              <button
                type="button"
                onClick={() => setStatusFilter((prev) => (prev === 'amarelo' ? 'todas' : 'amarelo'))}
                className={`py-2 sm:py-2.5 px-3 rounded-xl font-mono font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  statusFilter === 'amarelo'
                    ? 'bg-amber-600 border-2 border-amber-300 text-white shadow-[0_0_20px_#eab308] scale-[1.01]'
                    : 'bg-zinc-900 border border-amber-500/50 text-amber-300 hover:bg-zinc-800 hover:border-amber-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                }`}
                title="Filtrar máquinas em atenção (LED Amarelo)"
              >
                <span className="w-2.5 h-2.5 rounded-full led-beacon-amarelo shrink-0" />
                <span className="tracking-wide">ATENÇÃO</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                  statusFilter === 'amarelo' 
                    ? 'bg-amber-950 text-white border border-amber-300' 
                    : 'bg-black/60 border border-amber-500/40 text-amber-300'
                }`}>
                  {yellowCount}
                </span>
              </button>

              {/* Botão Em Manutenção (Vermelho) */}
              <button
                type="button"
                onClick={() => setStatusFilter((prev) => (prev === 'vermelho' ? 'todas' : 'vermelho'))}
                className={`py-2 sm:py-2.5 px-3 rounded-xl font-mono font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  statusFilter === 'vermelho'
                    ? 'bg-red-600 border-2 border-red-300 text-white shadow-[0_0_20px_#ef4444] scale-[1.01]'
                    : 'bg-zinc-900 border border-red-500/50 text-red-300 hover:bg-zinc-800 hover:border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                }`}
                title="Filtrar máquinas em manutenção (LED Vermelho)"
              >
                <span className="w-2.5 h-2.5 rounded-full led-beacon-vermelho shrink-0" />
                <span className="tracking-wide">MANUTENÇÃO</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                  statusFilter === 'vermelho' 
                    ? 'bg-red-950 text-white border border-red-300' 
                    : 'bg-black/60 border border-red-500/40 text-red-300'
                }`}>
                  {redCount}
                </span>
              </button>

            </div>

          </header>

          {/* LISTA DE MÁQUINAS INJETORAS DA PLANTA SELECIONADA */}
          <div className="space-y-2 sm:space-y-2.5">
            {sortedCurrentMachines.map((machine) => (
              <MachineRow
                key={machine.id}
                machine={machine}
                onOpenMaintenance={setSelectedMachineForMaintenance}
              />
            ))}
            
            {sortedCurrentMachines.length === 0 && (
              <div className="text-center py-8 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 text-sm">
                Nenhuma máquina encontrada na {currentView} com este status.{' '}
                <button
                  type="button"
                  onClick={() => setStatusFilter('todas')}
                  className="text-cyan-400 underline font-bold ml-1 cursor-pointer"
                >
                  Ver todas as máquinas da {currentView}
                </button>
              </div>
            )}
          </div>

        </main>
      )}

      {/* =========================================================================
          MODAIS GLOBAIS
         ========================================================================= */}

      {/* Modal de Configurações do Sistema (3º Ícone LED) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetFactoryData={handleResetFactoryData}
        p1Count={p1Machines.length}
        p2Count={p2Machines.length}
      />

      {/* Modal de Relatório Geral com Todas as Informações */}
      <GeneralReportModal
        machines={machines}
        isOpen={isGeneralReportOpen}
        initialPlant={generalReportPlant}
        onClose={() => setIsGeneralReportOpen(false)}
        onOpenMachineMaintenance={(m) => {
          setIsGeneralReportOpen(false);
          setSelectedMachineForMaintenance(m);
        }}
      />

      {/* Modal de Manutenção e Captura de Fotos ao Clicar na Máquina */}
      <MaintenanceModal
        machine={selectedMachineForMaintenance}
        isOpen={Boolean(selectedMachineForMaintenance)}
        onClose={() => setSelectedMachineForMaintenance(null)}
        onSaveReport={handleSaveReport}
        onDeleteReport={handleDeleteReport}
        onChangeLedColor={handleChangeLedColor}
      />

    </div>
  );
}
