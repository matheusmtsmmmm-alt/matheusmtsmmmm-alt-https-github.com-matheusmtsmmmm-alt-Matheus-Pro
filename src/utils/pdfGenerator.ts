import jsPDF from 'jspdf';
import { Machine, MaintenanceReport, normalizeLedColor } from '../types';

// =========================================================================
// UTILITÁRIOS PARA MÁQUINAS, NÚMEROS E ORDENAÇÃO (P1 E P2)
// =========================================================================

export function formatMachineNumber(num: number | string): string {
  if (typeof num === 'number') {
    return String(num).padStart(2, '0');
  }
  return String(num);
}

export function sortMachines(machines: Machine[]): Machine[] {
  return [...machines].sort((a, b) => {
    if (a.plant !== b.plant) {
      return a.plant.localeCompare(b.plant);
    }
    if (typeof a.number === 'number' && typeof b.number === 'number') {
      return a.number - b.number;
    }
    if (typeof a.number === 'string' && typeof b.number === 'string') {
      return a.number.localeCompare(b.number);
    }
    return String(a.number).localeCompare(String(b.number), undefined, { numeric: true });
  });
}

// =========================================================================
// UTILITÁRIOS PARA MANIPULAÇÃO DE IMAGENS E ARQUIVOS
// =========================================================================

/**
 * Converte uma dataURL (base64) em um objeto File do navegador
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Detecta o formato de imagem compatível com jsPDF ('JPEG' ou 'PNG')
 */
export function detectImageFormat(dataUrl: string): 'JPEG' | 'PNG' {
  if (dataUrl.toLowerCase().includes('image/png')) {
    return 'PNG';
  }
  return 'JPEG';
}

/**
 * Força o download de uma imagem no navegador
 */
export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Utilitários para recuperar todas as fotos do Antes e do Depois de um relatório
 * Suporta tanto o formato novo (array photosBefore / photosAfter) com mais de 10 fotos
 * quanto o formato anterior retrocompatível (photoBefore / photoAfter).
 */
export function getReportPhotosBefore(report: MaintenanceReport | null | undefined): string[] {
  if (!report) return [];
  if (Array.isArray(report.photosBefore) && report.photosBefore.length > 0) {
    return report.photosBefore;
  }
  return report.photoBefore ? [report.photoBefore] : [];
}

export function getReportPhotosAfter(report: MaintenanceReport | null | undefined): string[] {
  if (!report) return [];
  if (Array.isArray(report.photosAfter) && report.photosAfter.length > 0) {
    return report.photosAfter;
  }
  return report.photoAfter ? [report.photoAfter] : [];
}

/**
 * Baixa TODAS as fotos de Antes e Depois de um relatório (suporta mais de 10 fotos)
 */
export function downloadReportPhotos(machine: Machine, report: MaintenanceReport) {
  const dateClean = report.date.replace(/[^0-9a-zA-Z]/g, '_');
  const beforePhotos = getReportPhotosBefore(report);
  const afterPhotos = getReportPhotosAfter(report);
  
  let delay = 0;
  beforePhotos.forEach((photo, idx) => {
    setTimeout(() => {
      downloadImage(photo, `Kadu_INJ_${machine.number}_FOTO_ANTES_${String(idx + 1).padStart(2, '0')}_${dateClean}.jpg`);
    }, delay);
    delay += 250;
  });

  afterPhotos.forEach((photo, idx) => {
    setTimeout(() => {
      downloadImage(photo, `Kadu_INJ_${machine.number}_FOTO_DEPOIS_${String(idx + 1).padStart(2, '0')}_${dateClean}.jpg`);
    }, delay);
    delay += 250;
  });
}

/**
 * Baixa todas as fotos registradas de todas as máquinas (Antes e Depois)
 */
export function downloadAllGeneralPhotos(machines: Machine[]) {
  let delay = 0;
  for (const m of machines) {
    const rep = m.maintenanceReports?.[0];
    if (!rep) continue;
    const beforePhotos = getReportPhotosBefore(rep);
    const afterPhotos = getReportPhotosAfter(rep);
    
    beforePhotos.forEach((photo, idx) => {
      setTimeout(() => {
        downloadImage(photo, `Kadu_INJ_${m.number}_FOTO_ANTES_${String(idx + 1).padStart(2, '0')}_${m.code}.jpg`);
      }, delay);
      delay += 200;
    });

    afterPhotos.forEach((photo, idx) => {
      setTimeout(() => {
        downloadImage(photo, `Kadu_INJ_${m.number}_FOTO_DEPOIS_${String(idx + 1).padStart(2, '0')}_${m.code}.jpg`);
      }, delay);
      delay += 200;
    });
  }
}

