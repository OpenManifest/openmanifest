import { useQuery } from '@apollo/client';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { List, Menu } from 'react-native-paper';

import { Text, View } from '../../../components/Themed';
import { Query } from '../../../graphql/schema';
import usePalette from '../../../hooks/usePalette';
import { useAppSelector } from '../../../redux';


interface IGetStartedProps {
  hasPlanes: boolean;
  hasTicketTypes: boolean;
  isPublic: boolean;
}
export default function GetStarted({
  hasPlanes,
  hasTicketTypes,
  isPublic,
}: IGetStartedProps) {
  const palette = usePalette();

  return (
      <View style={{ width: "70%"}}>
      <Text style={styles.title}>Set up dropzone</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <List.Item
          title="Create dropzone"
          left={
            () =>
              <List.Icon
                color={palette.success}
                icon="check"
              />
          }
        >
        </List.Item>
        <List.Item
          title="Add a plane"
          left={
            () =>
              !hasPlanes ?
                <List.Icon
                  color={palette.error}
                  icon="close"
                /> :
                <List.Icon
                  color={palette.success}
                  icon="check"
                />
          }
        />
        <List.Item
          title="Configure jump tickets"
          left={
            () =>
            !hasTicketTypes ?
              <List.Icon
                color={palette.error}
                icon="close"
              /> :
              <List.Icon
                color={palette.success}
                icon="check"
              />
          }
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
