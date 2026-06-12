import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Header } from '../Header';

describe('Header Component', () => {
  it('deve renderizar o título e subtítulo corretamente', () => {
    const { getByText } = render(<Header onLogout={jest.fn()} />);
    
    expect(getByText('CLA')).toBeTruthy();
    expect(getByText('Controle de Licenças Ambientais')).toBeTruthy();
  });

  it('deve chamar onLogout ao clicar no botão de logout', () => {
    const mockLogout = jest.fn();
    const { getByTestId } = render(<Header onLogout={mockLogout} />);
    
    const logoutButton = getByTestId('logout-button');
    fireEvent.press(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
