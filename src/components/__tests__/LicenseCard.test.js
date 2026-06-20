import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LicenseCard } from '../LicenseCard';

const mockItem = {
  id: '123',
  projeto: 'Reflorestamento Local',
  numeroLicenca: '2026-999',
  nome: 'Licença Prévia',
  tipoLicenca: 'Prévia',
  empresa: 'EcoGlow Ltda',
  dataEmissao: '01/05/2026',
  validade: '01/06/2026',
  cor: '#f59e0b',
  sigla: 'VNC',
  fotoUri: 'file://path/to/photo.jpg',
};

describe('LicenseCard Component', () => {
  it('deve renderizar os detalhes da licença e a foto corretamente', () => {
    const { getByText, getByRole, queryByText } = render(
      <LicenseCard
        item={mockItem}
        onPress={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(getByText('Reflorestamento Local')).toBeTruthy();
    expect(getByText('Proc. Nº 2026-999 • Licença Prévia')).toBeTruthy();
    expect(getByText('Fase: Prévia')).toBeTruthy();
    expect(getByText('Com condicionantes')).toBeTruthy();
    expect(getByText('01/05/2026')).toBeTruthy();
    expect(getByText('Vence: 01/06/2026')).toBeTruthy();
    expect(getByText('VNC')).toBeTruthy();
    expect(queryByText('Sem foto')).toBeNull();
  });

  it('deve exibir um placeholder "Sem foto" quando fotoUri for ausente', () => {
    const itemSemFoto = { ...mockItem, fotoUri: null };
    const { getByText } = render(
      <LicenseCard
        item={itemSemFoto}
        onPress={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(getByText('Sem foto')).toBeTruthy();
  });

  it('deve disparar onPress ao clicar no card', () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <LicenseCard
        item={mockItem}
        onPress={mockPress}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    // Clica no projeto para acionar o card inteiro (TouchableOpacity)
    fireEvent.press(getByText('Reflorestamento Local'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it('deve disparar onEdit e onDelete ao pressionar os botões de ação do swipe', () => {
    const mockEdit = jest.fn();
    const mockDelete = jest.fn();

    const { getByText } = render(
      <LicenseCard
        item={mockItem}
        onPress={jest.fn()}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    );

    const editButton = getByText('Editar');
    const deleteButton = getByText('Excluir');

    fireEvent.press(editButton);
    expect(mockEdit).toHaveBeenCalledTimes(1);

    fireEvent.press(deleteButton);
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });
});
