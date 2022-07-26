import { differenceInDays } from 'date-fns';
import * as React from 'react';
import ContributionGraph from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

import './LoadsByDay.css';

interface ILoadsByDayProps {
  data: { date: string; count: number }[];
  startTime: Date;
}

export default function LoadsByDay(props: ILoadsByDayProps) {
  const { data, startTime } = props;
  console.debug({ data });
  return (
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
      startDate={startTime}
      endDate={new Date()}
      numDays={differenceInDays(new Date(), startTime || new Date())}
    />
  );
}