// =========================================================================
// TEXTO COMPLETO DO RELATÓRIO GERAL (PARA ZAP, E-MAIL E ÁREA DE TRANSFERÊNCIA)
// =========================================================================
export function buildCompleteGeneralReportText(machines: Machine[]): string {
  const sorted = sortMachines(machines);
  const greenCount = sorted.filter(m => normalizeLedColor(m.ledColor) === 'verde').length;
  const yellowCount = sorted.filter(m => normalizeLedColor(m.ledColor) === 'amarelo').length;
  const redCount = sorted.filter(m => normalizeLedColor(m.ledColor) === 'vermelho').length;
  const totalCount = sorted.length || 1;
  const availability = Math.round((greenCount / totalCount) * 100);

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const isOnlyP1 = sorted.length > 0 && sorted.every(m => m.plant === 'P1');
  const isOnlyP2 = sorted.length > 0 && sorted.every(m => m.plant === 'P2');
  const plantLabel = isOnlyP1 
    ? 'PLANTA 1 (1 A 13)' 
    : isOnlyP2 
      ? 'PLANTA 2 (A A O)' 
      : 'FÁBRICA COMPLETA (P1 + P2)';

  let text = 
    `📋 *KADU MANUTENÇÃO • RELATÓRIO GERAL COMPLETO*\n` +
    `🏭 *SETOR:* ${plantLabel} • AUDITORIA INDUSTRIAL\n` +
    `📅 *Emissão Oficial:* ${dateStr} às ${timeStr}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📊 *PAINEL OPERACIONAL DA PLANTA (SINALIZAÇÃO LED):*\n` +
    `• Total de Injetoras: ${sorted.length} máquinas\n` +
    `• 🟢 Liberadas (Produção Normal): ${greenCount} (${availability}%)\n` +
    (yellowCount > 0 ? `• 🟡 Atenção / Alerta Preventivo: ${yellowCount} (${Math.round((yellowCount / totalCount) * 100)}%)\n` : '') +
    `• 🔴 Em Manutenção (Paradas): ${redCount} (${Math.round((redCount / totalCount) * 100)}%)\n` +
    `• ⚡ Taxa de Disponibilidade Geral: ${availability}%\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔍 *DOSSIÊ DETALHADO MÁQUINA A MÁQUINA:*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  for (const m of sorted) {
    const col = normalizeLedColor(m.ledColor);
    const statusEmoji = col === 'verde' ? '🟢' : col === 'amarelo' ? '🟡' : '🔴';
    const statusText = col === 'verde' ? 'LIBERADA (PRODUÇÃO)' : col === 'amarelo' ? 'ATENÇÃO / ALERTA' : 'EM MANUTENÇÃO';
    const reports = m.maintenanceReports || [];
    const latestRep = reports[0];

    text += `${statusEmoji} *${m.code} (${m.plant}) — ${m.model}*\n`;
    text += `   • *Capacidade:* ${m.tonnage} Toneladas\n`;
    text += `   • *Técnico Responsável:* ${m.technician}\n`;
    text += `   • *Status Atual:* ${statusText}\n`;

    if (latestRep) {
      text += `   • *Data do Registro:* ${latestRep.date} (${latestRep.type.toUpperCase()})\n`;
      text += `   • *Técnico Executante:* ${latestRep.technician}\n`;
      text += `   • *Descrição do Serviço:* ${latestRep.description}\n`;
      if (latestRep.partsReplaced && latestRep.partsReplaced.trim()) {
        text += `   • *Peças / Insumos Trocados:* ${latestRep.partsReplaced}\n`;
      }
      const beforePhotos = getReportPhotosBefore(latestRep);
      const afterPhotos = getReportPhotosAfter(latestRep);
      if (beforePhotos.length > 0 || afterPhotos.length > 0) {
        text += `   • *Evidências Fotográficas:* ${beforePhotos.length} foto(s) de Antes (Defeito) e ${afterPhotos.length} foto(s) de Depois (Reparado) [Anexas]\n`;
      }
    } else {
      text += `   • *Histórico Operacional:* Em pleno funcionamento contínuo. Nenhuma ocorrência de manutenção pendente.\n`;
    }

    text += `\n`;
  }

  text += 
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📌 *ARQUIVOS E EVIDÊNCIAS INCLUSAS:*\n` +
    `• Todas as fotos de Antes e Depois e o documento técnico oficial em PDF acompanham este envio.\n` +
    `• Kadu Manutenção • Gestão e Engenharia de Manutenção Industrial.`;

  return text;
}

