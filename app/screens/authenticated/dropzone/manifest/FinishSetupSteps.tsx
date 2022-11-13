import { StyleSheet } from 'react-native';
import * as React from 'react';
import { Avatar, Card, List } from 'react-native-paper';
import { useDropzoneContext } from 'app/providers';
import { FlatList } from 'react-native-gesture-handler';
import { useAircrafts, useTickets } from 'app/api/crud';

interface ISetupStepCard {
  completed?: boolean;
  index?: number;
  title: string;
  description?: string;
  onPress(): void;
}

enum SetupStep {
  Aircraft,
  Tickets,
}

export function SetupStepCard(props: ISetupStepCard) {
  const { completed, index, title, description, onPress } = props;
  return (
    <Card
      style={StyleSheet.flatten([styles.card, { opacity: completed ? 0.7 : 1 }])}
      {...{ onPress }}
      pointerEvents={completed ? 'none' : undefined}
    >
      <Card.Content style={styles.content}>
        <List.Item
          {...{ title, description }}
          titleStyle={{ marginBottom: 4 }}
          left={() =>
            completed ? <Avatar.Icon icon="check" /> : <Avatar.Text label={`${index}`} />
          }
          right={(rightProps) => (
            <List.Icon {...rightProps} icon="chevron-right" style={styles.icon} />
          )}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, borderRadius: 8 },
  content: { paddingHorizontal: 4, paddingVertical: 4 },
  icon: { alignSelf: 'center' },
});
