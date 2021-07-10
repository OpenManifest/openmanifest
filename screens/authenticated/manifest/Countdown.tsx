import * as React from "react";
import { Animated, Platform } from "react-native";
import diff from "date-fns/differenceInSeconds";
import secondsToMinutes from "date-fns/secondsToMinutes";
import isAfter from "date-fns/isAfter";

const CountdownCircleTimer = Platform.select({
  ios: React.lazy(() => import('react-native-countdown-circle-timer').then(({ CountdownCircleTimer }) => ({ default: CountdownCircleTimer }))),
  android: React.lazy(() => import('react-native-countdown-circle-timer').then(({ CountdownCircleTimer }) => ({ default: CountdownCircleTimer }))),
  web: React.lazy(() => import('react-countdown-circle-timer').then(({ CountdownCircleTimer }) => ({ default: CountdownCircleTimer }))),
});

interface ICountdownProps {
  end: Date;
  size?: number;
}
export default function Countdown(props: ICountdownProps) {

  const { end, size } = props;
  const difference = diff(end, new Date());
  const fractionFiveMinutes = 5 / difference;
  const fractionTenMinutes = 10 / difference;
  const fractionTwentyMinutes = 10 / difference;
  return (
    <CountdownCircleTimer
      isPlaying={isAfter(end, new Date())}
      duration={
        difference || 1
      }
      colors={[
        ['#004777', fractionTwentyMinutes],
        ['#F7B801', fractionTenMinutes],
        ['#A30000', fractionFiveMinutes],
      ]}
      size={size || 50}
      strokeWidth={2}
    >
      {({ remainingTime, animatedColor }) => {
        const seconds = Math.round(remainingTime % 60);
        const minutes = secondsToMinutes(remainingTime);
        const formattedSeconds = seconds < 10
          ? `0${seconds}`
          : seconds;
        const formattedMinutes = minutes < 10
          ? `0${minutes}`
          : minutes;
        return (
          <Animated.Text style={{ color: animatedColor, fontSize: 16 }}>
            {formattedMinutes}:{formattedSeconds}
          </Animated.Text>
        );
      }}
    </CountdownCircleTimer>
  );
}