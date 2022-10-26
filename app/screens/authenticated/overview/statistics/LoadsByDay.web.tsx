import { subDays } from 'date-fns';
import * as React from 'react';
import ContributionGraph from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { LayoutChangeEvent, ViewProps } from 'react-native';
import { Card } from 'react-native-paper';

import './LoadsByDay.css';

interface ILoadsByDayProps extends Pick<ViewProps, 'style'> {
  data: { date: string; count: number }[];
  startTime: Date;
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
      <Card.Content style={{ height: dimensions.height - 75, width: dimensions.width - 32 }}>
        <ContributionGraph
          values={data}
          showMonthLabels
          classForValue={(value) => {
            if (!value?.count) {
              return 'none';
            }
            if (value.count > 3) {
              return 'many';
            }
            if (value.count < 3 && value.count > 0) {
              return 'few';
            }
            return 'none';
          }}
          horizontal
          titleForValue={(value) =>
            value?.date ? `${value?.date}: ${value?.count} loads` : 'No loads'
          }
          startDate={startTime || subDays(new Date(), 365)}
          endDate={new Date()}
        />
      </Card.Content>
    </Card>
  );
}