// =========================================================================
// 1. GERADOR DO RELATÓRIO INDIVIDUAL EM PDF (COM FOTOS DE ANTES E DEPOIS)
// =========================================================================
export async function generateMaintenancePDF(machine: Machine, report: MaintenanceReport): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 14;

  // CABEÇALHO KADU MANUTENÇÃO
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, currentY, contentWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('KADU MANUTENÇÃO', margin + 6, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text('RELATÓRIO TÉCNICO DE MANUTENÇÃO INDUSTRIAL COM FOTOS', margin + 6, currentY + 16);

  // Badge da Injetora no canto direito
  doc.setFillColor(30, 41, 59);
  doc.rect(pageWidth - margin - 40, currentY + 4, 36, 16, 'F');
  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(0.5);
  doc.rect(pageWidth - margin - 40, currentY + 4, 36, 16, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`INJ - ${formatMachineNumber(machine.number)}`, pageWidth - margin - 37, currentY + 14);

  currentY += 28;

  // QUADRO DE DADOS DA MÁQUINA E MANUTENÇÃO
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(margin, currentY, contentWidth, 28, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('MÁQUINA:', margin + 4, currentY + 7);
  doc.text('TONELAGEM:', margin + 4, currentY + 14);
  doc.text('TÉCNICO RESPONSÁVEL:', margin + 4, currentY + 21);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${machine.code} • ${machine.model}`, margin + 26, currentY + 7);
  doc.text(`${machine.tonnage} Toneladas`, margin + 29, currentY + 14);
  doc.text(`${report.technician}`, margin + 44, currentY + 21);

  const col2X = margin + (contentWidth / 2) + 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('DATA DO SERVIÇO:', col2X, currentY + 7);
  doc.text('TIPO DE INTERVENÇÃO:', col2X, currentY + 14);
  doc.text('STATUS ATUAL:', col2X, currentY + 21);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(report.date, col2X + 34, currentY + 7);
  doc.text(report.type.toUpperCase(), col2X + 40, currentY + 14);
  
  const machineCol = normalizeLedColor(machine.ledColor);
  if (machineCol === 'verde') {
    doc.setTextColor(22, 163, 74);
    doc.setFont('helvetica', 'bold');
    doc.text('LIBERADA (PRODUÇÃO)', col2X + 28, currentY + 21);
  } else if (machineCol === 'amarelo') {
    doc.setTextColor(202, 138, 4);
    doc.setFont('helvetica', 'bold');
    doc.text('ATENÇÃO / ALERTA', col2X + 28, currentY + 21);
  } else {
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text('EM MANUTENÇÃO', col2X + 28, currentY + 21);
  }

  currentY += 34;

  // SEÇÃO: DESCRIÇÃO DO SERVIÇO REALIZADO
  doc.setFillColor(226, 232, 240);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DESCRIÇÃO DO SERVIÇO TÉCNICO REALIZADO', margin + 4, currentY + 5);

  currentY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);

  const descLines = doc.splitTextToSize(report.description || 'Nenhuma descrição informada.', contentWidth - 8);
  const textBlockHeight = Math.max(14, (descLines.length * 5) + 6);
  
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, currentY, contentWidth, textBlockHeight);
  doc.text(descLines, margin + 4, currentY + 6);

  currentY += textBlockHeight + 6;

  // SEÇÃO: PEÇAS E INSUMOS TROCADOS (SE HOUVER)
  if (report.partsReplaced && report.partsReplaced.trim()) {
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('PEÇAS / INSUMOS APLICADOS OU TROCADOS', margin + 4, currentY + 5);

    currentY += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);

    const partsLines = doc.splitTextToSize(report.partsReplaced, contentWidth - 8);
    const partsBlockHeight = Math.max(10, (partsLines.length * 5) + 5);
    doc.rect(margin, currentY, contentWidth, partsBlockHeight);
    doc.text(partsLines, margin + 4, currentY + 6);

    currentY += partsBlockHeight + 6;
  }

  // =========================================================================
  // SEÇÃO: FOTOS DE ANTES E DEPOIS NO PDF (SUPORTA MAIS DE 10 FOTOS COM PAGINAÇÃO)
  // =========================================================================
  const beforePhotos = getReportPhotosBefore(report);
  const afterPhotos = getReportPhotosAfter(report);
  const totalPhotoRows = Math.max(beforePhotos.length, afterPhotos.length);

  if (totalPhotoRows > 0) {
    if (currentY > pageHeight - 85) {
      doc.addPage();
      currentY = 15;
    }

    doc.setFillColor(15, 23, 42);
    doc.rect(margin, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `REGISTRO FOTOGRÁFICO DE EVIDÊNCIAS (${beforePhotos.length} FOTO(S) ANTES • ${afterPhotos.length} FOTO(S) DEPOIS)`,
      margin + 4,
      currentY + 5
    );

    currentY += 10;

    const colWidth = (contentWidth - 6) / 2;
    const colHeight = 52;
    const rowHeight = colHeight + 6.5 + 4; // Barra de título + Imagem + Espaçamento

    for (let i = 0; i < totalPhotoRows; i++) {
      // Verifica se a linha cabe na página atual
      if (currentY + rowHeight > pageHeight - 25) {
        doc.addPage();
        currentY = 14;

        // Sub-cabeçalho de continuação nas páginas adicionais
        doc.setFillColor(30, 41, 59);
        doc.rect(margin, currentY, contentWidth, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(56, 189, 248);
        doc.text(
          `KADU MANUTENÇÃO • INJ-${String(machine.number).padStart(2, '0')} • EVIDÊNCIAS FOTOGRÁFICAS (PAR ${i + 1} DE ${totalPhotoRows})`,
          margin + 4,
          currentY + 4.2
        );
        currentY += 9;
      }

      const col1X = margin;
      const col2X = margin + colWidth + 6;
      const beforeImg = beforePhotos[i];
      const afterImg = afterPhotos[i];

      // Coluna 1: FOTO DO ANTES
      doc.setFillColor(153, 27, 27); // Vermelho escuro
      doc.rect(col1X, currentY, colWidth, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(
        beforeImg ? `FOTO DO ANTES #${i + 1} de ${beforePhotos.length} (DEFEITO / INÍCIO)` : `FOTO DO ANTES #${i + 1} (SEM FOTO ADICIONAL)`,
        col1X + 3,
        currentY + 4.2
      );

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.35);
      doc.rect(col1X, currentY + 6, colWidth, colHeight);

      if (beforeImg) {
        try {
          const fmt = detectImageFormat(beforeImg);
          doc.addImage(beforeImg, fmt, col1X + 1, currentY + 7, colWidth - 2, colHeight - 2, undefined, 'FAST');
        } catch (err) {
          console.warn('Erro ao inserir foto antes no PDF:', err);
        }
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('(Nenhuma foto adicional do Antes)', col1X + 6, currentY + (colHeight / 2) + 4);
      }

      // Coluna 2: FOTO DO DEPOIS
      doc.setFillColor(22, 101, 52); // Verde escuro
      doc.rect(col2X, currentY, colWidth, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(
        afterImg ? `FOTO DO DEPOIS #${i + 1} de ${afterPhotos.length} (REPARADO / LIBERADO)` : `FOTO DO DEPOIS #${i + 1} (SEM FOTO ADICIONAL)`,
        col2X + 3,
        currentY + 4.2
      );

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.35);
      doc.rect(col2X, currentY + 6, colWidth, colHeight);

      if (afterImg) {
        try {
          const fmt = detectImageFormat(afterImg);
          doc.addImage(afterImg, fmt, col2X + 1, currentY + 7, colWidth - 2, colHeight - 2, undefined, 'FAST');
        } catch (err) {
          console.warn('Erro ao inserir foto depois no PDF:', err);
        }
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('(Nenhuma foto adicional do Depois)', col2X + 6, currentY + (colHeight / 2) + 4);
      }

      currentY += rowHeight;
    }

    currentY += 4;
  }

  // RODAPÉ / ASSINATURAS
  if (currentY > pageHeight - 35) {
    doc.addPage();
    currentY = 15;
  } else {
    currentY = Math.max(currentY + 4, pageHeight - 30);
  }

  const signWidth = (contentWidth - 10) / 2;
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, currentY + 12, margin + signWidth, currentY + 12);
  doc.line(margin + signWidth + 10, currentY + 12, margin + contentWidth, currentY + 12);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`TÉCNICO RESPONSÁVEL: ${report.technician}`, margin + 4, currentY + 17);
  doc.text('SUPERVISÃO / KADU MANUTENÇÃO', margin + signWidth + 14, currentY + 17);

  return doc;
}

