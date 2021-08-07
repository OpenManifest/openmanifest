import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, IconButton, Menu, Paragraph, Title, TouchableRipple } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import format from 'date-fns/format';
import color from 'color';
import useRestriction from '../../../../hooks/useRestriction';
import { useAppDispatch, useAppSelector } from '../../../../state';
import { DropzoneUser, Permission } from '../../../../api/schema.d';

interface IUserHeader {
  dropzoneUser?: DropzoneUser;
  canEdit?: boolean;
  children?: React.ReactNode;
  variant?: 'dark' | 'light';
  onPressAvatar?(): void;
  onEdit?(): void;
}
export default function UserHeader(props: IUserHeader) {
  const { dropzoneUser, variant, onEdit, canEdit, children, onPressAvatar } = props;
  const { theme } = useAppSelector((root) => root.global);
  const [isContactOpen, setContactOpen] = React.useState<boolean>(false);
  const canUpdateUser = useRestriction(Permission.UpdateUser);
  const dispatch = useAppDispatch();

  const textColor = variant === 'light' ? theme.colors.surface : theme.colors.onSurface;
  const primaryDark = color(theme.colors.primary).darken(0.3).hex();

  return (
    <View style={styles.container}>
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
          <Menu
            onDismiss={() => setContactOpen(false)}
            visible={isContactOpen}
            anchor={
              <TouchableRipple onPress={() => setContactOpen(true)}>
                <Title style={[styles.title, { color: primaryDark }]}>
                  {dropzoneUser?.user?.name}
                </Title>
              </TouchableRipple>
            }
          >
            <Menu.Item
              onPress={() => {
                setContactOpen(false);
                // TODO: Send email
              }}
              icon="email"
              title={dropzoneUser?.user?.email}
            />
            <Menu.Item
              onPress={() => {
                setContactOpen(false);
                // TODO: Call phone
              }}
              icon="phone"
              title={dropzoneUser?.user?.phone}
            />
            <Menu.Item
              onPress={() => {
                setContactOpen(false);
                if (canUpdateUser) {
                  dispatch(actions.forms.dropzoneUser.setOpen(dropzoneUser));
                }
              }}
              icon="card-account-details-star-outline"
              title={
                !dropzoneUser?.expiresAt
                  ? 'Not a member'
                  : format((dropzoneUser?.expiresAt || 0) * 1000, 'yyyy/MM/dd')
              }
            />
          </Menu>

          <Paragraph style={[styles.paragraph, { color: textColor }]}>
            {dropzoneUser?.role?.name?.replace('_', ' ').toUpperCase()}
          </Paragraph>
        </View>
      </View>

      {children}
    </View>
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
