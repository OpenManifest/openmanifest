module.exports = {
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => jest.fn(),
  useIsFocused: jest.fn().mockReturnValue(false),
};