export async function downloadMaintenancePDF(machine: Machine, report: MaintenanceReport) {
  const doc = await generateMaintenancePDF(machine, report);
  const filename = `Kadu_Manutencao_INJ_${String(machine.number).padStart(2, '0')}_${report.date}.pdf`;
  doc.save(filename);
}

export async function getMaintenancePDFBlob(machine: Machine, report: MaintenanceReport): Promise<{ blob: Blob, filename: string }> {
  const doc = await generateMaintenancePDF(machine, report);
  const filename = `Kadu_Manutencao_INJ_${String(machine.number).padStart(2, '0')}_${report.date}.pdf`;
  const blob = doc.output('blob');
  return { blob, filename };
}

// =========================================================================
// ENVIAR RELATÓRIO INDIVIDUAL NO ZAP (COM PDF E TODAS AS FOTOS ANEXADAS)
// =========================================================================
export async function shareToWhatsApp(machine: Machine, report: MaintenanceReport, targetPhone?: string) {
  const beforePhotos = getReportPhotosBefore(report);
  const afterPhotos = getReportPhotosAfter(report);

  const mCol = normalizeLedColor(machine.ledColor);
  const statusLabel = mCol === 'verde' ? '🟢 LIBERADA (PRODUÇÃO)' : mCol === 'amarelo' ? '🟡 ATENÇÃO / ALERTA' : '🔴 EM MANUTENÇÃO';

  const textMessage = 
    `*KADU MANUTENÇÃO • RELATÓRIO TÉCNICO COM IMAGENS*\n` +
    `🔧 *Injetora:* INJ-${String(machine.number).padStart(2, '0')} (${machine.code} - ${machine.model})\n` +
    `⚖️ *Capacidade:* ${machine.tonnage} Toneladas\n` +
    `📅 *Data:* ${report.date}\n` +
    `👤 *Técnico:* ${report.technician}\n` +
    `⚙️ *Tipo de Serviço:* ${report.type.toUpperCase()}\n` +
    `💡 *Status Atual:* ${statusLabel}\n\n` +
    `📝 *Descrição Completa:*\n${report.description}\n\n` +
    (report.partsReplaced ? `🔩 *Peças / Insumos:* ${report.partsReplaced}\n\n` : '') +
    (beforePhotos.length > 0 ? `📸 *Fotos do Antes:* ${beforePhotos.length} foto(s) anexada(s)\n` : '') +
    (afterPhotos.length > 0 ? `📸 *Fotos do Depois:* ${afterPhotos.length} foto(s) anexada(s)\n` : '') +
    `📄 *Documento Oficial:* PDF técnico anexo com todas as fotos e assinaturas.\n` +
    `_Kadu Manutenção Industrial_`;

  // Prepara arquivos para envio via Web Share (PDF + Todas as Fotos de Antes e Depois)
  const filesToShare: File[] = [];
  try {
    const { blob, filename } = await getMaintenancePDFBlob(machine, report);
    const pdfFile = new File([blob], filename, { type: 'application/pdf' });
    filesToShare.push(pdfFile);

    beforePhotos.forEach((photo, idx) => {
      filesToShare.push(dataUrlToFile(photo, `Kadu_INJ_${machine.number}_Foto_Antes_${idx + 1}.jpg`));
    });
    afterPhotos.forEach((photo, idx) => {
      filesToShare.push(dataUrlToFile(photo, `Kadu_INJ_${machine.number}_Foto_Depois_${idx + 1}.jpg`));
    });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: filesToShare })) {
      await navigator.share({
        title: `Relatório Injetora ${machine.number} - Kadu Manutenção`,
        text: textMessage,
        files: filesToShare
      });
      return;
    }
  } catch (err) {
    console.log('Tentando compartilhamento simplificado ou link do WhatsApp:', err);
  }

  // Fallback quando navigator.share não está disponível ou é desktop:
  downloadMaintenancePDF(machine, report);
  downloadReportPhotos(machine, report);

  const encodedText = encodeURIComponent(textMessage);
  let whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  if (targetPhone && targetPhone.trim()) {
    const cleanPhone = targetPhone.replace(/\D/g, '');
    whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  window.open(whatsappUrl, '_blank');
}

