import { useQuery } from '@apollo/client';
import { useIsFocused, useNavigation, useNavigationState, useRoute } from '@react-navigation/core';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { List, ProgressBar } from 'react-native-paper';

import EditScreenInfo from '../../../components/EditScreenInfo';
import NoResults from '../../../components/NoResults';
import { Text, View } from '../../../components/Themed';
import { Query } from '../../../graphql/schema';
import { useAppDispatch, useAppSelector, usersActions } from '../../../redux';



const QUERY_DROPZONE_USERS = gql`
  query QueryDropzoneUsersSearch(
    $dropzoneId: Int!
    $search: String
  ) {
    dropzone(id: $dropzoneId) {
      id
      name

      dropzoneUsers(search: $search) {
        edges {
          node {
            id
            role {
              id
              name
            }
            user {
              id
              name
            }
          }
        }
      }
    }
  }
`;
export default function UsersScreen() {
  const {global, usersScreen } = useAppSelector(state => state);
  const dispatch = useAppDispatch();

  const { data, loading } = useQuery<Query>(QUERY_DROPZONE_USERS, {
    variables: {
      dropzoneId: Number(global.currentDropzone?.id),
      search: usersScreen.searchText,
    }
  });

  const navigation = useNavigation();

  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (usersScreen.isSearchVisible) {
      dispatch(usersActions.setSearchVisible(false));
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <ProgressBar indeterminate color={global.theme.colors.accent} visible={loading} />
      
      { !data?.dropzone?.dropzoneUsers?.edges?.length && (
        <NoResults title="No users" subtitle="" />
      )}

      { data?.dropzone?.dropzoneUsers?.edges?.map((edge) =>
        <List.Item
          title={edge?.node?.user.name}
          description={edge?.node?.role?.name}
          left={() => <List.Icon icon="account" />}
          onPress={() => navigation.navigate("UserProfileScreen", { userId: edge?.node?.id })}
        />
      )}
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
