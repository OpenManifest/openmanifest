import * as React from 'react';
import { Appbar, TextInput } from 'react-native-paper';
import { StackHeaderProps } from '@react-navigation/stack';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ISearchableAppBar extends StackHeaderProps {
  searchVisible: boolean;
  searchText: string;
  setSearchVisible(visible: boolean): void;
  onSearch(text: string): void;
}

function AppBar({
  navigation,
  previous,
  scene,
  onSearch,
  searchText,
  searchVisible,
  setSearchVisible,
}: ISearchableAppBar) {
  return (
    <Appbar.Header>
      {previous ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      {searchVisible ? <Appbar.BackAction onPress={() => setSearchVisible(false)} /> : null}
      {searchVisible ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={searchText}
            onChangeText={(text) => onSearch(text)}
            autoFocus
          />
        </View>
      ) : (
        <Appbar.Content
          title={scene.descriptor.options.title}
          titleStyle={{ fontWeight: 'bold' }}
        />
      )}
      <MaterialIcons
        name="search"
        onPress={() => setSearchVisible(!searchVisible)}
        color="#FFFFFF"
        size={24}
        style={styles.icon}
      />
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexGrow: 1,
  },
  input: {
    backgroundColor: 'transparent',
    height: '100%',
    color: '#FFFFFF',
    fontSize: 20,
  },
  icon: {
    marginHorizontal: 8,
  },
});

export default AppBar;
