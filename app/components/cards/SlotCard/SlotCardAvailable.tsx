import * as React from 'react';
import { Card } from 'react-native-paper';

export default function SlotCardAvailable({ width }: { width: number }) {
  return (
    <Card
      style={{
        height: 150,
        opacity: 0.5,
        margin: 12,
        width,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      elevation={3}
    >
      <Card.Title
        title="Available"
        style={{ alignSelf: 'center', justifyContent: 'center', flex: 1 }}
        titleStyle={{ textAlign: 'center' }}
      />
    </Card>
  );
}
