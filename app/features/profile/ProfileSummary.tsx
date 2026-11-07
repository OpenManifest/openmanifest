import * as React from 'react';
import { Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Button,
  IconButton,
  Menu,
  Row,
  Tappable,
  Text,
  useTheme,
  type MenuItem,
} from 'app/ui';
import { formatQuantity } from 'app/i18n/format';
import { ReadinessBadge } from 'app/features/people/PersonParts';
import { roleLabel, summaryOf } from 'app/features/people/people';
import type { Abilities, Profile } from './profile';

export type ProfileSummaryProps = {
  profile: Profile;
  abilities: Abilities;
  onEditDetails(): void;
  onEditMembership(): void;
  /** The guided form (certifications, qualifications, date of birth, equipment questions) */
  onWizard(): void;
  onRemove(): void;
  /** Changes the photo: absent for those who may not */
  onChangePhoto?(): void;
  testID?: string;
};

/**
 * Who the member is and whether they can fly: photo, name, role and certification, ready / expiring / blocked, how to
 * reach them and their body mass, with "Edit details" and the other actions the person looking may take.
 */
export default function ProfileSummary({
  profile,
  abilities,
  onEditDetails,
  onEditMembership,
  onWizard,
  onRemove,
  onChangePhoto,
  testID = 'profile-summary',
}: ProfileSummaryProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const { user } = profile;
  const name = user.name ?? '';
  const subtitle = [roleLabel(profile.role?.name), profile.certificationLevel?.name]
    .filter(Boolean)
    .join(' · ');

  const avatar = <Avatar name={name} imageUri={user.image} size="lg" />;
  const items: MenuItem[] = [];
  if (abilities.editMembership) {
    items.push({
      label: t('common:profile.action.membership'),
      icon: 'card-account-details-outline',
      testID: 'profile-action-membership',
      onPress: onEditMembership,
    });
  }
  if (abilities.editDetails) {
    items.push({
      label: t('common:profile.action.wizard'),
      icon: 'account-convert-outline',
      testID: 'profile-action-wizard',
      onPress: onWizard,
    });
  }
  if (abilities.remove) {
    items.push({
      label: t('common:profile.action.remove'),
      icon: 'account-off-outline',
      destructive: true,
      testID: 'profile-action-remove',
      onPress: onRemove,
    });
  }

  const contact = [
    user.email ? { key: 'email', label: user.email, url: `mailto:${user.email}` } : null,
    user.phone ? { key: 'phone', label: user.phone, url: `tel:${user.phone}` } : null,
  ].filter((entry): entry is { key: string; label: string; url: string } => !!entry);

  return (
    <View
      testID={testID}
      style={{
        gap: theme.space.md,
        padding: theme.space.lg,
        backgroundColor: theme.colour.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colour.border,
      }}
    >
      <Row gap="lg" align="center">
        {onChangePhoto ? (
          <Tappable
            role="button"
            aria-label={t('common:profile.photo')}
            testID={`${testID}-photo`}
            onPress={onChangePhoto}
          >
            {avatar}
          </Tappable>
        ) : (
          avatar
        )}
        <View style={{ flex: 1, gap: theme.space.xs }}>
          <Text variant="title" role="heading" aria-level={2} testID={`${testID}-name`}>
            {name}
          </Text>
          {user.nickname && user.nickname !== name ? (
            <Text tone="muted">{t('common:profile.nickname', { nickname: user.nickname })}</Text>
          ) : null}
          {subtitle ? <Text testID={`${testID}-role`}>{subtitle}</Text> : null}
          <Row>
            <ReadinessBadge summary={summaryOf(profile.eligibility)} testID={`${testID}-status`} />
          </Row>
        </View>
      </Row>

      <View style={{ gap: theme.space.xs }}>
        {contact.map((entry) => (
          <Tappable
            key={entry.key}
            role="link"
            aria-label={entry.label}
            testID={`${testID}-${entry.key}`}
            onPress={() => Linking.openURL(entry.url).catch(() => undefined)}
            style={{ alignSelf: 'flex-start', justifyContent: 'center' }}
          >
            <Text tone="brand">{entry.label}</Text>
          </Tappable>
        ))}
        {user.bodyMassKg ? (
          <Text tone="muted" testID={`${testID}-mass`}>
            {t('common:profile.bodyMass', {
              mass: formatQuantity(Number(user.bodyMassKg), 'mass'),
            })}
          </Text>
        ) : null}
      </View>

      {abilities.editDetails || items.length ? (
        <Row gap="sm" align="center" wrap>
          {abilities.editDetails ? (
            <Button
              variant="secondary"
              icon="pencil-outline"
              label={t('common:profile.action.edit')}
              testID={`${testID}-edit`}
              onPress={onEditDetails}
            />
          ) : null}
          {items.length ? (
            <Menu
              label={t('common:profile.action.more', { name })}
              items={items}
              trigger={
                <IconButton
                  icon="dots-vertical"
                  aria-label={t('common:profile.action.more', { name })}
                  testID={`${testID}-menu`}
                />
              }
            />
          ) : null}
        </Row>
      ) : null}
    </View>
  );
}
