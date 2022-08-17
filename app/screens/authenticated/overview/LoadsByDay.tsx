import { differenceInDays } from 'date-fns';
import * as React from 'react';
import { ContributionGraph } from 'react-native-chart-kit';

interface ILoadsByDayProps {
  data: { date: string; count: number }[];
  startTime?: Date;
}

export default function LoadsByDay(props: ILoadsByDayProps) {
  const { data, startTime } = props;
  return (
    <ContributionGraph
      values={data}
      endDate={new Date()}
      numDays={differenceInDays(startTime || new Date(), new Date())}
      height={100}
      tooltipDataAttrs={(a) => ({})}
      width={300}
      chartConfig={{
        backgroundColor: '#e26a00',
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
  );
}
