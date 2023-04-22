import * as React from 'react';
import { Animated, Platform } from 'react-native';
import diff from 'date-fns/differenceInSeconds';
import secondsToMinutes from 'date-fns/secondsToMinutes';
import CountdownCircleTimer from './CountdownTimer';

interface ICountdownProps {
  end: Date;
  variant?: 'dark' | 'light';
  size?: number;
}
export default function Countdown(props: ICountdownProps) {
  const { end, size, variant } = props;
  const difference = diff(end, new Date());
  const fractionFiveMinutes = 5 / difference;
  const fractionTenMinutes = 10 / difference;
  const fractionTwentyMinutes = 10 / difference;
  return (
    <CountdownCircleTimer
      isPlaying={difference > 1}
      duration={difference > 1 ? difference : 0}
      colors={
        difference > 0
          ? ([
              [variant === 'light' ? '#FFFFFF' : '#004777', fractionTwentyMinutes],
              [variant === 'light' ? '#FFFFFF' : '#F7B801', fractionTenMinutes],
              [variant === 'light' ? '#FFFFFF' : '#A30000', fractionFiveMinutes]
            ] as never)
          : ([[variant === 'light' ? '#FFFFFF' : '#A30000', 1]] as never)
      }
      size={size || 50}
      strokeWidth={2}
    >
      {
        // @ts-ignore
        ({ remainingTime, animatedColor }) => {
          const seconds = Math.round(remainingTime % 60);
          const minutes = secondsToMinutes(remainingTime);
          const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
          const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
          return (
            <Animated.Text style={{ color: animatedColor, fontSize: 16 }}>
              {formattedMinutes}:{formattedSeconds}
            </Animated.Text>
          );
        }
      }
    </CountdownCircleTimer>
  );
}
