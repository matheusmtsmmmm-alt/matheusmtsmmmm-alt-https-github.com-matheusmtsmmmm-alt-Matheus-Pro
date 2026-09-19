import React, { useState } from 'react';
import { 
  X, 
  FileDown, 
  Send, 
  Mail, 
  CheckCircle2, 
  Wrench, 
  Check, 
  AlertTriangle,
  Factory,
  Camera,
  Share2,
  Calendar,
  User,
  Activity,
  Copy,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Machine, PlantId, normalizeLedColor } from '../types';
import { 
  downloadGeneralReportPDF, 
  shareGeneralToWhatsApp, 
  shareGeneralToEmail,
  buildCompleteGeneralReportText,
  downloadAllGeneralPhotos,
  getReportPhotosBefore,
  getReportPhotosAfter,
  sortMachines,
  formatMachineNumber
} from '../utils/pdfGenerator';

interface GeneralReportModalProps {
  machines: Machine[];
  isOpen: boolean;
  onClose: () => void;
  onOpenMachineMaintenance?: (machine: Machine) => void;
  initialPlant?: 'todas' | PlantId;
}

export const GeneralReportModal: React.FC<GeneralReportModalProps> = ({
  machines,
  isOpen,
  onClose,
  onOpenMachineMaintenance,
  initialPlant = 'todas'
}) => {
  const [plantFilter, setPlantFilter] = useState<'todas' | PlantId>(initialPlant);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [targetPhone, setTargetPhone] = useState<string>('');
  const [targetEmail, setTargetEmail] = useState<string>('');
  const [showPhoneInput, setShowPhoneInput] = useState<boolean>(false);
  const [showEmailInput, setShowEmailInput] = useState<boolean>(false);
  const [showFullTextPreview, setShowFullTextPreview] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sincroniza o filtro quando initialPlant mudar ao abrir
  React.useEffect(() => {
    if (initialPlant) {
      setPlantFilter(initialPlant);
    }
  }, [initialPlant, isOpen]);

  if (!isOpen) return null;

  const targetMachines = machines.filter(m => {
    if (plantFilter === 'todas') return true;
    return m.plant === plantFilter;
  });

  const sorted = sortMachines(targetMachines);
  const greenCount = sorted.filter(m => normalizeLedColor(m.ledColor) === 'verde').length;
  const yellowCount = sorted.filter(m => normalizeLedColor(m.ledColor) === 'amarelo').length;
  const redCount = sorted.filter(m => normalizeLedColor(m.ledColor) === 'vermelho').length;
  const totalCount = sorted.length || 1;
  const availability = Math.round((greenCount / totalCount) * 100);

  const machinesWithReports = sorted.filter(m => m.maintenanceReports && m.maintenanceReports.length > 0);
  const fullReportText = buildCompleteGeneralReportText(sorted);

  const showNotification = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => {
      setSuccessNotice(null);
    }, 4000);
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      await downloadGeneralReportPDF(sorted);
      showNotification('Relatório Geral Completo em PDF baixado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar PDF geral:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendZap = async () => {
    try {
      setIsGenerating(true);
      await shareGeneralToWhatsApp(sorted, targetPhone);
      showNotification('Relatório Geral Completo enviado com todas as informações para o WhatsApp!');
    } catch (err) {
      console.error('Erro ao compartilhar no ZAP:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setIsGenerating(true);
      await shareGeneralToEmail(sorted, targetEmail);
      showNotification('Relatório Geral Completo preparado para envio por E-mail!');
    } catch (err) {
      console.error('Erro ao compartilhar por e-mail:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(fullReportText);
      setCopied(true);
      showNotification('Todo o texto do relatório completo foi copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar texto:', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-950 border-2 border-cyan-500/60 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.25)] overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* CABEÇALHO DO RELATÓRIO GERAL */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-cyan-500/30 flex items-center justify-between gap-4 bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-heading font-black text-lg sm:text-xl text-white tracking-wide leading-tight">
                  KADU MANUTENÇÃO
                </h2>
                <span className="bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded">
                  RELATÓRIO GERAL COMPLETO
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Todas as informações, dados técnicos, histórico e fotos das {sorted.length} Injetoras
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors shrink-0 cursor-pointer"
            title="Fechar Relatório Geral"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* FEEDBACK DE SUCESSO */}
        {successNotice && (
          <div className="bg-emerald-950 border-b border-emerald-500/60 px-4 py-2.5 flex items-center gap-2 text-xs sm:text-sm text-emerald-200 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
        )}

        {/* SELETOR DE PLANTA DO RELATÓRIO (TODAS, P1 OU P2) */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Filtrar Relatório:
          </span>
          <button
            type="button"
            onClick={() => setPlantFilter('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shrink-0 ${
              plantFilter === 'todas'
                ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Toda a Fábrica ({machines.length})
          </button>
          <button
            type="button"
            onClick={() => setPlantFilter('P1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shrink-0 ${
              plantFilter === 'P1'
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Planta P1 (1 a 13)
          </button>
          <button
            type="button"
            onClick={() => setPlantFilter('P2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shrink-0 ${
              plantFilter === 'P2'
                ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Planta P2 (A a O)
          </button>
        </div>

        {/* CORPO ROLÁVEL */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">

          {/* INDICADORES GERAIS (KPIs) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Box 1: Liberadas (Verde) */}
            <div className="bg-zinc-900 border border-emerald-500/40 p-3.5 rounded-xl flex items-center justify-between shadow-[0_0_12px_rgba(34,197,94,0.15)]">
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  Liberadas
                </span>
                <span className="text-2xl font-heading font-black text-white mt-1 block">
                  {greenCount} <span className="text-xs font-normal text-zinc-500">/ {sorted.length}</span>
                </span>
              </div>
              <div className="w-3.5 h-3.5 rounded-full led-beacon-verde" />
            </div>

            {/* Box 2: Atenção (Amarelo) */}
            <div className="bg-zinc-900 border border-amber-500/40 p-3.5 rounded-xl flex items-center justify-between shadow-[0_0_12px_rgba(234,179,8,0.15)]">
              <div>
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  Atenção
                </span>
                <span className="text-2xl font-heading font-black text-white mt-1 block">
                  {yellowCount} <span className="text-xs font-normal text-zinc-500">/ {sorted.length}</span>
                </span>
              </div>
              <div className="w-3.5 h-3.5 rounded-full led-beacon-amarelo" />
            </div>

            {/* Box 3: Em Manutenção (Vermelho) */}
            <div className="bg-zinc-900 border border-red-500/40 p-3.5 rounded-xl flex items-center justify-between shadow-[0_0_12px_rgba(239,68,68,0.15)]">
              <div>
                <span className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider block">
                  Manutenção
                </span>
                <span className="text-2xl font-heading font-black text-white mt-1 block">
                  {redCount} <span className="text-xs font-normal text-zinc-500">/ {sorted.length}</span>
                </span>
              </div>
              <div className="w-3.5 h-3.5 rounded-full led-beacon-vermelho" />
            </div>

            {/* Box 4: Disponibilidade */}
            <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Disponibilidade
                </span>
                <span className="text-2xl font-heading font-black text-emerald-400 mt-1 block">
                  {availability}%
                </span>
              </div>
              <Activity className="w-6 h-6 text-zinc-500" />
            </div>

          </div>

          {/* BOTÕES DE AÇÃO PRINCIPAIS: ENVIAR NO ZAP, EMAIL, BAIXAR PDF, COPIAR TEXTO */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Enviar Relatório Completo com Todas as Informações</span>
              </h4>
              <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                Dossiê das 13 Máquinas + Fotos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              
              {/* Botão 1: Enviar no ZAP */}
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => {
                  if (!showPhoneInput) {
                    setShowPhoneInput(true);
                  } else {
                    handleSendZap();
                  }
                }}
                className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                title="Enviar Relatório Geral Completo no WhatsApp com PDF e Fotos"
              >
                <Send className="w-4 h-4" />
                <span>Enviar no ZAP</span>
              </button>

              {/* Botão 2: Enviar por E-mail */}
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => {
                  if (!showEmailInput) {
                    setShowEmailInput(true);
                  } else {
                    handleSendEmail();
                  }
                }}
                className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.4)] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                title="Enviar Relatório Geral Completo por E-mail com PDF e Fotos"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar por E-mail</span>
              </button>

              {/* Botão 3: Baixar PDF Geral */}
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleDownloadPDF}
                className="py-3 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                title="Baixar Relatório Geral Oficial em PDF com fotos e informações"
              >
                <FileDown className="w-4 h-4" />
                <span>Baixar PDF Completo</span>
              </button>

              {/* Botão 4: Baixar Todas as Fotos */}
              <button
                type="button"
                onClick={() => {
                  downloadAllGeneralPhotos(sorted);
                  showNotification('Fotos de todas as máquinas estão sendo salvas!');
                }}
                className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-emerald-500/40 active:scale-95 transition-all cursor-pointer"
                title="Baixar todos os arquivos de fotos de Antes e Depois registrados"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Baixar Fotos</span>
              </button>

              {/* Botão 5: Copiar Texto do Relatório */}
              <button
                type="button"
                onClick={handleCopyText}
                className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all cursor-pointer"
                title="Copiar texto consolidado para colar em qualquer aplicativo"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>

            </div>

            {/* Campo Opcional de Telefone do WhatsApp */}
            {showPhoneInput && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/60 flex flex-col sm:flex-row items-center gap-2 animate-fadeIn">
                <span className="text-xs text-slate-300 shrink-0 font-medium">
                  Número do ZAP com DDD (opcional para envio direto):
                </span>
                <input
                  type="tel"
                  placeholder="Ex: 11999998888 (ou deixe vazio para escolher o contato/grupo)"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={handleSendZap}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Disparar Agora no ZAP
                </button>
              </div>
            )}

            {/* Campo Opcional de E-mail de Destino */}
            {showEmailInput && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-500/60 flex flex-col sm:flex-row items-center gap-2 animate-fadeIn">
                <span className="text-xs text-slate-300 shrink-0 font-medium">
                  E-mail de destino (opcional):
                </span>
                <input
                  type="email"
                  placeholder="Ex: gerencia@empresa.com.br"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Abrir E-mail
                </button>
              </div>
            )}

            {/* Alternar Visualização do Texto Completo Formatado */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowFullTextPreview(!showFullTextPreview)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 cursor-pointer py-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>
                  {showFullTextPreview ? 'Ocultar pré-visualização do texto completo' : 'Visualizar texto completo que é enviado no ZAP e E-mail'}
                </span>
                {showFullTextPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showFullTextPreview && (
                <div className="mt-2.5 bg-slate-950 border border-slate-800 rounded-xl p-3.5 max-h-60 overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {fullReportText}
                </div>
              )}
            </div>

          </div>

          {/* TABELA DE STATUS DAS INJETORAS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                Quadro Completo ({sorted.length} Injetoras)
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                {machinesWithReports.length} com histórico registrado
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {sorted.map((machine) => {
                const col = normalizeLedColor(machine.ledColor);
                const isRed = col === 'vermelho';
                const isYellow = col === 'amarelo';
                const reportsCount = machine.maintenanceReports?.length || 0;
                const latestRep = machine.maintenanceReports?.[0];

                const badgeBg = isRed
                  ? 'bg-red-950/60 border-red-500/60 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                  : isYellow
                  ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 shadow-[0_0_8px_rgba(234,179,8,0.2)]'
                  : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-[0_0_8px_rgba(34,197,94,0.2)]';

                const pillBg = isRed
                  ? 'bg-red-950/80 text-red-300 border border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                  : isYellow
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60 shadow-[0_0_10px_rgba(234,179,8,0.25)]'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 shadow-[0_0_10px_rgba(34,197,94,0.25)]';

                const beaconClass = isRed
                  ? 'led-beacon-vermelho'
                  : isYellow
                  ? 'led-beacon-amarelo'
                  : 'led-beacon-verde';

                const statusLabel = isRed
                  ? 'EM MANUTENÇÃO'
                  : isYellow
                  ? 'ATENÇÃO'
                  : 'LIBERADA';

                return (
                  <div
                    key={machine.id}
                    className={`px-3 py-2.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
                      isRed 
                        ? 'bg-red-950/15 hover:bg-red-950/25' 
                        : isYellow
                        ? 'bg-amber-950/15 hover:bg-amber-950/25'
                        : 'hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Badge Injetora */}
                      <div className={`w-9 h-9 rounded-lg font-mono font-black text-sm flex items-center justify-center shrink-0 border ${badgeBg}`}>
                        {formatMachineNumber(machine.number)}
                      </div>

                      {/* Dados Técnicos */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm sm:text-base text-zinc-100">
                            {machine.code} • {machine.model}
                          </span>
                          <span className="text-xs font-mono text-zinc-400">
                            ({machine.tonnage}T)
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                            {machine.plant}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>Técnico: <strong className="text-zinc-200">{machine.technician}</strong></span>
                          {latestRep && (
                            <>
                              <span>•</span>
                              <span className="text-zinc-300">Último serviço: {latestRep.date}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status e Ação */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-black flex items-center gap-1.5 ${pillBg}`}>
                        <span className={`w-2 h-2 rounded-full ${beaconClass}`} />
                        <span>{statusLabel}</span>
                      </span>

                      {onOpenMachineMaintenance && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenMachineMaintenance(machine);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 cursor-pointer transition-colors"
                          title="Abrir ficha e relatórios desta injetora"
                        >
                          Ver Detalhes
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DESTAQUE DE MANUTENÇÕES E FOTOS DE ANTES E DEPOIS REGISTRADAS */}
          {machinesWithReports.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Histórico Recente e Registros Fotográficos (Inclusos no PDF Geral)</span>
                </h4>
                <span className="text-xs text-slate-400">
                  {machinesWithReports.length} máquinas com fotos/registros
                </span>
              </div>

              <div className="space-y-3">
                {machinesWithReports.map((machine) => {
                  const rep = machine.maintenanceReports![0];
                  return (
                    <div key={machine.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-cyan-300">
                            INJETORA {machine.number} ({machine.code})
                          </span>
                          <span className="text-xs text-slate-400">• Data: {rep.date}</span>
                          <span className="text-xs text-slate-400">• Técnico: {rep.technician}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          machine.ledColor === 'vermelho' 
                            ? 'bg-red-950 text-red-300 border border-red-500/50' 
                            : 'bg-blue-950 text-blue-300 border border-blue-500/50'
                        }`}>
                          {machine.ledColor === 'vermelho' ? 'EM MANUTENÇÃO' : 'LIBERADA'}
                        </span>
                      </div>

                      <p className="text-sm text-slate-200 font-normal leading-relaxed">
                        {rep.description}
                      </p>

                      {rep.partsReplaced && (
                        <div className="text-xs bg-black/50 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                          <strong className="text-cyan-300">Peças Trocadas:</strong> {rep.partsReplaced}
                        </div>
                      )}

                      {/* Miniatura do Antes e Depois (Múltiplas Fotos) */}
                      {(() => {
                        const photosBefore = getReportPhotosBefore(rep);
                        const photosAfter = getReportPhotosAfter(rep);
                        const totalPhotos = photosBefore.length + photosAfter.length;

                        if (totalPhotos === 0 && (!rep.photos || rep.photos.length === 0)) return null;

                        return (
                          <div className="space-y-2 pt-1 border-t border-slate-900">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span className="font-bold text-slate-300">Evidências Fotográficas:</span>
                              <span className="text-cyan-400 font-mono font-bold">
                                {totalPhotos || rep.photos?.length || 0} foto(s) inclusa(s) no PDF
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {photosBefore.length > 0 && (
                                <div className="space-y-1">
                                  <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider block">
                                    Antes ({photosBefore.length})
                                  </span>
                                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                                    {photosBefore.slice(0, 5).map((p, pIdx) => (
                                      <img
                                        key={pIdx}
                                        src={p}
                                        alt={`Antes ${pIdx + 1}`}
                                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-rose-900/60 shrink-0"
                                      />
                                    ))}
                                    {photosBefore.length > 5 && (
                                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-[10px] text-rose-300 font-bold shrink-0">
                                        +{photosBefore.length - 5} no PDF
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {photosAfter.length > 0 && (
                                <div className="space-y-1">
                                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider block">
                                    Depois ({photosAfter.length})
                                  </span>
                                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                                    {photosAfter.slice(0, 5).map((p, pIdx) => (
                                      <img
                                        key={pIdx}
                                        src={p}
                                        alt={`Depois ${pIdx + 1}`}
                                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-emerald-900/60 shrink-0"
                                      />
                                    ))}
                                    {photosAfter.length > 5 && (
                                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-[10px] text-emerald-300 font-bold shrink-0">
                                        +{photosAfter.length - 5} no PDF
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Kadu Manutenção • Sistema de Gestão Industrial
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
