import { converterDataParaDate } from './dateUtils';
import { COLORS } from './constants';

export const calcularStatusPorData = (validadeString) => {
  if (!validadeString) return 'Sem data';
  const dataValidade = converterDataParaDate(validadeString);
  if (!dataValidade) return 'Data inválida';
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  dataValidade.setHours(0, 0, 0, 0);
  const diffTime = dataValidade - hoje;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Vencida';
  if (diffDays === 0) return 'Vence hoje';
  if (diffDays <= 30) return `Vence em ${diffDays} dias`;
  return 'Válida';
};

export const getCorPorStatus = (status) => {
  if (!status) return COLORS.gray;
  if (status.includes('Vence') || status.includes('hoje')) return COLORS.warning;
  if (status.includes('Vencida')) return COLORS.danger;
  return COLORS.primary;
};

export const getSigla = (status) => {
  if (!status) return 'LIC';
  if (status.includes('Vence')) return 'VNC';
  if (status.includes('Vencida')) return 'VCD';
  if (status.includes('Válida')) return 'VAL';
  return status.substring(0, 3).toUpperCase();
};