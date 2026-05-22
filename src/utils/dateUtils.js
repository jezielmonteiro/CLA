export const converterDataParaDate = (dataString) => {
  if (!dataString) return null;
  const partes = dataString.split('/');
  if (partes.length !== 3) return null;
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const ano = parseInt(partes[2], 10);
  return new Date(ano, mes, dia);
};

export const formatarData = (texto) => {
  let numeros = texto.replace(/\D/g, '');
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
};

export const validarData = (data) => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(data)) return false;
  const [dia, mes, ano] = data.split('/');
  const dataObj = new Date(ano, mes - 1, dia);
  return dataObj.getDate() == dia && dataObj.getMonth() + 1 == mes && dataObj.getFullYear() == ano;
};