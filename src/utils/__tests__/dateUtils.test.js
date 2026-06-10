import { converterDataParaDate, formatarData, validarData } from '../dateUtils';

describe('dateUtils', () => {
  describe('converterDataParaDate', () => {
    it('deve converter uma string de data formato DD/MM/AAAA para um objeto Date', () => {
      const data = converterDataParaDate('25/12/2026');
      expect(data).toBeInstanceOf(Date);
      expect(data.getDate()).toBe(25);
      expect(data.getMonth()).toBe(11); // Dezembro é 11
      expect(data.getFullYear()).toBe(2026);
    });

    it('deve retornar null se a string de data for nula ou indefinida', () => {
      expect(converterDataParaDate(null)).toBeNull();
      expect(converterDataParaDate(undefined)).toBeNull();
      expect(converterDataParaDate('')).toBeNull();
    });

    it('deve retornar null se a string de data estiver em formato incorreto', () => {
      expect(converterDataParaDate('2026-12-25')).toBeNull();
      expect(converterDataParaDate('12/2026')).toBeNull();
      expect(converterDataParaDate('25')).toBeNull();
    });
  });

  describe('formatarData', () => {
    it('deve formatar números em formato de data conforme a digitação', () => {
      expect(formatarData('2')).toBe('2');
      expect(formatarData('25')).toBe('25');
      expect(formatarData('251')).toBe('25/1');
      expect(formatarData('2512')).toBe('25/12');
      expect(formatarData('251220')).toBe('25/12/20');
      expect(formatarData('25122026')).toBe('25/12/2026');
    });

    it('deve remover caracteres que não sejam dígitos', () => {
      expect(formatarData('25a/12b/2026c')).toBe('25/12/2026');
    });
  });

  describe('validarData', () => {
    it('deve retornar true para datas válidas', () => {
      expect(validarData('25/12/2026')).toBe(true);
      expect(validarData('29/02/2024')).toBe(true); // Ano bissexto
    });

    it('deve retornar false para datas com formato inválido', () => {
      expect(validarData('25-12-2026')).toBe(false);
      expect(validarData('25/12/26')).toBe(false);
      expect(validarData('invalid')).toBe(false);
    });

    it('deve retornar false para dias ou meses inválidos', () => {
      expect(validarData('32/12/2026')).toBe(false); // Dia 32
      expect(validarData('25/13/2026')).toBe(false); // Mês 13
      expect(validarData('29/02/2025')).toBe(false); // Fevereiro 29 em ano não-bissexto
      expect(validarData('31/04/2026')).toBe(false); // Abril tem 30 dias
    });
  });
});
