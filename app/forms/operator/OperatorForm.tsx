import * as React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Control, Controller, useWatch } from 'react-hook-form';
import { COLOUR_PRESETS, Card, Skeleton, Stack, Subheader, Tappable, Text, useTheme } from 'app/ui';
import { useThemeOverrides } from 'app/theme';
import LottieView from 'app/components/LottieView';
import useImagePicker from 'app/hooks/useImagePicker';
import ColorPicker from 'app/components/input/colorpicker';
import { PhonePreview, WebPreview } from 'app/components/theme_preview';
import LocationPicker from 'app/components/input/LocationPicker';
import imagePickDark from 'assets/images/image-pick.json';
import imagePickLight from 'assets/images/image-pick-light.json';
import { FederationSelectField } from 'app/components/input/dropdown_select';
import { OperatorFields } from './useForm';
import { FormTextField } from 'app/components/input/text/TextField';
import { SwitchField } from 'app/components/input/switch/Switch';

const BANNER = 175;
const MAP_HEIGHT = 400;
const BLACK = COLOUR_PRESETS[0];

interface IOperatorForm {
  loading: boolean;
  control?: Control<OperatorFields>;
}
export default function OperatorForm(props: IOperatorForm) {
  const { t } = useTranslation('common');
  const { loading, control } = props;
  const theme = useTheme();
  const pickImage = useImagePicker();
  const { name, banner, primaryColor } = useWatch({ control });

  return (
    <Stack gap="lg">
      {loading ? (
        <Skeleton height={300} />
      ) : (
        <Card>
          <Stack gap="md" align="center">
            <Controller
              {...{ control }}
              name="banner"
              render={({ field: { onChange } }) => (
                <Tappable
                  role="button"
                  aria-label={t('forms.operator.changeBanner')}
                  minTarget={false}
                  onPress={async () => {
                    try {
                      const base64 = await pickImage();
                      if (base64) {
                        onChange(`data:image/jpeg;base64,${base64}`);
                      }
                    } catch {}
                  }}
                  style={{
                    width: BANNER,
                    height: BANNER,
                    borderRadius: theme.radius.pill,
                    overflow: 'hidden',
                  }}
                >
                  {!banner ? (
                    <LottieView
                      style={{ height: BANNER, width: BANNER }}
                      autoPlay
                      loop={false}
                      source={theme.isDark ? imagePickLight : imagePickDark}
                    />
                  ) : (
                    <Image
                      accessible={false}
                      source={{ uri: banner }}
                      style={{
                        width: BANNER,
                        height: BANNER,
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: theme.colour.border,
                        backgroundColor: theme.colour.brand,
                      }}
                    />
                  )}
                </Tappable>
              )}
            />
            <Text variant="title">{name}</Text>
            <Text variant="caption" tone="muted" align="center">
              {t('forms.operator.bannerHelp')}
            </Text>
          </Stack>
        </Card>
      )}

      {loading ? (
        <Skeleton height={300} />
      ) : (
        <Card>
          <Stack gap="md">
            <Subheader>{t('forms.operator.name')}</Subheader>
            <FormTextField {...{ control }} name="name" label={t('forms.operator.name')} />
            <FederationSelectField {...{ control }} name="federation" />
          </Stack>
        </Card>
      )}

      {loading ? (
        <Skeleton height={300} />
      ) : (
        <Card>
          <Stack gap="md">
            <Subheader>{t('forms.operator.location')}</Subheader>
            <View style={{ height: MAP_HEIGHT, overflow: 'hidden', borderRadius: theme.radius.md }}>
              <Controller
                {...{ control }}
                name="lat"
                render={({ field: latField }) => (
                  <Controller
                    {...{ control }}
                    name="lng"
                    render={({ field: lngField }) => (
                      <LocationPicker
                        value={
                          latField.value && lngField.value
                            ? { lat: latField.value, lng: lngField.value }
                            : undefined
                        }
                        onChange={(region) => {
                          lngField.onChange(region.latitude);
                          latField.onChange(region.longitude);
                        }}
                      />
                    )}
                  />
                )}
              />
            </View>
          </Stack>
        </Card>
      )}

      {loading ? (
        <Skeleton height={300} />
      ) : (
        <Card>
          <Stack gap="md">
            <Subheader>{t('forms.operator.branding')}</Subheader>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'flex-end',
                width: '100%',
              }}
            >
              <PhonePreview primaryColor={primaryColor || BLACK} />

              <WebPreview primaryColor={primaryColor || BLACK} />
            </View>
          </Stack>
        </Card>
      )}

      {loading ? (
        <Skeleton height={200} />
      ) : (
        <Controller
          {...{ control }}
          name="primaryColor"
          render={({ field: { onChange, value }, fieldState }) => (
            <ColorPicker
              title={t('forms.operator.primaryColor')}
              helperText={t('forms.operator.primaryColorIsUsedFor')}
              error={fieldState?.error?.message}
              onChange={(color) => {
                onChange(color);
                useThemeOverrides.getState().setPrimary(color);
              }}
              value={value || BLACK}
            />
          )}
        />
      )}

      {loading ? (
        <Skeleton height={150} />
      ) : (
        <Card>
          <Stack gap="sm">
            <SwitchField
              {...{ control }}
              label={t('forms.operator.membersCanBookThemselvesOn')}
              name="allowSelfManifest"
              helperText={t('forms.operator.whenOffOnlyManifestStaff')}
            />
            <SwitchField
              {...{ control }}
              label={t('forms.operator.requireCredits')}
              name="requireCredits"
              helperText={t('forms.operator.usersCannotManifestWithoutCredits')}
            />
            <SwitchField
              {...{ control }}
              label={t('forms.operator.manifestCanIgnoreRules')}
              name="allowManifestBypass"
              helperText={t('forms.operator.manifestCanBypassAllRules')}
            />
            <SwitchField
              {...{ control }}
              label={t('forms.operator.allowNegativeCredits')}
              name="allowNegativeCredits"
              helperText={t('forms.operator.allowUsersToGoInto')}
            />
            <SwitchField
              {...{ control }}
              label={t('forms.operator.requireLicense')}
              name="requireLicense"
              helperText={t('forms.operator.requireUsersToHaveA')}
            />
            <SwitchField
              {...{ control }}
              label={t('forms.operator.requireInDateMembership')}
              name="requireMembership"
              helperText={t('forms.operator.requireMembershipToBeIn')}
            />
            <SwitchField
              {...{ control }}
              label={t('forms.operator.requireEquipment')}
              name="requireEquipment"
              helperText={t('forms.operator.usersCannotManifestWithoutSelecting')}
            />
            <SwitchField
              {...{ control }}
              label={t('forms.operator.requireRigInspection')}
              name="requireRigInspection"
              helperText={t('forms.operator.usersCannotManifestBeforeTheir')}
            />
            <SwitchField
              {...{ control }}
              label={t('forms.operator.allowDoubleManifesting')}
              name="allowDoubleManifesting"
              helperText={t('forms.operator.usersAreAllowedToManifest')}
            />
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
