import { renderHook } from '@testing-library/react-native';
import useOpenUser from '../useOpenUser';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

describe('useOpenUser', () => {
  it('opens a screen of the User stack under People, with the list underneath', async () => {
    const { result } = await renderHook(() => useOpenUser());

    result.current('ProfileScreen', { userId: '12' });

    expect(mockNavigate).toHaveBeenCalledWith('Authenticated', {
      screen: 'Users',
      params: { screen: 'ProfileScreen', params: { userId: '12' }, initial: false },
    });
  });
});
