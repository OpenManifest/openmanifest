import * as React from 'react';
import { useOperatorContext } from 'app/providers/operator/context';
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
import { CertificationBodyChipSelectField } from 'app/components/input/chip_select';
import { OperatorFields } from './useForm';
import { FormTextField } from 'app/components/input/text/TextField';

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
  const {
    operator: { operator },
  } = useOperatorContext();

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
            <CertificationBodyChipSelectField
              {...{ control }}
              name="certificationBodies"
              industry={operator?.industry}
            />
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
    </Stack>
  );
}
