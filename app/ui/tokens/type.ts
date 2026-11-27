export type TypeStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '600' | '700';
  fontVariant: ['tabular-nums'];
};

const style = (
  fontSize: number,
  lineHeight: number,
  fontWeight: TypeStyle['fontWeight']
): TypeStyle => ({
  fontSize,
  lineHeight,
  fontWeight,
  // Numbers line up in columns and countdowns do not jitter
  fontVariant: ['tabular-nums'],
});

export const type = {
  countdown: style(56, 64, '700'),
  title: style(20, 28, '600'),
  body: style(15, 22, '400'),
  bodyCompact: style(14, 20, '400'),
  label: style(13, 18, '600'),
  caption: style(12, 16, '400'),
};

export type TypeKey = keyof typeof type;
