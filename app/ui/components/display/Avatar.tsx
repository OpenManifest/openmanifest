import * as React from 'react';
import { Image, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import Text from '../Text';

export type AvatarSize = 'sm' | 'md' | 'lg';

export type AvatarProps = {
  /** Whose it is: names the image for screen readers and gives the initials */
  name: string;
  imageUri?: string | null;
  size?: AvatarSize;
  testID?: string;
};

const SIZE: Record<AvatarSize, number> = { sm: 32, md: 40, lg: 56 };

/** "Olive Owner" → "OO", "Cher" → "C": the first letters of the first two words */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0].toUpperCase())
    .join('');
}

/**
 * A person's photo, or their initials when there is none or it fails to load. It is an image named after them, so a
 * list that shows the name beside it can hide it (`aria-hidden`) and one that does not still says whose it is.
 */
export default function Avatar({ name, imageUri, size = 'md', testID }: AvatarProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const [failed, setFailed] = React.useState<string | null>(null);
  const showImage = !!imageUri && failed !== imageUri;
  const box = SIZE[size];

  return (
    <View
      role="img"
      aria-label={t('avatar.photoOf', { name })}
      testID={testID}
      style={{
        width: box,
        height: box,
        borderRadius: theme.radius.pill,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colour.brandSoft,
      }}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUri }}
          accessible={false}
          accessibilityIgnoresInvertColors
          onError={() => setFailed(imageUri)}
          style={{ width: box, height: box }}
          testID={testID ? `${testID}-image` : undefined}
        />
      ) : (
        <Text variant={size === 'lg' ? 'title' : 'label'} tone="onBrandSoft" tabular={false}>
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}
