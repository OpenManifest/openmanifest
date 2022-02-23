import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Caption, Divider, Paragraph, Title, TouchableRipple } from 'react-native-paper';
import format from 'date-fns/format';
import color from 'color';
import { openURL } from 'expo-linking';
import { DropzoneUserProfileFragment } from 'app/api/operations';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import startCase from 'lodash/startCase';
import Menu, { MenuItem } from 'app/components/popover/Menu';

interface IUserHeader {
  dropzoneUser?: DropzoneUserProfileFragment;
  children?: React.ReactNode;
  variant?: 'dark' | 'light';
  onPressAvatar?(): void;
}

const badgesInitials = {
  [Permission.ActAsLoadMaster]: 'LM',
  [Permission.ActAsPilot]: 'Pilot',
  [Permission.ActAsRigInspector]: 'Rig.Insp',
  [Permission.ActAsGca]: 'GCA',
  [Permission.ActAsDzso]: 'DZSO',
};
export default function UserHeader(props: IUserHeader) {
  const { dropzoneUser, variant, children, onPressAvatar } = props;
  const { theme, palette } = useAppSelector((root) => root.global);
  const [isContactOpen, setContactOpen] = React.useState<boolean>(false);
  const canUpdateUser = useRestriction(Permission.UpdateUser);
  const dispatch = useAppDispatch();

  const textColor = variant === 'light' ? theme.colors.surface : theme.colors.onSurface;
  const primaryDark = color(theme.colors.primary).darken(0.3).hex();

  const actingPermissions = (
    dropzoneUser?.permissions?.filter((name) => /^actAs/.test(name)) || []
  ).map((str) => badgesInitials[str as keyof typeof badgesInitials]);
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.avatarContainer}>
        <View style={{ flex: 1 / 3, alignItems: 'center', justifyContent: 'center' }}>
          <TouchableRipple onPress={onPressAvatar}>
            {!dropzoneUser?.user?.image ? (
              <Avatar.Icon size={80} icon="account" />
            ) : (
              <Avatar.Image
                size={80}
                source={{ uri: dropzoneUser?.user.image }}
                style={{ backgroundColor: palette.primary.light }}
              />
            )}
          </TouchableRipple>
        </View>
        <View style={styles.titleContainer}>
          <Menu
            setOpen={setContactOpen}
            open={isContactOpen}
            anchor={
              <TouchableRipple onPress={() => setContactOpen(true)}>
                <Title style={[styles.title, { color: primaryDark, fontSize: 26 }]}>
                  {dropzoneUser?.user?.name}
                </Title>
              </TouchableRipple>
            }
          >
            <MenuItem
              onPress={() => {
                setContactOpen(false);
                // TODO: Send email
                if (dropzoneUser?.user.email) {
                  openURL(`mail:${dropzoneUser?.user.email}`);
                }
              }}
              icon="email"
              title={dropzoneUser?.user?.email}
            />
            <MenuItem
              onPress={() => {
                setContactOpen(false);
                if (dropzoneUser?.user.email) {
                  openURL(`tel:${dropzoneUser?.user.phone}`);
                }
              }}
              icon="phone"
              title={dropzoneUser?.user?.phone}
            />
            <MenuItem
              onPress={() => {
                setContactOpen(false);
                if (canUpdateUser && dropzoneUser) {
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
          <Divider style={{ width: '100%' }} />
          <Paragraph
            style={[
              styles.paragraph,
              { fontWeight: 'bold', fontSize: 14, paddingLeft: 4, color: textColor },
            ]}
          >
            {dropzoneUser?.role?.name?.replace('_', ' ').toUpperCase()}
            {actingPermissions.length ? (
              <Caption style={{ marginTop: 4 }}>
                {` ${actingPermissions.map(startCase).join(', ')}`}
              </Caption>
            ) : null}
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
