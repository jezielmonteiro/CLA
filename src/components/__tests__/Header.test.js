import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Header } from '../Header';

jest.mock('../../config/firebase', () => ({
  auth: { currentUser: { uid: '123', email: 'test@test.com' } },
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
}));

describe('Header Component', () => {
  it('deve renderizar o título e subtítulo corretamente', () => {
    const { getByText } = render(<Header />);

    expect(getByText('CLA')).toBeTruthy();
    expect(getByText('Controle de Licenças Ambientais')).toBeTruthy();
  });

  it('deve chamar onProfilePress ao clicar no botão de perfil', () => {
    const mockProfilePress = jest.fn();
    const { getByTestId } = render(<Header onProfilePress={mockProfilePress} />);

    const profileButton = getByTestId('profileButton');
    fireEvent.press(profileButton);

    expect(mockProfilePress).toHaveBeenCalledTimes(1);
  });
});
