import { Machine } from '../types';

export const INITIAL_MACHINES: Machine[] = [
  // ==========================================
  // PLANTA 1 (P1) - INJETORAS 01 A 13
  // Conforme sistema fabril oficial
  // ==========================================
  {
    id: 1,
    plant: 'P1',
    number: 1,
    code: 'INJ-01',
    model: 'STARMACH 55',
    tonnage: 55,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: [
      {
        id: 'rep-1',
        machineId: 1,
        date: '2026-09-12',
        technician: 'Kadu',
        type: 'preventiva',
        description: 'Revisão periódica no sistema hidráulico e lubrificação das colunas de fechamento.',
        partsReplaced: 'Filtro de sucção e anéis de vedação',
        photos: [],
        createdAt: Date.now() - 3 * 86400000
      }
    ]
  },
  {
    id: 2,
    plant: 'P1',
    number: 2,
    code: 'INJ-02',
    model: 'MINGPLAST 45 S-7',
    tonnage: 45,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 3,
    plant: 'P1',
    number: 3,
    code: 'INJ-03',
    model: 'MINGPLAST 45 S-7',
    tonnage: 45,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 4,
    plant: 'P1',
    number: 4,
    code: 'INJ-04',
    model: 'CHEN HSONG 120',
    tonnage: 120,
    technician: 'Kadu',
    ledColor: 'vermelho',
    maintenanceReports: []
  },
  {
    id: 5,
    plant: 'P1',
    number: 5,
    code: 'INJ-05',
    model: 'TIANJIAN PL 86 S',
    tonnage: 86,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 6,
    plant: 'P1',
    number: 6,
    code: 'INJ-06',
    model: 'TIANJIAN PL 86 S',
    tonnage: 86,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 7,
    plant: 'P1',
    number: 7,
    code: 'INJ-07',
    model: 'TIANJIAN PL 86 S',
    tonnage: 86,
    technician: 'Kadu',
    ledColor: 'amarelo',
    maintenanceReports: [
      {
        id: 'rep-7',
        machineId: 7,
        date: '2026-09-15',
        technician: 'Kadu',
        type: 'preventiva',
        description: 'Alerta preventivo: inspeção de desgaste no fuso plastificador e calibração de temperatura.',
        partsReplaced: 'Graxa especial alta temperatura',
        photos: [],
        createdAt: Date.now() - 12 * 3600000
      }
    ]
  },
  {
    id: 8,
    plant: 'P1',
    number: 8,
    code: 'INJ-08',
    model: 'TEDERIC 80',
    tonnage: 80,
    technician: 'Kadu',
    ledColor: 'vermelho',
    maintenanceReports: [
      {
        id: 'rep-8',
        machineId: 8,
        date: '2026-09-14',
        technician: 'Kadu',
        type: 'corretiva',
        description: 'Troca da resistência coleira da zona 1 do bico e recalibração do termopar tipo J.',
        partsReplaced: 'Resistência cerâmica 220V e termopar',
        photos: [],
        createdAt: Date.now() - 1 * 86400000
      }
    ]
  },
  {
    id: 9,
    plant: 'P1',
    number: 9,
    code: 'INJ-09',
    model: 'HAITIAN MA G 120',
    tonnage: 120,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 10,
    plant: 'P1',
    number: 10,
    code: 'INJ-10',
    model: 'HAITIAN MA 1200',
    tonnage: 120,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 11,
    plant: 'P1',
    number: 11,
    code: 'INJ-11',
    model: 'HAITIAN W1200 S',
    tonnage: 120,
    technician: 'Kadu',
    ledColor: 'vermelho',
    maintenanceReports: []
  },
  {
    id: 12,
    plant: 'P1',
    number: 12,
    code: 'INJ-12',
    model: 'HAITIAN W1200 S',
    tonnage: 120,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 13,
    plant: 'P1',
    number: 13,
    code: 'INJ-13',
    model: 'LK POTENZA II',
    tonnage: 130,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },

  // ==========================================
  // PLANTA 2 (P2) - INJETORAS A ATÉ O (SEM K)
  // Conforme sistema fabril oficial
  // ==========================================
  {
    id: 101,
    plant: 'P2',
    number: 'A',
    code: 'INJ-A',
    model: 'SINITROM SB 260',
    tonnage: 260,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 102,
    plant: 'P2',
    number: 'B',
    code: 'INJ-B',
    model: 'TIANJIAN PL 2500',
    tonnage: 250,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 103,
    plant: 'P2',
    number: 'C',
    code: 'INJ-C',
    model: 'HAITIAN MA 2500',
    tonnage: 250,
    technician: 'Kadu',
    ledColor: 'amarelo',
    maintenanceReports: [
      {
        id: 'rep-c',
        machineId: 103,
        date: '2026-09-15',
        technician: 'Kadu',
        type: 'preventiva',
        description: 'Atenção operacional: checagem dos retentores hidráulicos e nível do reservatório.',
        partsReplaced: 'Aditivo hidráulico ISO VG 68',
        photos: [],
        createdAt: Date.now() - 10 * 3600000
      }
    ]
  },
  {
    id: 104,
    plant: 'P2',
    number: 'D',
    code: 'INJ-D',
    model: 'HAITIAN MA 2000 I',
    tonnage: 200,
    technician: 'Kadu',
    ledColor: 'vermelho',
    maintenanceReports: []
  },
  {
    id: 105,
    plant: 'P2',
    number: 'E',
    code: 'INJ-E',
    model: 'HAITIAN MA 2000 2',
    tonnage: 200,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 106,
    plant: 'P2',
    number: 'F',
    code: 'INJ-F',
    model: 'HAITIAN SA 2000',
    tonnage: 200,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 107,
    plant: 'P2',
    number: 'G',
    code: 'INJ-G',
    model: 'HAITIAN X2000',
    tonnage: 200,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 108,
    plant: 'P2',
    number: 'H',
    code: 'INJ-H',
    model: 'HAITIAN MA 1600 V',
    tonnage: 160,
    technician: 'Kadu',
    ledColor: 'vermelho',
    maintenanceReports: []
  },
  {
    id: 109,
    plant: 'P2',
    number: 'I',
    code: 'INJ-I',
    model: 'HAITIAN W 1600',
    tonnage: 160,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 110,
    plant: 'P2',
    number: 'J',
    code: 'INJ-J',
    model: 'TIANJIAN PL 1600',
    tonnage: 160,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 111,
    plant: 'P2',
    number: 'L',
    code: 'INJ-L',
    model: 'HAITIAN SA 1600 S',
    tonnage: 160,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 112,
    plant: 'P2',
    number: 'M',
    code: 'INJ-M',
    model: 'HAITIAN MA G 1600',
    tonnage: 160,
    technician: 'Kadu',
    ledColor: 'vermelho',
    maintenanceReports: []
  },
  {
    id: 113,
    plant: 'P2',
    number: 'N',
    code: 'INJ-N',
    model: 'HAITIAN MA 1600 I',
    tonnage: 160,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  },
  {
    id: 114,
    plant: 'P2',
    number: 'O',
    code: 'INJ-O',
    model: 'BORCHE BI 320M',
    tonnage: 320,
    technician: 'Kadu',
    ledColor: 'verde',
    maintenanceReports: []
  }
];