// =========================================================================
// ENVIAR RELATÓRIO INDIVIDUAL POR E-MAIL (COM TODAS AS INFORMAÇÕES)
// =========================================================================
export async function shareToEmail(machine: Machine, report: MaintenanceReport, targetEmail?: string) {
  const subject = `Kadu Manutenção - Relatório Injetora ${machine.number} (${machine.code}) - ${report.date}`;
  const mCol = normalizeLedColor(machine.ledColor);
  const statusLabel = mCol === 'verde' ? 'LIBERADA (PRODUÇÃO)' : mCol === 'amarelo' ? 'ATENÇÃO / ALERTA' : 'EM MANUTENÇÃO';

  const body = 
    `KADU MANUTENÇÃO • RELATÓRIO TÉCNICO COMPLETO COM IMAGENS\n\n` +
    `Injetora: INJ-${String(machine.number).padStart(2, '0')} (${machine.code} - ${machine.model})\n` +
    `Capacidade: ${machine.tonnage} Toneladas\n` +
    `Data do Serviço: ${report.date}\n` +
    `Técnico Responsável: ${report.technician}\n` +
    `Tipo: ${report.type.toUpperCase()}\n` +
    `Status Atual: ${statusLabel}\n\n` +
    `Descrição Detalhada do Serviço:\n${report.description}\n\n` +
    (report.partsReplaced ? `Peças e Insumos Substituídos:\n${report.partsReplaced}\n\n` : '') +
    `Registro Fotográfico: Fotos de Antes e Depois inclusas no PDF oficial gerado em anexo.\n\n` +
    `Atenciosamente,\n` +
    `Kadu Manutenção Industrial`;

  await downloadMaintenancePDF(machine, report);
  downloadReportPhotos(machine, report);

  const emailUrl = `mailto:${targetEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = emailUrl;
}

// =========================================================================
// 2. GERADOR DO RELATÓRIO GERAL EM PDF COM TODAS AS IMAGENS E DETALHES
// =========================================================================
export async function generateGeneralReportPDF(machines: Machine[]): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 14;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR');
  const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const sorted = sortMachines(machines);
  const greenMachines = sorted.filter(m => normalizeLedColor(m.ledColor) === 'verde');
  const yellowMachines = sorted.filter(m => normalizeLedColor(m.ledColor) === 'amarelo');
  const redMachines = sorted.filter(m => normalizeLedColor(m.ledColor) === 'vermelho');
  const totalMachines = sorted.length || 1;

  const isOnlyP1 = sorted.length > 0 && sorted.every(m => m.plant === 'P1');
  const isOnlyP2 = sorted.length > 0 && sorted.every(m => m.plant === 'P2');
  const subTitle = isOnlyP1 
    ? 'RELATÓRIO DA PLANTA 1 • INJETORAS NUMÉRICAS 1 A 13' 
    : isOnlyP2 
      ? 'RELATÓRIO DA PLANTA 2 • INJETORAS ALFABÉTICAS A ATÉ O' 
      : 'RELATÓRIO GERAL COMPLETO DA FÁBRICA • PLANTA 1 E PLANTA 2';

  // CABEÇALHO DO RELATÓRIO GERAL
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, currentY, contentWidth, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('KADU MANUTENÇÃO', margin + 6, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(56, 189, 248);
  doc.text(subTitle, margin + 6, currentY + 17);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Emissão Oficial: ${dateFormatted} às ${timeFormatted} • Todas as Informações e Fotos Inclusas`, margin + 6, currentY + 22);

  // Badge Status no topo direito
  doc.setFillColor(30, 41, 59);
  doc.rect(pageWidth - margin - 46, currentY + 4, 42, 18, 'F');
  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(0.4);
  doc.rect(pageWidth - margin - 46, currentY + 4, 42, 18, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`TOTAL: ${sorted.length} MÁQUINAS`, pageWidth - margin - 44, currentY + 8.5);
  doc.setFontSize(7);
  doc.setTextColor(74, 222, 128);
  doc.text(`• ${greenMachines.length} Liberadas`, pageWidth - margin - 44, currentY + 12);
  doc.setTextColor(250, 204, 21);
  doc.text(`• ${yellowMachines.length} Atenção`, pageWidth - margin - 44, currentY + 15.5);
  doc.setTextColor(248, 113, 113);
  doc.text(`• ${redMachines.length} Manutenção`, pageWidth - margin - 44, currentY + 19);

  currentY += 30;

  // QUADRO DE INDICADORES / KPI
  const kpiWidth = (contentWidth - 6) / 3;
  const kpiHeight = 16;

  // Box 1: Liberadas (Verde)
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.rect(margin, currentY, kpiWidth, kpiHeight, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('LIBERADAS (PRODUÇÃO)', margin + 3, currentY + 6);
  doc.setFontSize(11);
  doc.text(`${greenMachines.length} / ${sorted.length} Injetoras`, margin + 3, currentY + 12);

  // Box 2: Atenção / Alerta (Amarelo)
  const kpi2X = margin + kpiWidth + 3;
  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(254, 240, 138);
  doc.rect(kpi2X, currentY, kpiWidth, kpiHeight, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(161, 98, 7);
  doc.text('ATENÇÃO / ALERTA', kpi2X + 3, currentY + 6);
  doc.setFontSize(11);
  doc.text(`${yellowMachines.length} / ${sorted.length} Injetoras`, kpi2X + 3, currentY + 12);

  // Box 3: Em Manutenção (Vermelho)
  const kpi3X = kpi2X + kpiWidth + 3;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.rect(kpi3X, currentY, kpiWidth, kpiHeight, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(153, 27, 27);
  doc.text('EM MANUTENÇÃO (PARADAS)', kpi3X + 3, currentY + 6);
  doc.setFontSize(11);
  doc.text(`${redMachines.length} / ${sorted.length} Injetoras`, kpi3X + 3, currentY + 12);

  currentY += kpiHeight + 6;

  // TABELA RESUMO DE TODAS AS MÁQUINAS
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`QUADRO CONSOLIDADO DAS ${sorted.length} MÁQUINAS INJETORAS`, margin + 4, currentY + 5);

  currentY += 8;

  // Cabeçalho da Tabela
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('INJ', margin + 2, currentY + 4.2);
  doc.text('SETOR', margin + 14, currentY + 4.2);
  doc.text('CÓDIGO & MODELO', margin + 26, currentY + 4.2);
  doc.text('TON', margin + 92, currentY + 4.2);
  doc.text('TÉCNICO RESPONSÁVEL', margin + 106, currentY + 4.2);
  doc.text('STATUS ATUAL', margin + 148, currentY + 4.2);

  currentY += 6.5;

  for (const m of sorted) {
    const col = normalizeLedColor(m.ledColor);
    const isRed = col === 'vermelho';
    const isYellow = col === 'amarelo';

    if (isRed) {
      doc.setFillColor(254, 242, 242);
    } else if (isYellow) {
      doc.setFillColor(254, 252, 232);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, currentY, contentWidth, 5.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    if (isRed) {
      doc.setTextColor(185, 28, 28);
    } else if (isYellow) {
      doc.setTextColor(161, 98, 7);
    } else {
      doc.setTextColor(21, 128, 61);
    }
    doc.text(`INJ-${formatMachineNumber(m.number)}`, margin + 2, currentY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${m.plant || 'P1'}`, margin + 14, currentY + 4);

    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${m.code} - ${m.model}`, margin + 26, currentY + 4);
    doc.text(`${m.tonnage}T`, margin + 92, currentY + 4);
    doc.text(`${m.technician}`, margin + 106, currentY + 4);

    doc.setFont('helvetica', 'bold');
    if (isRed) {
      doc.setTextColor(220, 38, 38);
      doc.text('EM MANUTENÇÃO', margin + 148, currentY + 4);
    } else if (isYellow) {
      doc.setTextColor(202, 138, 4);
      doc.text('ATENÇÃO', margin + 148, currentY + 4);
    } else {
      doc.setTextColor(22, 163, 74);
      doc.text('LIBERADA', margin + 148, currentY + 4);
    }

    currentY += 6;
  }

  currentY += 6;

  // =========================================================================
  // SEÇÃO 2: DOSSIÊ TÉCNICO COMPLETO COM TODAS AS FOTOS DE ANTES E DEPOIS
  // =========================================================================
  doc.addPage();
  currentY = 14;

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DOSSIÊ TÉCNICO DETALHADO POR INJETORA COM EVIDÊNCIAS FOTOGRÁFICAS', margin + 4, currentY + 5.5);

  currentY += 12;

  for (const machine of sorted) {
    const mColor = normalizeLedColor(machine.ledColor);
    const isRed = mColor === 'vermelho';
    const isYellow = mColor === 'amarelo';
    const reports = machine.maintenanceReports || [];
    const latestReport = reports[0];
    const beforePhotos = getReportPhotosBefore(latestReport);
    const afterPhotos = getReportPhotosAfter(latestReport);
    const hasPhotos = beforePhotos.length > 0 || afterPhotos.length > 0;

    const neededHeight = hasPhotos ? 74 : 26;
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 14;
    }

    // Banner da Injetora
    if (isRed) {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(239, 68, 68);
    } else if (isYellow) {
      doc.setFillColor(254, 252, 232);
      doc.setDrawColor(234, 179, 8);
    } else {
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(34, 197, 94);
    }
    doc.setLineWidth(0.4);
    doc.rect(margin, currentY, contentWidth, 7.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `${machine.code} (${machine.plant || 'P1'}): ${machine.model} (${machine.tonnage} Toneladas) • Resp: ${machine.technician}`,
      margin + 3,
      currentY + 5
    );

    doc.setFontSize(8);
    if (isRed) {
      doc.setTextColor(220, 38, 38);
      doc.text('STATUS: EM MANUTENÇÃO', pageWidth - margin - 52, currentY + 5);
    } else if (isYellow) {
      doc.setTextColor(202, 138, 4);
      doc.text('STATUS: ATENÇÃO / ALERTA', pageWidth - margin - 52, currentY + 5);
    } else {
      doc.setTextColor(22, 163, 74);
      doc.text('STATUS: LIBERADA', pageWidth - margin - 52, currentY + 5);
    }

    currentY += 9;

    if (latestReport) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(`Data: ${latestReport.date}   |   Tipo: ${latestReport.type.toUpperCase()}   |   Executado por: ${latestReport.technician}`, margin + 2, currentY + 3);

      currentY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      const descLines = doc.splitTextToSize(`Serviço Realizado: ${latestReport.description}`, contentWidth - 4);
      doc.text(descLines, margin + 2, currentY + 3);
      currentY += (descLines.length * 3.8) + 3;

      if (latestReport.partsReplaced && latestReport.partsReplaced.trim()) {
        doc.setFont('helvetica', 'bold');
        doc.text(`Peças / Insumos Substituídos: ${latestReport.partsReplaced}`, margin + 2, currentY + 2);
        currentY += 5;
      }

      // FOTOS DE ANTES E DEPOIS DESTA INJETORA (EXIBE FOTOS PRINCIPAIS E CONTAGEM TOTAL)
      if (hasPhotos) {
        const photoBoxW = (contentWidth - 6) / 2;
        const photoBoxH = 42;
        const primaryBefore = beforePhotos[0];
        const primaryAfter = afterPhotos[0];

        // Foto Antes
        doc.setFillColor(153, 27, 27);
        doc.rect(margin, currentY, photoBoxW, 5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        const beforeTitle = beforePhotos.length > 1 
          ? `FOTO ANTES (1 de ${beforePhotos.length} fotos)` 
          : 'FOTO DO ANTES (INÍCIO / DEFEITO)';
        doc.text(beforeTitle, margin + 3, currentY + 3.7);

        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, currentY + 5, photoBoxW, photoBoxH);
        if (primaryBefore) {
          try {
            const fmt = detectImageFormat(primaryBefore);
            doc.addImage(primaryBefore, fmt, margin + 1, currentY + 6, photoBoxW - 2, photoBoxH - 2, undefined, 'FAST');
          } catch (err) {
            console.warn('Erro ao inserir foto antes no relatório geral:', err);
          }
        }

        // Foto Depois
        const photo2X = margin + photoBoxW + 6;
        doc.setFillColor(22, 101, 52);
        doc.rect(photo2X, currentY, photoBoxW, 5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        const afterTitle = afterPhotos.length > 1 
          ? `FOTO DEPOIS (1 de ${afterPhotos.length} fotos)` 
          : 'FOTO DO DEPOIS (REPARADO / LIBERADO)';
        doc.text(afterTitle, photo2X + 3, currentY + 3.7);

        doc.setDrawColor(203, 213, 225);
        doc.rect(photo2X, currentY + 5, photoBoxW, photoBoxH);
        if (primaryAfter) {
          try {
            const fmt = detectImageFormat(primaryAfter);
            doc.addImage(primaryAfter, fmt, photo2X + 1, currentY + 6, photoBoxW - 2, photoBoxH - 2, undefined, 'FAST');
          } catch (err) {
            console.warn('Erro ao inserir foto depois no relatório geral:', err);
          }
        }

        currentY += photoBoxH + 9;
      }
    } else {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text('Em plena operação contínua dentro dos parâmetros nominais de injeção plástica. Sem pendências.', margin + 2, currentY + 3);
      currentY += 6;
    }

    currentY += 4;
  }

  // RODAPÉ / ASSINATURAS DO RELATÓRIO GERAL
  if (currentY > pageHeight - 35) {
    doc.addPage();
    currentY = 15;
  } else {
    currentY = Math.max(currentY + 4, pageHeight - 28);
  }

  const signWidth = (contentWidth - 10) / 2;
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, currentY + 10, margin + signWidth, currentY + 10);
  doc.line(margin + signWidth + 10, currentY + 10, margin + contentWidth, currentY + 10);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('RESPONSÁVEL TÉCNICO • KADU MANUTENÇÃO', margin + 4, currentY + 15);
  doc.text('DIRETORIA / SUPERVISÃO INDUSTRIAL', margin + signWidth + 14, currentY + 15);

  return doc;
}

