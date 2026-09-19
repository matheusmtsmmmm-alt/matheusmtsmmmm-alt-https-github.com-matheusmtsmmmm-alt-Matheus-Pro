import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Wrench, 
  Calendar, 
  User, 
  Trash2, 
  CheckCircle2, 
  History,
  PlusCircle,
  AlertCircle,
  Eye,
  FileText,
  PackageCheck,
  Check,
  FileDown,
  Mail,
  Send,
  Share2,
  ArrowRight
} from 'lucide-react';
import { Machine, MaintenanceReport, MaintenancePhoto, LedColor, normalizeLedColor } from '../types';
import { 
  downloadMaintenancePDF, 
  shareToWhatsApp, 
  shareToEmail,
  downloadReportPhotos,
  getReportPhotosBefore,
  getReportPhotosAfter
} from '../utils/pdfGenerator';

interface MaintenanceModalProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveReport: (machineId: number, report: MaintenanceReport) => void;
  onDeleteReport?: (machineId: number, reportId: string) => void;
  onChangeLedColor?: (machineId: number, color: LedColor) => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  machine,
  isOpen,
  onClose,
  onSaveReport,
  onDeleteReport,
  onChangeLedColor
}) => {
  const [activeTab, setActiveTab] = useState<'novo' | 'historico'>('novo');

  // Estados dos Campos do Relatório
  const [technician, setTechnician] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<MaintenanceReport['type']>('corretiva');
  const [description, setDescription] = useState<string>('');
  const [partsReplaced, setPartsReplaced] = useState<string>('');

  // Imagens de ANTES e DEPOIS da Manutenção (Arrays com suporte a > 10 fotos)
  const [photosBefore, setPhotosBefore] = useState<string[]>([]);
  const [photosAfter, setPhotosAfter] = useState<string[]>([]);

  // Estados de confirmação [OK] para cada campo
  const [okTechnician, setOkTechnician] = useState<boolean>(false);
  const [okDate, setOkDate] = useState<boolean>(false);
  const [okType, setOkType] = useState<boolean>(false);
  const [okDescription, setOkDescription] = useState<boolean>(false);
  const [okParts, setOkParts] = useState<boolean>(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [photoFeedback, setPhotoFeedback] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Refs para navegação suave ao dar OK em cada campo
  const techInputRef = useRef<HTMLInputElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const typeSelectRef = useRef<HTMLSelectElement | null>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const partsInputRef = useRef<HTMLInputElement | null>(null);

  // Inputs invisíveis para CÂMERA e GALERIA do ANTES
  const cameraBeforeInputRef = useRef<HTMLInputElement | null>(null);
  const galleryBeforeInputRef = useRef<HTMLInputElement | null>(null);

  // Inputs invisíveis para CÂMERA e GALERIA do DEPOIS
  const cameraAfterInputRef = useRef<HTMLInputElement | null>(null);
  const galleryAfterInputRef = useRef<HTMLInputElement | null>(null);

  // Modal de Foto Ampliada
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  // Modal de Compartilhamento Direto (WhatsApp / Email)
  const [shareDialogReport, setShareDialogReport] = useState<MaintenanceReport | null>(null);
  const [destWhatsapp, setDestWhatsapp] = useState<string>('');

  useEffect(() => {
    if (machine) {
      const now = new Date();
      setDate(now.toISOString().slice(0, 10));
      setTechnician(machine.technician || '');
      setType('corretiva');
      setDescription('');
      setPartsReplaced('');
      setPhotosBefore([]);
      setPhotosAfter([]);
      setOkTechnician(Boolean(machine.technician));
      setOkDate(true);
      setOkType(true);
      setOkDescription(false);
      setOkParts(false);
      setFormError(null);
      setPhotoFeedback(null);
      setActionSuccessMsg(null);
    }
  }, [machine, isOpen]);

  // Confirmação individual de cada campo [OK]
  const handleConfirmTechnician = () => {
    if (!technician.trim()) {
      setFormError('Informe o nome do Técnico antes de dar OK.');
      techInputRef.current?.focus();
      return;
    }
    setFormError(null);
    setOkTechnician(true);
    dateInputRef.current?.focus();
  };

  const handleConfirmDate = () => {
    setFormError(null);
    setOkDate(true);
    typeSelectRef.current?.focus();
  };

  const handleConfirmType = () => {
    setFormError(null);
    setOkType(true);
    descTextareaRef.current?.focus();
  };

  const handleConfirmDescription = () => {
    if (!description.trim()) {
      setFormError('Preencha a descrição do que foi feito na máquina antes de dar OK.');
      descTextareaRef.current?.focus();
      return;
    }
    setFormError(null);
    setOkDescription(true);
    partsInputRef.current?.focus();
  };

  const handleConfirmParts = () => {
    setFormError(null);
    setOkParts(true);
  };

  // Processamento de Upload da Imagem do ANTES (Suporta mais de 10 fotos)
  const handleCaptureBefore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    let loadedCount = 0;
    const newPhotos: string[] = [];

    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPhotos.push(event.target.result as string);
        }
        loadedCount++;
        if (loadedCount === fileList.length) {
          setPhotosBefore((prev) => {
            const updated = [...prev, ...newPhotos];
            showPhotoFeedback(`${newPhotos.length} foto(s) do ANTES adicionada(s)! Total: ${updated.length} foto(s)`);
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  // Processamento de Upload da Imagem do DEPOIS (Suporta mais de 10 fotos)
  const handleCaptureAfter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    let loadedCount = 0;
    const newPhotos: string[] = [];

    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPhotos.push(event.target.result as string);
        }
        loadedCount++;
        if (loadedCount === fileList.length) {
          setPhotosAfter((prev) => {
            const updated = [...prev, ...newPhotos];
            showPhotoFeedback(`${newPhotos.length} foto(s) do DEPOIS adicionada(s)! Total: ${updated.length} foto(s)`);
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const handleRemovePhotoBefore = (index: number) => {
    setPhotosBefore((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemovePhotoAfter = (index: number) => {
    setPhotosAfter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearPhotosBefore = () => {
    setPhotosBefore([]);
  };

  const handleClearPhotosAfter = () => {
    setPhotosAfter([]);
  };

  const showPhotoFeedback = (msg: string) => {
    setPhotoFeedback(msg);
    setTimeout(() => {
      setPhotoFeedback(null);
    }, 3500);
  };

  const showSuccessNotice = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 4500);
  };

  // Salvar Relatório Final com Múltiplas Fotos ANTES e DEPOIS
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine) return;

    if (!description.trim()) {
      setFormError('Por favor, preencha o campo de descrição do serviço antes de salvar.');
      descTextareaRef.current?.focus();
      return;
    }

    const reportPhotos: MaintenancePhoto[] = [];
    photosBefore.forEach((p, idx) => {
      reportPhotos.push({
        id: `photo-before-${Date.now()}-${idx}`,
        url: p,
        caption: `Antes da Manutenção #${idx + 1}`,
        createdAt: new Date().toISOString()
      });
    });
    photosAfter.forEach((p, idx) => {
      reportPhotos.push({
        id: `photo-after-${Date.now()}-${idx}`,
        url: p,
        caption: `Depois da Manutenção #${idx + 1}`,
        createdAt: new Date().toISOString()
      });
    });

    const newReport: MaintenanceReport = {
      id: 'rep-' + Date.now(),
      machineId: machine.id,
      date,
      technician: technician.trim() || machine.technician || 'Técnico Kadu Manutenção',
      type,
      description: description.trim(),
      partsReplaced: partsReplaced.trim(),
      photos: reportPhotos,
      photoBefore: photosBefore[0] || undefined,
      photoAfter: photosAfter[0] || undefined,
      photosBefore,
      photosAfter,
      createdAt: Date.now()
    };

    onSaveReport(machine.id, newReport);
    const totalPhotos = photosBefore.length + photosAfter.length;
    showSuccessNotice(
      totalPhotos > 0 
        ? `Relatório salvo! ${totalPhotos} foto(s) de Antes e Depois organizadas e prontas no PDF.`
        : 'Relatório gravado com sucesso!'
    );
    setActiveTab('historico');
  };

  if (!isOpen || !machine) return null;

  const reports = machine.maintenanceReports || [];

  const currentLed = normalizeLedColor(machine.ledColor);

  const modalLedTheme = {
    verde: {
      border: 'border-emerald-500/70 shadow-[0_0_35px_rgba(34,197,94,0.35)]',
      headerBorder: 'border-emerald-500/40',
      numBox: 'border-emerald-400/90 shadow-[0_0_15px_rgba(34,197,94,0.7)]',
      numText: 'text-emerald-300 drop-shadow-[0_0_8px_rgba(34,197,94,0.9)]',
      tag: 'bg-emerald-950 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(34,197,94,0.3)]',
      btnOk: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]',
      activeTab: 'text-emerald-300 border-emerald-500/60 shadow-[0_-4px_12px_rgba(34,197,94,0.25)]',
    },
    amarelo: {
      border: 'border-amber-500/70 shadow-[0_0_35px_rgba(234,179,8,0.35)]',
      headerBorder: 'border-amber-500/40',
      numBox: 'border-amber-400/90 shadow-[0_0_15px_rgba(234,179,8,0.7)]',
      numText: 'text-amber-300 drop-shadow-[0_0_8px_rgba(234,179,8,0.9)]',
      tag: 'bg-amber-950 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(234,179,8,0.3)]',
      btnOk: 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.5)]',
      activeTab: 'text-amber-300 border-amber-500/60 shadow-[0_-4px_12px_rgba(234,179,8,0.25)]',
    },
    vermelho: {
      border: 'border-red-500/70 shadow-[0_0_35px_rgba(239,68,68,0.35)]',
      headerBorder: 'border-red-500/40',
      numBox: 'border-red-400/90 shadow-[0_0_15px_rgba(239,68,68,0.7)]',
      numText: 'text-red-300 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]',
      tag: 'bg-red-950 border-red-500/50 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.3)]',
      btnOk: 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]',
      activeTab: 'text-red-300 border-red-500/60 shadow-[0_-4px_12px_rgba(239,68,68,0.25)]',
    },
    azul: {
      border: 'border-emerald-500/70 shadow-[0_0_35px_rgba(34,197,94,0.35)]',
      headerBorder: 'border-emerald-500/40',
      numBox: 'border-emerald-400/90 shadow-[0_0_15px_rgba(34,197,94,0.7)]',
      numText: 'text-emerald-300 drop-shadow-[0_0_8px_rgba(34,197,94,0.9)]',
      tag: 'bg-emerald-950 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(34,197,94,0.3)]',
      btnOk: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]',
      activeTab: 'text-emerald-300 border-emerald-500/60 shadow-[0_-4px_12px_rgba(34,197,94,0.25)]',
    }
  }[currentLed];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      
      {/* INPUTS INVISÍVEIS PARA CÂMERA E GALERIA DO ANTES (SUPORTA MAIS DE 10 FOTOS) */}
      <input
        ref={cameraBeforeInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleCaptureBefore}
        className="hidden"
        id="camera-before-input"
      />
      <input
        ref={galleryBeforeInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleCaptureBefore}
        className="hidden"
        id="gallery-before-input"
      />

      {/* INPUTS INVISÍVEIS PARA CÂMERA E GALERIA DO DEPOIS (SUPORTA MAIS DE 10 FOTOS) */}
      <input
        ref={cameraAfterInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleCaptureAfter}
        className="hidden"
        id="camera-after-input"
      />
      <input
        ref={galleryAfterInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleCaptureAfter}
        className="hidden"
        id="gallery-after-input"
      />

      <div 
        className={`bg-slate-950 border-2 rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden transition-all ${modalLedTheme.border}`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* CABEÇALHO SUPERIOR: DADOS DA MÁQUINA + BOTÃO FECHAR */}
        <div className={`px-4 py-3 sm:px-6 sm:py-4 border-b flex items-center justify-between gap-4 bg-slate-900/90 ${modalLedTheme.headerBorder}`}>
          
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Bloco Numérico LED */}
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-black border-2 ${modalLedTheme.numBox} flex flex-col items-center justify-center shrink-0`}>
              <span className="text-[9px] font-mono font-bold text-slate-400 leading-none tracking-widest">INJ</span>
              <span className={`font-heading font-black ${typeof machine.number === 'number' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'} leading-none ${modalLedTheme.numText}`}>
                {typeof machine.number === 'number' ? String(machine.number).padStart(2, '0') : machine.number}
              </span>
            </div>

            {/* Informações Textuais */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-heading font-black text-base sm:text-xl text-white tracking-wide leading-tight">
                  {machine.code} • {machine.model}
                </h2>
                <span className={`border text-[10px] font-extrabold px-2 py-0.5 rounded ${modalLedTheme.tag}`}>
                  {machine.plant || 'KADU'}
                </span>
              </div>
              <div className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span>Tonelagem: <strong className="text-white font-mono font-bold">{machine.tonnage} T</strong></span>
                <span>•</span>
                <span>Técnico: <strong className="text-cyan-300 font-semibold">{machine.technician}</strong></span>
              </div>
            </div>
          </div>

          {/* Botão Fechar Isolado */}
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors shrink-0 cursor-pointer"
            title="Fechar Janela"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* FAIXA DE STATUS DA MÁQUINA */}
        {onChangeLedColor && (
          <div className="px-4 py-2.5 sm:px-6 sm:py-3 bg-zinc-900 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Status da Injetora {machine.number}:
            </span>
            
            <div className="grid grid-cols-3 gap-2 sm:w-96">
              <button
                type="button"
                onClick={() => onChangeLedColor(machine.id, 'verde')}
                className={`py-2 px-2.5 rounded-xl text-xs sm:text-sm font-mono font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  currentLed === 'verde'
                    ? 'bg-emerald-600 text-white shadow-[0_0_16px_#22c55e] border-2 border-emerald-300'
                    : 'bg-zinc-900 text-zinc-400 hover:text-emerald-300 hover:bg-zinc-800 border border-zinc-700'
                }`}
                title="Marcar máquina como Liberada (LED Verde)"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e] shrink-0" />
                <span>LIBERADA</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeLedColor(machine.id, 'amarelo')}
                className={`py-2 px-2.5 rounded-xl text-xs sm:text-sm font-mono font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  currentLed === 'amarelo'
                    ? 'bg-amber-600 text-white shadow-[0_0_16px_#eab308] border-2 border-amber-300'
                    : 'bg-zinc-900 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 border border-zinc-700'
                }`}
                title="Marcar máquina em Atenção / Alerta (LED Amarelo)"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#eab308] shrink-0" />
                <span>ATENÇÃO</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeLedColor(machine.id, 'vermelho')}
                className={`py-2 px-2.5 rounded-xl text-xs sm:text-sm font-mono font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  currentLed === 'vermelho'
                    ? 'bg-red-600 text-white shadow-[0_0_16px_#ef4444] border-2 border-red-300'
                    : 'bg-zinc-900 text-zinc-400 hover:text-red-300 hover:bg-zinc-800 border border-zinc-700'
                }`}
                title="Marcar máquina em Manutenção (LED Vermelho)"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_#ef4444] shrink-0" />
                <span>MANUTENÇÃO</span>
              </button>
            </div>
          </div>
        )}

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 px-4 sm:px-6 pt-2.5 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('novo')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-t border-x cursor-pointer ${
              activeTab === 'novo'
                ? `bg-slate-950 ${modalLedTheme.activeTab}`
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Inserir Informações</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('historico')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-t border-x cursor-pointer ${
              activeTab === 'historico'
                ? `bg-slate-950 ${modalLedTheme.activeTab}`
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico de Relatórios ({reports.length})</span>
          </button>
        </div>

        {/* CORPO DO MODAL */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">

          {/* Aviso Global de Sucesso */}
          {actionSuccessMsg && (
            <div className="bg-emerald-950/80 border border-emerald-500/80 p-3.5 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm text-emerald-200 animate-fadeIn shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-semibold">{actionSuccessMsg}</span>
            </div>
          )}

          {activeTab === 'novo' ? (
            <form onSubmit={handleFinalSubmit} className="space-y-5">
              
              {/* Alerta de Validação */}
              {formError && (
                <div className="bg-amber-950/70 border border-amber-500/70 p-3 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm text-amber-200 animate-fadeIn">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              {/* CAMPO 1: TÉCNICO RESPONSÁVEL COM BOTÃO OK */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Técnico Responsável</span>
                  </span>
                  {okTechnician && (
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Confirmado
                    </span>
                  )}
                </label>
                
                <div className="flex items-center gap-2">
                  <input
                    ref={techInputRef}
                    type="text"
                    placeholder="Nome do técnico responsável..."
                    value={technician}
                    onChange={(e) => {
                      setTechnician(e.target.value);
                      setOkTechnician(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleConfirmTechnician();
                      }
                    }}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                  
                  <button
                    type="button"
                    onClick={handleConfirmTechnician}
                    className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      okTechnician
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    }`}
                    title="Confirmar Técnico"
                  >
                    <Check className="w-4 h-4" />
                    <span>OK</span>
                  </button>
                </div>
              </div>

              {/* LINHA DUPLA: DATA E TIPO COM BOTÃO OK EM CADA UM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* CAMPO 2: DATA COM BOTÃO OK */}
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span>Data</span>
                    </span>
                    {okDate && (
                      <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> OK
                      </span>
                    )}
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      ref={dateInputRef}
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setOkDate(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleConfirmDate();
                        }
                      }}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-cyan-400"
                    />

                    <button
                      type="button"
                      onClick={handleConfirmDate}
                      className={`px-3.5 sm:px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                        okDate
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950'
                      }`}
                      title="Confirmar Data"
                    >
                      <Check className="w-4 h-4" />
                      <span>OK</span>
                    </button>
                  </div>
                </div>

                {/* CAMPO 3: TIPO DE MANUTENÇÃO COM BOTÃO OK */}
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-cyan-400" />
                      <span>Tipo de Manutenção</span>
                    </span>
                    {okType && (
                      <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> OK
                      </span>
                    )}
                  </label>

                  <div className="flex items-center gap-2">
                    <select
                      ref={typeSelectRef}
                      value={type}
                      onChange={(e) => {
                        setType(e.target.value as any);
                        setOkType(false);
                      }}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="corretiva">Corretiva (Reparo / Parada)</option>
                      <option value="preventiva">Preventiva (Revisão Periódica)</option>
                      <option value="eletrica">Elétrica / Eletrônica</option>
                      <option value="mecanica">Mecânica / Hidráulica</option>
                      <option value="lubrificacao">Lubrificação Geral</option>
                      <option value="outro">Ajuste / Outro</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleConfirmType}
                      className={`px-3.5 sm:px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                        okType
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950'
                      }`}
                      title="Confirmar Tipo"
                    >
                      <Check className="w-4 h-4" />
                      <span>OK</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* CAMPO 4: DESCRIÇÃO DO SERVIÇO (FONTE 50% MAIOR) COM BOTÃO OK */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm sm:text-base font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Descrição do Serviço Realizado</span>
                  </label>
                  {okDescription && (
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Informação Salva
                    </span>
                  )}
                </div>

                <textarea
                  ref={descTextareaRef}
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setOkDescription(false);
                  }}
                  placeholder="Descreva o que foi feito na máquina (ex: troca de resistência, ajuste de pressão, regulagem do molde...)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-base sm:text-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-inner leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleConfirmDescription}
                    className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                      okDescription
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    }`}
                    title="Confirmar Descrição"
                  >
                    <Check className="w-4 h-4" />
                    <span>OK • Confirmar Descrição</span>
                  </button>
                </div>
              </div>

              {/* CAMPO 5: PEÇAS TROCADAS COM BOTÃO OK */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-cyan-400" />
                    <span>Peças / Insumos Trocados (Opcional)</span>
                  </span>
                  {okParts && (
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> OK
                    </span>
                  )}
                </label>

                <div className="flex items-center gap-2">
                  <input
                    ref={partsInputRef}
                    type="text"
                    value={partsReplaced}
                    onChange={(e) => {
                      setPartsReplaced(e.target.value);
                      setOkParts(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleConfirmParts();
                      }
                    }}
                    placeholder="Ex: Resistência 1500W, Retentor, Óleo ISO VG 68..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />

                  <button
                    type="button"
                    onClick={handleConfirmParts}
                    className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      okParts
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950'
                    }`}
                    title="Confirmar Peças"
                  >
                    <Check className="w-4 h-4" />
                    <span>OK</span>
                  </button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SEÇÃO LÁ EMBAIXO: FOTOS DE ANTES E DEPOIS (PARA O PDF E RELATÓRIO) */}
              {/* ========================================================================= */}
              <div className="bg-slate-900/95 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4 shadow-xl">
                
                <div className="border-b border-slate-800 pb-2.5">
                  <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-cyan-400" />
                    <span>Fotos para o PDF: ANTES e DEPOIS</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Registre a foto da máquina antes do serviço (defeito/início) e depois (reparada/liberada). Ambas vão em destaque no PDF oficial.
                  </p>
                </div>

                {/* Feedback de foto anexada */}
                {photoFeedback && (
                  <div className="bg-emerald-950/80 border border-emerald-500 p-2.5 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{photoFeedback}</span>
                  </div>
                )}

                {/* Grid Duplo: Card do ANTES e Card do DEPOIS (com suporte a mais de 10 fotos cada) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* -------------------- CARD DO ANTES -------------------- */}
                  <div className="bg-slate-950 border-2 border-rose-900/60 rounded-xl p-3.5 flex flex-col justify-between space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-rose-950 border border-rose-600/70 text-rose-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span>FOTOS DO ANTES ({photosBefore.length})</span>
                      </span>
                      {photosBefore.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleClearPhotosBefore}
                            className="text-[11px] text-rose-400 hover:text-rose-200 underline cursor-pointer"
                            title="Limpar todas as fotos do Antes"
                          >
                            Limpar Todas
                          </button>
                          <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {photosBefore.length} {photosBefore.length === 1 ? 'Foto' : 'Fotos'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-mono">Início / Defeito</span>
                      )}
                    </div>

                    {/* Preview da galeria de fotos do ANTES */}
                    {photosBefore.length > 0 ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-2 bg-black/60 rounded-xl border border-rose-950">
                          {photosBefore.map((photo, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-rose-900/50 bg-slate-900">
                              <img
                                src={photo}
                                alt={`Antes ${idx + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => setZoomedPhoto(photo)}
                              />
                              <span className="absolute top-1 left-1 bg-black/75 text-rose-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                                #{idx + 1}
                              </span>
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => setZoomedPhoto(photo)}
                                  className="p-1 rounded bg-slate-900 text-cyan-300 hover:bg-slate-800 cursor-pointer"
                                  title="Ampliar foto"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhotoBefore(idx)}
                                  className="p-1 rounded bg-rose-900 text-white hover:bg-rose-800 cursor-pointer"
                                  title="Remover esta foto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-[11px] text-rose-300/80 font-medium text-center">
                          {photosBefore.length >= 10 
                            ? `✓ ${photosBefore.length} fotos prontas! Todas serão incluídas nas páginas do PDF.`
                            : `${photosBefore.length} foto(s) selecionada(s). Você pode adicionar mais de 10 fotos.`}
                        </p>
                      </div>
                    ) : (
                      <div className="border border-dashed border-rose-900/70 rounded-lg p-5 flex flex-col items-center justify-center text-center bg-rose-950/10 space-y-1">
                        <Camera className="w-6 h-6 text-rose-400 mb-1" />
                        <p className="text-xs text-rose-200 font-semibold">
                          Nenhuma foto do <strong>ANTES</strong> adicionada
                        </p>
                        <span className="text-[11px] text-slate-400">
                          Selecione mais de 10 fotos da galeria ou use a câmera
                        </span>
                      </div>
                    )}

                    {/* Botões do ANTES: Câmera + Galeria com seleção múltipla */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => cameraBeforeInputRef.current?.click()}
                        className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(225,29,72,0.4)] active:scale-95 transition-all cursor-pointer"
                        title="Tirar foto do ANTES agora"
                      >
                        <Camera className="w-4 h-4 text-white" />
                        <span>Câmera ANTES</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => galleryBeforeInputRef.current?.click()}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                        title="Escolher múltiplas fotos da galeria (mais de 10 permitidas)"
                      >
                        <Upload className="w-4 h-4 text-rose-400" />
                        <span>Galeria (Múltiplas)</span>
                      </button>
                    </div>
                  </div>

                  {/* -------------------- CARD DO DEPOIS -------------------- */}
                  <div className="bg-slate-950 border-2 border-emerald-900/60 rounded-xl p-3.5 flex flex-col justify-between space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-600/70 text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>FOTOS DO DEPOIS ({photosAfter.length})</span>
                      </span>
                      {photosAfter.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleClearPhotosAfter}
                            className="text-[11px] text-emerald-400 hover:text-emerald-200 underline cursor-pointer"
                            title="Limpar todas as fotos do Depois"
                          >
                            Limpar Todas
                          </button>
                          <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {photosAfter.length} {photosAfter.length === 1 ? 'Foto' : 'Fotos'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-mono">Reparado / Liberado</span>
                      )}
                    </div>

                    {/* Preview da galeria de fotos do DEPOIS */}
                    {photosAfter.length > 0 ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-2 bg-black/60 rounded-xl border border-emerald-950">
                          {photosAfter.map((photo, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-emerald-900/50 bg-slate-900">
                              <img
                                src={photo}
                                alt={`Depois ${idx + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => setZoomedPhoto(photo)}
                              />
                              <span className="absolute top-1 left-1 bg-black/75 text-emerald-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                                #{idx + 1}
                              </span>
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => setZoomedPhoto(photo)}
                                  className="p-1 rounded bg-slate-900 text-cyan-300 hover:bg-slate-800 cursor-pointer"
                                  title="Ampliar foto"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhotoAfter(idx)}
                                  className="p-1 rounded bg-rose-900 text-white hover:bg-rose-800 cursor-pointer"
                                  title="Remover esta foto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-[11px] text-emerald-300/80 font-medium text-center">
                          {photosAfter.length >= 10 
                            ? `✓ ${photosAfter.length} fotos prontas! Todas serão incluídas nas páginas do PDF.`
                            : `${photosAfter.length} foto(s) selecionada(s). Você pode adicionar mais de 10 fotos.`}
                        </p>
                      </div>
                    ) : (
                      <div className="border border-dashed border-emerald-900/70 rounded-lg p-5 flex flex-col items-center justify-center text-center bg-emerald-950/10 space-y-1">
                        <Camera className="w-6 h-6 text-emerald-400 mb-1" />
                        <p className="text-xs text-emerald-200 font-semibold">
                          Nenhuma foto do <strong>DEPOIS</strong> adicionada
                        </p>
                        <span className="text-[11px] text-slate-400">
                          Selecione mais de 10 fotos da galeria ou use a câmera
                        </span>
                      </div>
                    )}

                    {/* Botões do DEPOIS: Câmera + Galeria com seleção múltipla */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => cameraAfterInputRef.current?.click()}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer"
                        title="Tirar foto do DEPOIS agora"
                      >
                        <Camera className="w-4 h-4 text-white" />
                        <span>Câmera DEPOIS</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => galleryAfterInputRef.current?.click()}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                        title="Escolher múltiplas fotos da galeria (mais de 10 permitidas)"
                      >
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <span>Galeria (Múltiplas)</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* BOTÃO FINAL DE SALVAR TUDO LÁ EMBAIXO */}
              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-xl ${modalLedTheme.btnOk} font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>OK • Salvar Relatório da Máquina</span>
                </button>
              </div>

            </form>
          ) : (
            /* LISTA DO HISTÓRICO COM FOTOS ANTES E DEPOIS E EXPORTAÇÃO PDF/ZAP/EMAIL */
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-900/40 rounded-xl border border-slate-800">
                  <Wrench className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h4 className="font-heading font-bold text-slate-200 text-base sm:text-lg">
                    Nenhum relatório registrado para a {machine.code}
                  </h4>
                  <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                    Utilize a aba "Inserir Informações" para preencher os dados e fotografar o Antes e Depois da máquina.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-3.5"
                    >
                      {/* Cabeçalho do Card */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider ${
                            rep.type === 'corretiva'
                              ? 'bg-rose-950 border border-rose-500/60 text-rose-300'
                              : rep.type === 'preventiva'
                              ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-300'
                              : 'bg-blue-950 border border-blue-500/60 text-blue-300'
                          }`}>
                            {rep.type}
                          </span>
                          
                          <span className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-cyan-400" />
                            <span>Data: {rep.date}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm sm:text-base text-slate-300 font-semibold flex items-center gap-1.5">
                            <User className="w-4 h-4 text-cyan-400" />
                            <span>Técnico: <strong className="text-white">{rep.technician}</strong></span>
                          </span>
                          
                          {onDeleteReport && (
                            <button
                              type="button"
                              onClick={() => onDeleteReport(machine.id, rep.id)}
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Excluir este relatório"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* TEXTO DO RELATÓRIO COM FONTE MAIOR 50% */}
                      <div>
                        <p className="text-base sm:text-lg text-slate-100 font-normal leading-relaxed whitespace-pre-wrap">
                          {rep.description}
                        </p>
                      </div>

                      {/* Peças Trocadas com Fonte Maior */}
                      {rep.partsReplaced && (
                        <div className="text-sm sm:text-base bg-black/60 border border-slate-800 px-3.5 py-2 rounded-lg text-slate-200">
                          <strong className="text-cyan-300 font-bold">Peças / Insumos:</strong> {rep.partsReplaced}
                        </div>
                      )}

                      {/* FOTOS DE ANTES E DEPOIS LADO A LADO NO CARD (COM SUPORTE A > 10 FOTOS) */}
                      {(() => {
                        const repPhotosBefore = getReportPhotosBefore(rep);
                        const repPhotosAfter = getReportPhotosAfter(rep);
                        const hasPhotos = repPhotosBefore.length > 0 || repPhotosAfter.length > 0;

                        if (!hasPhotos && (!rep.photos || rep.photos.length === 0)) {
                          return null;
                        }

                        if (hasPhotos) {
                          return (
                            <div className="pt-2 border-t border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                                  Comparativo Fotográfico (Incluso no PDF):
                                </span>
                                <span className="text-xs text-cyan-400 font-bold">
                                  {repPhotosBefore.length + repPhotosAfter.length} foto(s) anexada(s)
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Card Antes */}
                                <div className="bg-slate-950 border border-rose-900/60 rounded-xl p-2.5 flex flex-col space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-rose-300 tracking-wider">
                                      [ANTES] Início / Defeito ({repPhotosBefore.length})
                                    </span>
                                  </div>
                                  {repPhotosBefore.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-1 bg-black/40 rounded-lg">
                                      {repPhotosBefore.map((p, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden border border-rose-950 bg-slate-900 group">
                                          <img
                                            src={p}
                                            alt={`Antes #${idx + 1}`}
                                            onClick={() => setZoomedPhoto(p)}
                                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                          />
                                          <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[9px] text-rose-300 font-mono font-bold px-1 rounded">
                                            #{idx + 1}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="aspect-video bg-slate-900/60 rounded-lg flex items-center justify-center text-[10px] text-slate-500">
                                      Sem foto do antes
                                    </div>
                                  )}
                                </div>

                                {/* Card Depois */}
                                <div className="bg-slate-950 border border-emerald-900/60 rounded-xl p-2.5 flex flex-col space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">
                                      [DEPOIS] Reparado / Liberado ({repPhotosAfter.length})
                                    </span>
                                  </div>
                                  {repPhotosAfter.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-1 bg-black/40 rounded-lg">
                                      {repPhotosAfter.map((p, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden border border-emerald-950 bg-slate-900 group">
                                          <img
                                            src={p}
                                            alt={`Depois #${idx + 1}`}
                                            onClick={() => setZoomedPhoto(p)}
                                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                          />
                                          <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[9px] text-emerald-300 font-mono font-bold px-1 rounded">
                                            #{idx + 1}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="aspect-video bg-slate-900/60 rounded-lg flex items-center justify-center text-[10px] text-slate-500">
                                      Sem foto do depois
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {rep.photos?.map((ph) => (
                              <img
                                key={ph.id}
                                src={ph.url}
                                alt="Foto do serviço"
                                onClick={() => setZoomedPhoto(ph.url)}
                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-slate-700 cursor-pointer hover:scale-105 transition-all shadow-md"
                              />
                            ))}
                          </div>
                        );
                      })()}

                      {/* BARRA DE AÇÕES: TRANSFORMAR EM PDF, ENVIAR PARA O ZAP OU EMAIL */}
                      <div className="pt-3 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2.5">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>PDF com Antes e Depois:</span>
                        </span>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* BOTÃO GERAR E BAIXAR PDF */}
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await downloadMaintenancePDF(machine, rep);
                                showSuccessNotice('PDF com fotos de Antes e Depois gerado e baixado!');
                              } catch (err) {
                                console.error(err);
                                alert('Erro ao gerar o PDF');
                              }
                            }}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                            title="Transformar este relatório em PDF e salvar no aparelho"
                          >
                            <FileDown className="w-4 h-4 text-cyan-400" />
                            <span>Baixar PDF</span>
                          </button>

                          {/* BOTÃO ENVIAR PARA O ZAP (WHATSAPP) */}
                          <button
                            type="button"
                            onClick={() => {
                              setShareDialogReport(rep);
                              setDestWhatsapp('');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer"
                            title="Enviar relatório para o WhatsApp"
                          >
                            <Send className="w-4 h-4 text-white" />
                            <span>Enviar no ZAP</span>
                          </button>

                          {/* BOTÃO BAIXAR FOTOS */}
                          {(() => {
                            const count = getReportPhotosBefore(rep).length + getReportPhotosAfter(rep).length;
                            if (count === 0 && (!rep.photos || rep.photos.length === 0)) return null;
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  downloadReportPhotos(machine, rep);
                                  showSuccessNotice(`${count || rep.photos?.length || 0} foto(s) do Antes e Depois baixadas!`);
                                }}
                                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                                title="Baixar todas as fotos do Antes e Depois"
                              >
                                <Camera className="w-4 h-4 text-emerald-400" />
                                <span>Fotos ({count || rep.photos?.length || 0})</span>
                              </button>
                            );
                          })()}

                          {/* BOTÃO ENVIAR PARA O E-MAIL */}
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await shareToEmail(machine, rep);
                                showSuccessNotice('PDF gerado e cliente de e-mail aberto!');
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_12px_rgba(59,130,246,0.4)] active:scale-95 transition-all cursor-pointer"
                            title="Enviar relatório por e-mail"
                          >
                            <Mail className="w-4 h-4 text-white" />
                            <span>E-mail</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-xs sm:text-sm text-slate-400 shrink-0">
          <span>Injetora {machine.number} • Kadu Manutenção</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>

      {/* DIALOG DE ENVIO PARA O ZAP / WHATSAPP */}
      {shareDialogReport && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShareDialogReport(null)}
        >
          <div 
            className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <span>Enviar Relatório Completo</span>
              </h3>
              <button
                type="button"
                onClick={() => setShareDialogReport(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300">
              O relatório da <strong>{machine.code}</strong> com <strong>todas as informações</strong>, fotos de <strong>Antes e Depois</strong> e o PDF técnico oficial será enviado.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Número do WhatsApp (Opcional com DDD):
              </label>
              <input
                type="tel"
                value={destWhatsapp}
                onChange={(e) => setDestWhatsapp(e.target.value)}
                placeholder="Ex: 11999998888 ou deixe em branco para escolher"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
              <p className="text-[11px] text-slate-400">
                Deixando em branco, o WhatsApp abrirá sua lista de contatos e grupos do Kadu Manutenção.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={async () => {
                  await shareToWhatsApp(machine, shareDialogReport, destWhatsapp);
                  showSuccessNotice('Abrindo WhatsApp com o relatório, PDF e fotos...');
                  setShareDialogReport(null);
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Disparar para o WhatsApp Agora (com PDF e Fotos)</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await shareToEmail(machine, shareDialogReport);
                  showSuccessNotice('E-mail aberto com relatório, PDF e fotos!');
                  setShareDialogReport(null);
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-blue-500/40 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar por E-mail (com PDF e Fotos)</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    await downloadMaintenancePDF(machine, shareDialogReport);
                    showSuccessNotice('PDF baixado no aparelho!');
                  }}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Baixar PDF</span>
                </button>

                {(() => {
                  const count = getReportPhotosBefore(shareDialogReport).length + getReportPhotosAfter(shareDialogReport).length;
                  if (count === 0 && (!shareDialogReport.photos || shareDialogReport.photos.length === 0)) return null;
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        downloadReportPhotos(machine, shareDialogReport);
                        showSuccessNotice(`${count || shareDialogReport.photos?.length || 0} fotos salvas no aparelho!`);
                      }}
                      className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Salvar Fotos ({count || shareDialogReport.photos?.length || 0})</span>
                    </button>
                  );
                })()}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Zoomed Photo Modal */}
      {zoomedPhoto && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={zoomedPhoto}
              alt="Foto ampliada"
              className="max-w-full max-h-[85vh] object-contain rounded-xl border border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.8)]"
            />
            <button
              type="button"
              onClick={() => setZoomedPhoto(null)}
              className="absolute top-2 right-2 bg-black/80 text-white p-2 rounded-full border border-slate-700 hover:bg-rose-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
