import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, ListRow, StatusBadge, useTheme, type StatusKey } from 'app/ui';
import { formatDate } from 'app/i18n/format';
import Section from './Section';
import { qualificationState, type ProfileCertification } from './profile';

const QUALIFICATION_STATUS = { current: 'ok', expiring: 'warning', expired: 'blocked' } as const;

export type CertificationsSectionProps = {
  certifications: readonly ProfileCertification[];
  /** The certification that counts at this operator: listed first and marked */
  currentId?: string | null;
  /** Updates them (the guided form): absent for those who may not */
  onUpdate?(): void;
  testID?: string;
};

/**
 * The member's certifications (body, level, number, whether verified) and the qualifications under each (number,
 * expiry, current or not), the one that counts at this operator first.
 */
export default function CertificationsSection({
  certifications,
  currentId,
  onUpdate,
  testID = 'profile-certifications',
}: CertificationsSectionProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const term = t('terms:certification', { count: 2 });
  const ordered = [...certifications].sort(
    (a, b) => Number(b.id === currentId) - Number(a.id === currentId)
  );

  return (
    <Section
      title={t('common:profile.certifications.title', { certifications: term })}
      list
      testID={testID}
      action={
        onUpdate ? (
          <Button
            variant="secondary"
            icon="pencil-outline"
            label={t('common:profile.certifications.update')}
            aria-label={t('common:profile.certifications.updateLabel', {
              certifications: term.toLowerCase(),
            })}
            testID={`${testID}-update`}
            onPress={onUpdate}
          />
        ) : undefined
      }
    >
      {!ordered.length ? (
        <EmptyState
          testID={`${testID}-empty`}
          icon="card-account-details-outline"
          title={t('common:profile.certifications.empty', { certifications: term.toLowerCase() })}
          body={t('common:profile.certifications.emptyBody')}
        />
      ) : (
        ordered.map((certification) => {
          const title = [
            certification.certificationBody.name,
            certification.certificationLevel?.name,
          ]
            .filter(Boolean)
            .join(' · ');
          const supporting = [
            certification.number
              ? t('common:profile.certifications.number', { number: certification.number })
              : null,
            certification.verifiedAt
              ? t('common:profile.certifications.verified', {
                  date: formatDate(certification.verifiedAt),
                })
              : t('common:profile.certifications.notVerified'),
            certification.id === currentId ? t('common:profile.certifications.here') : null,
          ]
            .filter(Boolean)
            .join(' · ');
          return (
            <View key={certification.id} testID={`${testID}-${certification.id}`}>
              <ListRow title={title} supporting={supporting} />
              <View style={{ paddingLeft: theme.space.lg }}>
                {(certification.qualifications ?? []).map((qualification) => {
                  const state = qualificationState(qualification);
                  const status: StatusKey = QUALIFICATION_STATUS[state];
                  const name = qualification.name || qualification.qualification.name || '';
                  return (
                    <ListRow
                      key={qualification.id}
                      testID={`${testID}-qualification-${qualification.id}`}
                      title={name}
                      supporting={[
                        qualification.number
                          ? t('common:profile.certifications.number', {
                              number: qualification.number,
                            })
                          : null,
                        qualification.expiresAt
                          ? t(`common:profile.certifications.expires.${state}`, {
                              date: formatDate(qualification.expiresAt),
                            })
                          : t('common:profile.certifications.noExpiry'),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                      trailing={
                        <StatusBadge
                          status={status}
                          label={t(`common:profile.certifications.state.${state}`)}
                        />
                      }
                    />
                  );
                })}
              </View>
            </View>
          );
        })
      )}
    </Section>
  );
}
