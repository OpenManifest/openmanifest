import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'app/ui';

interface IDotsProps {
  count: number;
  index: number;
}

const DOT = 6;
const ACTIVE_DOT = 8;

/** Where the wizard is: one dot per page, the current one larger and in the brand colour */
export default function Dots(props: IDotsProps) {
  const { count, index } = props;
  const { t } = useTranslation('common');
  const theme = useTheme();

  return (
    <View
      role="progressbar"
      aria-label={t('wizard.progress', { step: index + 1, count })}
      aria-valuemin={1}
      aria-valuemax={count}
      aria-valuenow={index + 1}
      style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}
    >
      {Array.from({ length: count }).map((_, idx) => {
        const size = idx === index ? ACTIVE_DOT : DOT;
        return (
          <View
            key={`pagination-dot-${idx}`}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: idx === index ? theme.colour.brand : theme.colour.border,
            }}
          />
        );
      })}
    </View>
  );
}
