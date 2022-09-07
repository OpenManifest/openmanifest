import * as React from 'react';
import { LayoutChangeEvent, ViewProps } from 'react-native';
import { ContributionGraph } from 'react-native-chart-kit';
import { Card } from 'react-native-paper';

interface ILoadsByDayProps extends Pick<ViewProps, 'style'> {
  data: { date: string; count: number }[];
  startTime?: Date;
}

export default function LoadsByDay(props: ILoadsByDayProps) {
  const { data, startTime, style } = props;
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    setDimensions(event.nativeEvent.layout);
    console.debug(event.nativeEvent.layout);
  }, []);
  return (
    <Card {...{ onLayout, style }}>
      <Card.Title title="Dispatched Loads" />
      <Card.Content>
        <ContributionGraph
          // values={data}
          values={[
            { date: '2022-08-10', count: 1 },
            { date: '2022-08-11', count: 6 },
            { date: '2022-08-19', count: 12 },
            { date: '2022-08-20', count: 2 },
            { date: '2022-08-23', count: 4 },
            { date: '2022-08-24', count: 6 },
            { date: '2022-08-29', count: 10 },
            { date: '2022-08-30', count: 10 },
            { date: '2022-08-30', count: 8 },
          ]}
          endDate={new Date()}
          numDays={90}
          height={(dimensions.height || 100) - 75}
          tooltipDataAttrs={(a) => ({})}
          showOutOfRangeDays
          width={(dimensions.width || 400) - 32}
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 2, // optional, defaults to 2dp
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffa726',
            },
          }}
        />
      </Card.Content>
    </Card>
  );
}
