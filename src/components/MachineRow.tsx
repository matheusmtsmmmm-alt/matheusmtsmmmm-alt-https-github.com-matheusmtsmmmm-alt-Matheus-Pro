import React from 'react';
import { 
  Wrench, 
  ChevronRight, 
  ImageIcon,
  Camera
} from 'lucide-react';
import { Machine, normalizeLedColor } from '../types';

interface MachineRowProps {
  machine: Machine;
  onOpenMaintenance: (machine: Machine) => void;
}

export const MachineRow: React.FC<MachineRowProps> = ({
  machine,
  onOpenMaintenance,
}) => {
  const reportsCount = machine.maintenanceReports?.length || 0;
  const totalPhotos = machine.maintenanceReports?.reduce((acc, r) => acc + (r.photos?.length || 0), 0) || 0;

  const color = normalizeLedColor(machine.ledColor);

  const ledStyles = {
    verde: {
      cardBorder: 'border-2 border-emerald-500/60 shadow-[0_0_14px_rgba(34,197,94,0.2)] hover:shadow-[0_0_22px_rgba(34,197,94,0.45)] hover:border-emerald-400',
      cardBg: 'bg-zinc-900/90 hover:bg-zinc-900',
      numBox: 'border-2 border-emerald-400/90 shadow-[0_0_12px_rgba(34,197,94,0.6)]',
      numText: 'text-emerald-300 drop-shadow-[0_0_6px_rgba(34,197,94,0.95)]',
      tag: 'text-emerald-300 bg-emerald-950/90 border border-emerald-500/60 shadow-[0_0_6px_rgba(34,197,94,0.3)]',
      tonnageBadge: 'text-emerald-300 bg-emerald-950/80 border border-emerald-500/40',
      beacon: 'led-beacon-verde',
      chevron: 'text-emerald-400',
      statusText: 'LIBERADA',
      statusTextColor: 'text-emerald-300',
    },
    amarelo: {
      cardBorder: 'border-2 border-amber-500/60 shadow-[0_0_14px_rgba(234,179,8,0.2)] hover:shadow-[0_0_22px_rgba(234,179,8,0.45)] hover:border-amber-400',
      cardBg: 'bg-zinc-900/90 hover:bg-zinc-900',
      numBox: 'border-2 border-amber-400/90 shadow-[0_0_12px_rgba(234,179,8,0.6)]',
      numText: 'text-amber-300 drop-shadow-[0_0_6px_rgba(234,179,8,0.95)]',
      tag: 'text-amber-300 bg-amber-950/90 border border-amber-500/60 shadow-[0_0_6px_rgba(234,179,8,0.3)]',
      tonnageBadge: 'text-amber-300 bg-amber-950/80 border border-amber-500/40',
      beacon: 'led-beacon-amarelo',
      chevron: 'text-amber-400',
      statusText: 'ATENÇÃO',
      statusTextColor: 'text-amber-300',
    },
    vermelho: {
      cardBorder: 'border-2 border-red-500/60 shadow-[0_0_14px_rgba(239,68,68,0.2)] hover:shadow-[0_0_22px_rgba(239,68,68,0.45)] hover:border-red-400',
      cardBg: 'bg-zinc-900/90 hover:bg-zinc-900',
      numBox: 'border-2 border-red-400/90 shadow-[0_0_12px_rgba(239,68,68,0.6)]',
      numText: 'text-red-300 drop-shadow-[0_0_6px_rgba(239,68,68,0.95)]',
      tag: 'text-red-300 bg-red-950/90 border border-red-500/60 shadow-[0_0_6px_rgba(239,68,68,0.3)]',
      tonnageBadge: 'text-red-300 bg-red-950/80 border border-red-500/40',
      beacon: 'led-beacon-vermelho',
      chevron: 'text-red-400',
      statusText: 'EM MANUTENÇÃO',
      statusTextColor: 'text-red-300',
    },
  }[color];

  return (
    <div 
      id={`machine-row-${machine.id}`}
      onClick={() => onOpenMaintenance(machine)}
      className={`rounded-xl transition-all cursor-pointer group select-none ${ledStyles.cardBg} ${ledStyles.cardBorder} px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 min-h-[58px] sm:min-h-[62px] active:scale-[0.99]`}
    >
      
      {/* LADO ESQUERDO: NÚMERO DA INJETORA COM LED + NOME + TONELAGEM + TÉCNICO */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        
        {/* Bloco Numérico LED Proporcional (Verde, Amarelo ou Vermelho) */}
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black ${ledStyles.numBox} flex flex-col items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
          <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-widest text-zinc-400 uppercase leading-none">
            INJ
          </span>
          <span className={`font-heading font-black ${typeof machine.number === 'number' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'} leading-none ${ledStyles.numText}`}>
            {typeof machine.number === 'number' ? String(machine.number).padStart(2, '0') : machine.number}
          </span>
        </div>

        {/* Informações da Máquina: Nome, Tonelagem e Técnico */}
        <div className="min-w-0 flex-1">
          {/* Linha 1: Nome da Máquina e Tonelagem */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading font-black text-zinc-100 text-sm sm:text-base tracking-wide group-hover:text-white transition-colors leading-snug">
              {machine.code} • {machine.model}
            </h3>
            
            <span className={`text-[10px] sm:text-xs font-mono font-black px-2 py-0.5 rounded-md ${ledStyles.tonnageBadge}`}>
              {machine.tonnage} Toneladas
            </span>

            <span className={`text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.2 rounded hidden sm:inline ${ledStyles.tag}`}>
              {machine.plant || 'P1'}
            </span>
          </div>

          {/* Linha 2: Técnico Responsável */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
            <span className="flex items-center gap-1">
              <Wrench className="w-3 h-3 text-zinc-400 shrink-0" />
              <span>Técnico: <strong className="text-zinc-200 font-semibold">{machine.technician}</strong></span>
            </span>
          </div>
        </div>

      </div>

      {/* LADO DIREITO: LED STATUS E INDICADOR DE CLIQUE LIMPO */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        
        {/* Indicador Luminoso do Status Atual */}
        <div className="flex items-center gap-1.5 bg-black/70 border border-zinc-800 px-2 py-1 rounded-lg">
          <span className={`w-2.5 h-2.5 rounded-full ${ledStyles.beacon}`} />
          <span className={`text-[10px] sm:text-[11px] font-mono font-black uppercase ${ledStyles.statusTextColor}`}>
            {ledStyles.statusText}
          </span>
        </div>

        {/* Contador de fotos/relatórios (se houver) */}
        {reportsCount > 0 && (
          <div className="hidden sm:flex items-center gap-1 bg-zinc-900 border border-zinc-700 px-2 py-1 rounded-lg text-[11px] font-mono text-zinc-300">
            <Camera className="w-3 h-3 text-zinc-400" />
            <span>{reportsCount}</span>
            {totalPhotos > 0 && (
              <span className="text-zinc-200 flex items-center gap-0.5">
                • <ImageIcon className="w-2.5 h-2.5 text-zinc-400" />{totalPhotos}
              </span>
            )}
          </div>
        )}

        {/* Seta indicando que toda a linha é clicável */}
        <div className={`p-1.5 rounded-lg bg-zinc-800/80 group-hover:bg-zinc-700 transition-colors ${ledStyles.chevron}`}>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>

      </div>

    </div>
  );
};
