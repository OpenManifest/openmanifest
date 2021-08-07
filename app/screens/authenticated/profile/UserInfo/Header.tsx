import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, IconButton, Paragraph, Title, TouchableRipple } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector } from '../../../../state';
import { DropzoneUser } from '../../../../api/schema';

interface IUserHeader {
  dropzoneUser?: DropzoneUser;
  canEdit?: boolean;
  children?: React.ReactNode;
  onPressAvatar?(): void;
  onEdit?(): void;
}
export default function UserHeader(props: IUserHeader) {
  const { dropzoneUser, onEdit, canEdit, children, onPressAvatar } = props;
  const { theme } = useAppSelector((root) => root.global);

  return (
    <LinearGradient
      start={{ x: 0.0, y: 0.25 }}
      end={{ x: 0.5, y: 0.75 }}
      style={styles.container}
      colors={[
        theme.dark ? theme.colors.surface : theme.colors.accent,
        theme.dark ? theme.colors.surface : theme.colors.surface,
      ]}
    >
      <View style={styles.actions}>
        {!canEdit ? null : (
          <IconButton
            icon="pencil"
            size={20}
            color={theme.colors.surface}
            onPress={() => (onEdit ? onEdit() : null)}
          />
        )}
      </View>
      <View style={styles.avatarContainer}>
        <View style={{ flex: 1 / 3 }}>
          <TouchableRipple onPress={onPressAvatar}>
            {!dropzoneUser?.user?.image ? (
              <Avatar.Icon
                size={80}
                icon="account"
                color={theme.dark ? theme.colors.text : theme.colors.primary}
                style={{ backgroundColor: theme.colors.surface }}
              />
            ) : (
              <Avatar.Image
                size={80}
                source={{ uri: dropzoneUser?.user.image }}
                style={{ backgroundColor: theme.colors.surface }}
              />
            )}
          </TouchableRipple>
        </View>
        <View style={styles.titleContainer}>
          <Title style={styles.title}>{dropzoneUser?.user?.name}</Title>
          <Paragraph style={styles.paragraph}>
            {dropzoneUser?.role?.name?.replace('_', ' ').toUpperCase()}
          </Paragraph>
        </View>
      </View>

      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 16,
  },
  actions: {
    position: 'absolute',
    top: 0,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
    marginBottom: 16,
  },
  titleContainer: {
    paddingLeft: 32,
    paddingTop: 16,
    flex: 2 / 3,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
  },
  paragraph: {
    color: 'white',
  },
});
