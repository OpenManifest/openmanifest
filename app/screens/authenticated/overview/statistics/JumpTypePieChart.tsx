import { chartConfig } from 'app/constants/ChartConfig';
import { sortBy } from 'lodash';
import * as React from 'react';
import { LayoutChangeEvent, ViewProps } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Card } from 'react-native-paper';

interface IJumpTypePieChart extends Pick<ViewProps, 'style'> {
  data: { name: string; count: number }[];
}

const JUMP_TYPE_COLORS = {
  angle: '#AA0000',
  cam: '#FFAA00',
  ws: '#AAFF00',
  hnp: '#ABABFF',
  hp: '#BAFFBA',
  fs: '#DD00FF',
  freefly: '#00ABFF',
};

export default function LoadsByDay(props: IJumpTypePieChart) {
  const { data: values, style } = props;
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    setDimensions(event.nativeEvent.layout);
    console.debug(event.nativeEvent.layout);
  }, []);

  const data = React.useMemo(
    () =>
      sortBy(values, 'count').map<{
        name: string;
        count: number;
        legendFontColor: string;
        legendFontSize: number;
        color: string;
      }>((stat) => ({
        ...stat,
        color:
          stat?.name && stat?.name in JUMP_TYPE_COLORS
            ? JUMP_TYPE_COLORS[stat.name as keyof typeof JUMP_TYPE_COLORS]
            : '#AAA',
        legendFontColor: '#333',
        legendFontSize: 15,
      })),
    [values]
  );
  return (
    <Card {...{ onLayout, style }}>
      <Card.Title title="Jump types" />
      <Card.Content style={{ height: 300 }}>
        <PieChart
          {...{ data, chartConfig }}
          width={(dimensions.width || 400) - 32}
          height={(dimensions.height || 200) - 75}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[0, 0]}
          absolute={false}
        />
      </Card.Content>
    </Card>
  );
}
