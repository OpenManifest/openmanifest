import * as React from 'react';
import { Appbar, TextInput } from 'react-native-paper';
import { StackHeaderProps } from '@react-navigation/stack';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSelector } from 'app/state';

interface ISearchableAppBar extends StackHeaderProps {
  searchVisible: boolean;
  searchText: string;
  setSearchVisible(visible: boolean): void;
  onSearch(text: string): void;
}

function AppBar({
  navigation,
  onSearch,
  options,
  back,
  searchText,
  searchVisible,
  setSearchVisible,
}: ISearchableAppBar) {
  const { theme } = useAppSelector((root) => root.global);
  return (
    <Appbar.Header
      style={{ backgroundColor: theme.dark ? theme.colors.background : theme.colors.surface }}
    >
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      {searchVisible ? <Appbar.BackAction onPress={() => setSearchVisible(false)} /> : null}
      {searchVisible ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search users..."
            value={searchText || ''}
            onChangeText={(text) => onSearch(text)}
            autoFocus
          />
        </View>
      ) : (
        <Appbar.Content title={options.title} titleStyle={{ fontWeight: 'bold' }} />
      )}
      {searchVisible ? (
        <MaterialIcons
          name="close"
          onPress={() => setSearchVisible(!searchVisible)}
          color={theme.colors.text}
          size={24}
          style={styles.icon}
        />
      ) : (
        <MaterialIcons
          name="search"
          onPress={() => setSearchVisible(!searchVisible)}
          color={theme.colors.text}
          size={24}
          style={styles.icon}
        />
      )}
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexGrow: 1,
  },
  input: {
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    fontSize: 20,
  },
  icon: {
    marginHorizontal: 8,
  },
});

export default AppBar;
