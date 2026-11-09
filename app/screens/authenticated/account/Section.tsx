import * as React from 'react';
import { Text, View } from 'react-native';
import { useStyles } from 'app/ui';

/** A titled group of rows (a stand-in for the section of U2.4) */
export default function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const styles = useStyles((t) => ({
    section: { gap: t.space.xs },
    title: { ...t.type.label, color: t.colour.textMuted, paddingHorizontal: t.space.lg },
    rows: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: t.colour.border },
  }));

  return (
    <View role="group" aria-label={title} style={styles.section}>
      <Text role="heading" aria-level={2} style={styles.title}>
        {title}
      </Text>
      <View style={styles.rows}>{children}</View>
    </View>
  );
}