// 1. Baixar o Relatório Geral Completo em PDF
export async function downloadGeneralReportPDF(machines: Machine[]) {
  const doc = await generateGeneralReportPDF(machines);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const isOnlyP1 = machines.length > 0 && machines.every(m => m.plant === 'P1');
  const isOnlyP2 = machines.length > 0 && machines.every(m => m.plant === 'P2');
  const plantTag = isOnlyP1 ? 'P1_1_a_13' : isOnlyP2 ? 'P2_A_a_O' : 'Fabrica_Geral';
  const filename = `Kadu_Manutencao_Relatorio_${plantTag}_${dateStr}.pdf`;
  doc.save(filename);
}

// 2. Blob do Relatório Geral Completo para compartilhamento
export async function getGeneralReportPDFBlob(machines: Machine[]): Promise<{ blob: Blob, filename: string }> {
  const doc = await generateGeneralReportPDF(machines);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const isOnlyP1 = machines.length > 0 && machines.every(m => m.plant === 'P1');
  const isOnlyP2 = machines.length > 0 && machines.every(m => m.plant === 'P2');
  const plantTag = isOnlyP1 ? 'P1_1_a_13' : isOnlyP2 ? 'P2_A_a_O' : 'Fabrica_Geral';
  const filename = `Kadu_Manutencao_Relatorio_${plantTag}_${dateStr}.pdf`;
  const blob = doc.output('blob');
  return { blob, filename };
}

