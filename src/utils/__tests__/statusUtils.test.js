import { calcularStatusPorData, getCorPorStatus, getSigla } from '../statusUtils';
import { COLORS } from '../constants';

describe('statusUtils', () => {
  beforeEach(() => {
    // Congela a data do sistema para tornar o cálculo de status determinístico
    jest.useFakeTimers().setSystemTime(new Date('2026-06-03T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('calcularStatusPorData', () => {
    it('deve retornar "Sem data" se nenhuma data for fornecida', () => {
      expect(calcularStatusPorData(null)).toBe('Sem data');
      expect(calcularStatusPorData(undefined)).toBe('Sem data');
    });

    it('deve retornar "Data inválida" se a data for mal formatada', () => {
      expect(calcularStatusPorData('invalid-date')).toBe('Data inválida');
    });

    it('deve retornar "Vencida" se a data for no passado', () => {
      expect(calcularStatusPorData('02/06/2026')).toBe('Vencida');
    });

    it('deve retornar "Vence hoje" se a data for o dia atual', () => {
      expect(calcularStatusPorData('03/06/2026')).toBe('Vence hoje');
    });

    it('deve retornar "Vence em X dias" se a data vencer dentro de 30 dias', () => {
      expect(calcularStatusPorData('13/06/2026')).toBe('Vence em 10 dias');
      expect(calcularStatusPorData('03/07/2026')).toBe('Vence em 30 dias');
    });

    it('deve retornar "Válida" se a data vencer em mais de 30 dias', () => {
      expect(calcularStatusPorData('04/07/2026')).toBe('Válida');
    });
  });

  describe('getCorPorStatus', () => {
    it('deve retornar a cor cinza para status nulo ou indefinido', () => {
      expect(getCorPorStatus(null)).toBe(COLORS.gray);
      expect(getCorPorStatus('')).toBe(COLORS.gray);
    });

    it('deve retornar a cor de alerta para status que contêm "Vence" ou "hoje"', () => {
      expect(getCorPorStatus('Vence hoje')).toBe(COLORS.warning);
      expect(getCorPorStatus('Vence em 15 dias')).toBe(COLORS.warning);
    });

    it('deve retornar a cor de perigo para status "Vencida"', () => {
      expect(getCorPorStatus('Vencida')).toBe(COLORS.danger);
    });

    it('deve retornar a cor primária para outros status (ex: Válida)', () => {
      expect(getCorPorStatus('Válida')).toBe(COLORS.primary);
    });
  });

  describe('getSigla', () => {
    it('deve retornar "LIC" por padrão se o status for vazio', () => {
      expect(getSigla(null)).toBe('LIC');
      expect(getSigla('')).toBe('LIC');
    });

    it('deve retornar "VNC" para status que contêm "Vence"', () => {
      expect(getSigla('Vence em 5 dias')).toBe('VNC');
      expect(getSigla('Vence hoje')).toBe('VNC');
    });

    it('deve retornar "VCD" para status "Vencida"', () => {
      expect(getSigla('Vencida')).toBe('VCD');
    });

    it('deve retornar "VAL" para status "Válida"', () => {
      expect(getSigla('Válida')).toBe('VAL');
    });

    it('deve retornar as três primeiras letras em maiúsculo para status personalizados', () => {
      expect(getSigla('Pendente')).toBe('PEN');
    });
  });
});
