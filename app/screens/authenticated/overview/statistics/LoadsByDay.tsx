import { differenceInDays } from 'date-fns';
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
          values={data}
          endDate={new Date()}
          numDays={differenceInDays(new Date(), startTime || new Date())}
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