// 3. Enviar Relatório Geral Completo no ZAP (com PDF e Imagens)
export async function shareGeneralToWhatsApp(machines: Machine[], targetPhone?: string) {
  const textMessage = buildCompleteGeneralReportText(machines);

  // Prepara arquivos para envio conjunto
  const filesToShare: File[] = [];
  try {
    const { blob, filename } = await getGeneralReportPDFBlob(machines);
    const pdfFile = new File([blob], filename, { type: 'application/pdf' });
    filesToShare.push(pdfFile);

    // Adiciona fotos das máquinas (todas as fotos de antes e depois)
    for (const m of machines) {
      const rep = m.maintenanceReports?.[0];
      if (!rep) continue;
      const befs = getReportPhotosBefore(rep);
      const afts = getReportPhotosAfter(rep);
      befs.forEach((photo, idx) => {
        filesToShare.push(dataUrlToFile(photo, `INJ_${m.number}_Antes_${idx + 1}_${m.code}.jpg`));
      });
      afts.forEach((photo, idx) => {
        filesToShare.push(dataUrlToFile(photo, `INJ_${m.number}_Depois_${idx + 1}_${m.code}.jpg`));
      });
    }

    if (navigator.share && navigator.canShare && navigator.canShare({ files: filesToShare })) {
      await navigator.share({
        title: `Relatório Geral Completo - Kadu Manutenção`,
        text: textMessage,
        files: filesToShare
      });
      return;
    }
  } catch (err) {
    console.log('Fallback para compartilhamento:', err);
  }

  // Fallback desktop / navegador padrão:
  downloadGeneralReportPDF(machines);
  downloadAllGeneralPhotos(machines);

  const encodedText = encodeURIComponent(textMessage);
  let whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  if (targetPhone && targetPhone.trim()) {
    const cleanPhone = targetPhone.replace(/\D/g, '');
    whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }

  window.open(whatsappUrl, '_blank');
}

// 4. Enviar Relatório Geral Completo por E-mail (com PDF e Imagens)
export async function shareGeneralToEmail(machines: Machine[], targetEmail?: string) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const isOnlyP1 = machines.length > 0 && machines.every(m => m.plant === 'P1');
  const isOnlyP2 = machines.length > 0 && machines.every(m => m.plant === 'P2');
  const plantLabel = isOnlyP1 ? 'Planta 1 (1 a 13)' : isOnlyP2 ? 'Planta 2 (A a O)' : 'Fábrica Completa (P1 e P2)';
  const subject = `Kadu Manutenção - Relatório Geral (${plantLabel}) - ${dateStr}`;
  const body = buildCompleteGeneralReportText(machines);

  await downloadGeneralReportPDF(machines);
  downloadAllGeneralPhotos(machines);

  const emailUrl = `mailto:${targetEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = emailUrl;
}
