import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, IconButton, Paragraph, Title, TouchableRipple } from 'react-native-paper';

import { useAppSelector } from '../../../../redux';
import { DropzoneUser } from '../../../../graphql/schema';


interface IUserHeader {
  dropzoneUser?: DropzoneUser;
  canEdit?: boolean;
  children?: React.ReactNode;
  onPressAvatar?(): void;
  onEdit?(): void;
}
export default function UserHeader(props: IUserHeader) {
  const { dropzoneUser, onEdit, canEdit, children, onPressAvatar } = props;
  const { theme } = useAppSelector(state => state.global);
  return (
      <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.actions}>
        {
          !canEdit ? null : (
            <IconButton
              icon="pencil"
              size={20}
              color={theme.colors.surface}
              onPress={() => onEdit ? onEdit() : null}
            />
          )}
        </View>
        <View style={styles.avatarContainer}>
          <View style={{ flex: 1/3 }}>
            <TouchableRipple onPress={onPressAvatar}>
              {
                !dropzoneUser?.user?.image
                ? <Avatar.Icon
                    size={80}
                    icon="account"
                    color={theme.colors.primary}
                    style={{ backgroundColor: theme.colors.surface }}
                  />
                : <Avatar.Image
                    size={80}
                    source={{ uri: dropzoneUser?.user.image }}
                    style={{ backgroundColor: theme.colors.surface }}
                  />
              }
            </TouchableRipple>
          </View>
          <View style={styles.titleContainer}>
            <Title style={styles.title}>{dropzoneUser?.user?.name}</Title>
            <Paragraph style={styles.paragraph}>{dropzoneUser?.role?.name?.replace('_', ' ').toUpperCase()}</Paragraph>
          </View>
        </View>

        {children}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 16
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleContainer: {
    paddingLeft: 48,
    flex: 2/3,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  title: {
    color: "white"
  },
  paragraph: {
    color: "white"
  }
});
