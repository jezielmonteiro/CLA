import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useLicenses } from '../useLicenses';
import { loadLicencas, saveLicenca, deleteLicenca } from '../../services/storage';

// Mock do módulo de storage
jest.mock('../../services/storage', () => ({
  loadLicencas: jest.fn(),
  saveLicenca: jest.fn(),
  deleteLicenca: jest.fn(),
}));

describe('useLicenses hook', () => {
  const mockLicencas = [
    {
      id: '1',
      projeto: 'Reflorestamento',
      validade: '12/12/2026',
      nome: 'LI',
      tipoLicenca: 'Instalação',
      empresa: 'Ambiente SA',
      status: 'Válida',
      cor: '#296959',
      sigla: 'VAL',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-06-03T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve iniciar com estado padrão e carregar dados com sucesso', async () => {
    loadLicencas.mockResolvedValueOnce(mockLicencas);

    const { result } = renderHook(() => useLicenses());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.licencas).toEqual([]);

    await act(async () => {
      await result.current.loadData();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.licencas).toHaveLength(1);
    expect(result.current.licencas[0].projeto).toBe('Reflorestamento');
    expect(result.current.licencas[0].status).toBe('Válida'); // 12/12/2026 > 03/06/2026
    expect(loadLicencas).toHaveBeenCalledTimes(1);
  });

  it('deve lidar com erros ao carregar dados', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    loadLicencas.mockRejectedValueOnce(new Error('Erro no Firebase'));

    const { result } = renderHook(() => useLicenses());

    await act(async () => {
      await result.current.loadData();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.licencas).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('deve adicionar uma nova licença com sucesso', async () => {
    loadLicencas.mockResolvedValueOnce([]);
    const novaLicenca = {
      projeto: 'Novo Projeto',
      validade: '03/06/2026',
      nome: 'LP',
    };
    const savedLicenca = { ...novaLicenca, id: '2' };
    saveLicenca.mockResolvedValueOnce(savedLicenca);

    const { result } = renderHook(() => useLicenses());

    // Inicializa carregando a lista vazia
    await act(async () => {
      await result.current.loadData();
    });

    let success;
    await act(async () => {
      success = await result.current.adicionarOuEditar(novaLicenca, null, { latitude: 1, longitude: 2 });
    });

    expect(success).toBe(true);
    expect(saveLicenca).toHaveBeenCalledWith({
      ...novaLicenca,
      status: 'Vence hoje',
      cor: '#f59e0b',
      sigla: 'VNC',
      coordinates: { latitude: 1, longitude: 2 },
    });
    expect(result.current.licencas).toHaveLength(1);
    expect(result.current.licencas[0].id).toBe('2');
    expect(result.current.licencas[0].status).toBe('Vence hoje');
  });

  it('deve editar uma licença existente com sucesso', async () => {
    const itemExistente = {
      id: '1',
      projeto: 'Reflorestamento Antigo',
      validade: '12/12/2026',
      nome: 'LI',
      coordinates: { latitude: 10, longitude: 20 },
    };
    loadLicencas.mockResolvedValueOnce([itemExistente]);

    const { result } = renderHook(() => useLicenses());

    await act(async () => {
      await result.current.loadData();
    });

    const dadosEditados = {
      projeto: 'Reflorestamento Atualizado',
      validade: '12/12/2026',
      nome: 'LI',
    };
    const itemSalvo = { ...dadosEditados, id: '1', coordinates: { latitude: 10, longitude: 20 } };
    saveLicenca.mockResolvedValueOnce(itemSalvo);

    let success;
    await act(async () => {
      success = await result.current.adicionarOuEditar(dadosEditados, itemExistente, null);
    });

    expect(success).toBe(true);
    expect(saveLicenca).toHaveBeenCalledWith({
      id: '1',
      projeto: 'Reflorestamento Atualizado',
      validade: '12/12/2026',
      nome: 'LI',
      status: 'Válida',
      cor: '#296959',
      sigla: 'VAL',
      coordinates: { latitude: 10, longitude: 20 },
    });
    expect(result.current.licencas[0].projeto).toBe('Reflorestamento Atualizado');
  });

  it('deve exibir um alerta se salvar falhar', async () => {
    saveLicenca.mockResolvedValueOnce(null);
    const alertSpy = jest.spyOn(Alert, 'alert');

    const { result } = renderHook(() => useLicenses());

    let success;
    await act(async () => {
      success = await result.current.adicionarOuEditar({ projeto: 'Falha' }, null, null);
    });

    expect(success).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith('Erro', 'Não foi possível salvar as alterações');
    alertSpy.mockRestore();
  });

  it('deve exibir alerta de confirmação e excluir licença com sucesso', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    deleteLicenca.mockResolvedValueOnce(true);

    const itemDeletar = {
      id: '1',
      projeto: 'Deletar Projeto',
      validade: '12/12/2026',
    };
    loadLicencas.mockResolvedValueOnce([itemDeletar]);

    const { result } = renderHook(() => useLicenses());

    await act(async () => {
      await result.current.loadData();
    });

    // Chama excluir
    act(() => {
      result.current.excluir('1');
    });

    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy.mock.calls[0][0]).toBe('Excluir');
    expect(alertSpy.mock.calls[0][1]).toBe('Tem certeza?');

    // Simula a confirmação do botão "Excluir" no Alert nativo
    const botoes = alertSpy.mock.calls[0][2];
    const botaoExcluir = botoes.find(b => b.text === 'Excluir');

    await act(async () => {
      await botaoExcluir.onPress();
    });

    expect(deleteLicenca).toHaveBeenCalledWith('1');
    expect(result.current.licencas).toHaveLength(0);

    alertSpy.mockRestore();
  });
});
