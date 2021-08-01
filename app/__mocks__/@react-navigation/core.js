module.exports = {
  ...jest.requireActual('@react-navigation/core'),
 useNavigation: () => jest.fn(),
 useIsFocused: jest.fn().mockReturnValue(false),
};
