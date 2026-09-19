export interface MaintenancePhoto {
  id: string;
  url: string; // base64 or blob URL
  caption?: string;
  createdAt: string;
}

export interface MaintenanceReport {
  id: string;
  machineId: number;
  date: string;
  time?: string;
  technician: string;
  type: 'corretiva' | 'preventiva' | 'eletrica' | 'mecanica' | 'lubrificacao' | 'outro';
  description: string;
  partsReplaced?: string;
  photos: MaintenancePhoto[];
  photoBefore?: string; // Legado / Primeira imagem Antes da Manutenção
  photoAfter?: string;  // Legado / Primeira imagem Depois da Manutenção
  photosBefore?: string[]; // Múltiplas fotos do Antes (permite mais de 10 fotos)
  photosAfter?: string[];  // Múltiplas fotos do Depois (permite mais de 10 fotos)
  createdAt: number;
}

export type LedColor = 'verde' | 'amarelo' | 'vermelho' | 'azul';

export function normalizeLedColor(color?: LedColor | string): 'verde' | 'amarelo' | 'vermelho' {
  if (color === 'vermelho') return 'vermelho';
  if (color === 'amarelo') return 'amarelo';
  return 'verde'; // 'verde', 'azul' ou default
}

export type PlantId = 'P1' | 'P2';

export interface Machine {
  id: number;
  plant: PlantId;
  number: number | string; // 1 a 13 para P1, 'A' a 'O' para P2
  code: string;   // ex: "INJ-01" ou "INJ-A"
  model: string;  // ex: "Romi Prática 130"
  tonnage: number; // ex: 130 Ton
  technician: string; // ex: "Renato Mecânico"
  ledColor: LedColor; // 'azul' | 'vermelho'
  maintenanceReports?: MaintenanceReport[];
}

export interface AppSettings {
  defaultTechnician: string;
  defaultPhone: string;
  defaultEmail: string;
  initialScreen: 'home' | 'P1' | 'P2';
  companyName: string;
}
