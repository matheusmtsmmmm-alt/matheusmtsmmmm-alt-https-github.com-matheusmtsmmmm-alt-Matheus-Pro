import React from 'react';
import { 
  Factory, 
  Settings, 
  ChevronRight, 
  ShieldCheck, 
  FileText
} from 'lucide-react';
import { Machine, PlantId, normalizeLedColor } from '../types';

interface HomeScreenProps {
  onSelectPlant: (plant: PlantId) => void;
  onOpenSettings: () => void;
  onOpenGeneralReport: (plant?: PlantId) => void;
  machines: Machine[];
  companyName: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectPlant,
  onOpenSettings,
  onOpenGeneralReport,
  machines,
  companyName
}) => {
  const p1Machines = machines.filter((m) => m.plant === 'P1');
  const p2Machines = machines.filter((m) => m.plant === 'P2');

  const p1Green = p1Machines.filter((m) => normalizeLedColor(m.ledColor) === 'verde').length;
  const p1Yellow = p1Machines.filter((m) => normalizeLedColor(m.ledColor) === 'amarelo').length;
  const p1Red = p1Machines.filter((m) => normalizeLedColor(m.ledColor) === 'vermelho').length;

  const p2Green = p2Machines.filter((m) => normalizeLedColor(m.ledColor) === 'verde').length;
  const p2Yellow = p2Machines.filter((m) => normalizeLedColor(m.ledColor) === 'amarelo').length;
  const p2Red = p2Machines.filter((m) => normalizeLedColor(m.ledColor) === 'vermelho').length;

  const totalGreen = machines.filter((m) => normalizeLedColor(m.ledColor) === 'verde').length;
  const totalYellow = machines.filter((m) => normalizeLedColor(m.ledColor) === 'amarelo').length;
  const totalRed = machines.filter((m) => normalizeLedColor(m.ledColor) === 'vermelho').length;

  const totalReports = machines.reduce((acc, m) => acc + (m.maintenanceReports?.length || 0), 0);

  return (
    <div className="w-full max-w-5xl flex flex-col items-center justify-center space-y-6 sm:space-y-8 py-4 sm:py-6 px-2 animate-in fade-in duration-300">
      
      {/* CABEÇALHO DA TELA INICIAL COM IDENTIDADE NEUTRA ELEGANTE E DESTAQUE SEMÁFORO LED */}
      <div className="text-center space-y-2 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 shadow-md">
          {/* Trio de LEDs Semáforo (Verde, Amarelo, Vermelho) */}
          <span className="flex items-center gap-1.5 mr-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#22c55e]" />
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#eab308]" />
            <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_#ef4444]" />
          </span>
          <span className="text-[11px] font-mono font-black text-zinc-300 uppercase tracking-widest">
            {companyName.toUpperCase()} • PAINEL INDUSTRIAL
          </span>
        </div>

        <h1 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-zinc-100 tracking-tight">
          SELECIONE A PLANTA
        </h1>
        
        <p className="text-sm sm:text-base text-zinc-400 font-medium">
          Escolha o setor fabril para gerenciar os status de LED, manutenções técnicas e relatórios fotográficos.
        </p>
      </div>

      {/* GRADE CENTRAL COM OS 3 ÍCONES REDONDOS EM LED (P1 VERDE, P2 AMARELO E CONFIGURAÇÕES VERMELHO) - 50% DO TAMANHO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full max-w-3xl px-2">
        
        {/* =========================================================================
            ÍCONE 1: PLANTA 1 (P1) - LED VERDE INDUSTRIAL COMPACTO
           ========================================================================= */}
        <div 
          id="home-card-p1"
          onClick={() => onSelectPlant('P1')}
          className="group relative bg-zinc-900 hover:bg-zinc-900/95 border-2 border-emerald-500/60 hover:border-emerald-400 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 shadow-[0_0_16px_rgba(34,197,94,0.25)] hover:shadow-[0_0_28px_rgba(34,197,94,0.55)] hover:-translate-y-1 active:scale-95"
        >
          {/* Badge Superior */}
          <div className="absolute -top-2.5 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 text-[9px] font-mono font-black uppercase tracking-wider shadow-[0_0_8px_rgba(34,197,94,0.5)]">
            Setor 1 • Numérico
          </div>

          {/* ÍCONE REDONDO EM LED: P1 (VERDE NEON) */}
          <div className="relative my-2">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-b from-emerald-950 to-black border-2 sm:border-[3px] border-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.8),inset_0_0_15px_rgba(34,197,94,0.5)] group-hover:shadow-[0_0_30px_rgba(34,197,94,1),inset_0_0_20px_rgba(34,197,94,0.7)] group-hover:scale-105 transition-all duration-300">
              
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/90 border border-emerald-300/80 flex flex-col items-center justify-center">
                <span className="font-heading font-black text-lg sm:text-xl text-emerald-300 drop-shadow-[0_0_8px_rgba(34,197,94,1)] tracking-tighter leading-none">
                  P1
                </span>
                <span className="text-[7px] font-mono font-bold text-emerald-400 uppercase tracking-widest leading-none mt-0.5">
                  LED ON
                </span>
              </div>
            </div>

            {/* Ponto de Pulso LED Verde */}
            <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white animate-pulse shadow-[0_0_6px_rgba(34,197,94,1)]" />
          </div>

          {/* Títulos e Descrição Compactos */}
          <div className="space-y-0.5">
            <h2 className="font-heading font-black text-base sm:text-lg text-zinc-100 group-hover:text-emerald-300 transition-colors leading-tight">
              PLANTA 1
            </h2>
            <p className="text-[11px] font-semibold text-emerald-400 leading-tight">
              Injetoras 01 a 13
            </p>
            <p className="text-[11px] text-zinc-400 leading-tight line-clamp-1">
              13 máquinas (45T a 130T)
            </p>
          </div>

          {/* Status dos LEDs em Tempo Real */}
          <div className="w-full mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-center gap-2 text-[11px] font-mono font-bold flex-wrap">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#22c55e]" />
              {p1Green} Lib.
            </span>
            {p1Yellow > 0 && (
              <>
                <span className="text-zinc-700">•</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_#eab308]" />
                  {p1Yellow} Alert.
                </span>
              </>
            )}
            <span className="text-zinc-700">•</span>
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" />
              {p1Red} Manut.
            </span>
          </div>

          {/* Botão Entrar Compacto */}
          <div className="mt-2.5 w-full py-1.5 px-2.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(34,197,94,0.4)] transition-all">
            <span>Acessar P1</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* =========================================================================
            ÍCONE 2: PLANTA 2 (P2) - LED AMARELO INDUSTRIAL COMPACTO
           ========================================================================= */}
        <div 
          id="home-card-p2"
          onClick={() => onSelectPlant('P2')}
          className="group relative bg-zinc-900 hover:bg-zinc-900/95 border-2 border-amber-500/60 hover:border-amber-400 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 shadow-[0_0_16px_rgba(234,179,8,0.25)] hover:shadow-[0_0_28px_rgba(234,179,8,0.55)] hover:-translate-y-1 active:scale-95"
        >
          {/* Badge Superior */}
          <div className="absolute -top-2.5 px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500 text-amber-300 text-[9px] font-mono font-black uppercase tracking-wider shadow-[0_0_8px_rgba(234,179,8,0.5)]">
            Setor 2 • Alfabético
          </div>

          {/* ÍCONE REDONDO EM LED: P2 (AMARELO NEON) */}
          <div className="relative my-2">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-b from-amber-950 to-black border-2 sm:border-[3px] border-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.8),inset_0_0_15px_rgba(234,179,8,0.5)] group-hover:shadow-[0_0_30px_rgba(234,179,8,1),inset_0_0_20px_rgba(234,179,8,0.7)] group-hover:scale-105 transition-all duration-300">
              
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/90 border border-amber-300/80 flex flex-col items-center justify-center">
                <span className="font-heading font-black text-lg sm:text-xl text-amber-300 drop-shadow-[0_0_8px_rgba(234,179,8,1)] tracking-tighter leading-none">
                  P2
                </span>
                <span className="text-[7px] font-mono font-bold text-amber-400 uppercase tracking-widest leading-none mt-0.5">
                  LED ON
                </span>
              </div>
            </div>

            {/* Ponto de Pulso LED Amarelo */}
            <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white animate-pulse shadow-[0_0_6px_rgba(234,179,8,1)]" />
          </div>

          {/* Títulos e Descrição Compactos */}
          <div className="space-y-0.5">
            <h2 className="font-heading font-black text-base sm:text-lg text-zinc-100 group-hover:text-amber-300 transition-colors leading-tight">
              PLANTA 2
            </h2>
            <p className="text-[11px] font-semibold text-amber-400 leading-tight">
              Injetoras A até O
            </p>
            <p className="text-[11px] text-zinc-400 leading-tight line-clamp-1">
              14 máquinas (160T a 320T)
            </p>
          </div>

          {/* Status dos LEDs em Tempo Real */}
          <div className="w-full mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-center gap-2 text-[11px] font-mono font-bold flex-wrap">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#22c55e]" />
              {p2Green} Lib.
            </span>
            {p2Yellow > 0 && (
              <>
                <span className="text-zinc-700">•</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_#eab308]" />
                  {p2Yellow} Alert.
                </span>
              </>
            )}
            <span className="text-zinc-700">•</span>
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" />
              {p2Red} Manut.
            </span>
          </div>

          {/* Botão Entrar Compacto */}
          <div className="mt-2.5 w-full py-1.5 px-2.5 rounded-xl bg-amber-600 group-hover:bg-amber-500 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.4)] transition-all">
            <span>Acessar P2</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* =========================================================================
            ÍCONE 3: CONFIGURAÇÕES - LED VERMELHO INDUSTRIAL COMPACTO
           ========================================================================= */}
        <div 
          id="home-card-settings"
          onClick={onOpenSettings}
          className="group relative bg-zinc-900 hover:bg-zinc-900/95 border-2 border-red-500/60 hover:border-red-400 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 shadow-[0_0_16px_rgba(239,68,68,0.25)] hover:shadow-[0_0_28px_rgba(239,68,68,0.55)] hover:-translate-y-1 active:scale-95"
        >
          {/* Badge Superior */}
          <div className="absolute -top-2.5 px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500 text-red-300 text-[9px] font-mono font-black uppercase tracking-wider shadow-[0_0_8px_rgba(239,68,68,0.5)]">
            Ajustes
          </div>

          {/* ÍCONE REDONDO EM LED: CONFIGURAÇÕES (VERMELHO NEON) */}
          <div className="relative my-2">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-b from-red-950 to-black border-2 sm:border-[3px] border-red-400 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.8),inset_0_0_15px_rgba(239,68,68,0.5)] group-hover:shadow-[0_0_30px_rgba(239,68,68,1),inset_0_0_20px_rgba(239,68,68,0.7)] group-hover:scale-105 transition-all duration-300">
              
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/90 border border-red-300/80 flex flex-col items-center justify-center">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-red-300 group-hover:rotate-90 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(239,68,68,1)]" />
                <span className="text-[7px] font-mono font-bold text-red-400 uppercase tracking-widest leading-none mt-0.5">
                  CONFIG
                </span>
              </div>
            </div>

            {/* Ponto de Pulso LED Vermelho */}
            <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-red-400 border border-white animate-pulse shadow-[0_0_6px_rgba(239,68,68,1)]" />
          </div>

          {/* Títulos e Descrição Compactos */}
          <div className="space-y-0.5">
            <h2 className="font-heading font-black text-base sm:text-lg text-zinc-100 group-hover:text-red-300 transition-colors leading-tight">
              CONFIGURAÇÕES
            </h2>
            <p className="text-[11px] font-semibold text-red-400 leading-tight">
              Parâmetros e Dados
            </p>
            <p className="text-[11px] text-zinc-400 leading-tight line-clamp-1">
              Técnico, WhatsApp e Fábrica
            </p>
          </div>

          {/* Informações das Preferências */}
          <div className="w-full mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold text-red-300">
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            <span>Preferências</span>
          </div>

          {/* Botão Entrar Compacto */}
          <div className="mt-2.5 w-full py-1.5 px-2.5 rounded-xl bg-red-600 group-hover:bg-red-500 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.4)] transition-all">
            <span>Ajustes</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

      </div>

      {/* BARRA DE AÇÃO INFERIOR: RESUMO TOTAL COM SEMÁFORO LED (VERDE, AMARELO, VERMELHO) */}
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 shrink-0">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-black text-sm text-zinc-100">
                FÁBRICA: {machines.length} INJETORAS
              </span>
              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#22c55e]" />
                  {totalGreen}
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_#eab308]" />
                  {totalYellow}
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" />
                  {totalRed}
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-400">
              {totalReports} histórico(s) técnico(s) registrados no sistema.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            id="home-btn-general-report"
            type="button"
            onClick={() => onOpenGeneralReport()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 hover:border-zinc-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-zinc-300" />
            <span>Relatório Geral Fábrica</span>
          </button>
        </div>
      </div>

    </div>
  );
};
