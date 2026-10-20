import { useStyles } from 'app/ui';

/**
 * The text over the satellite map of the jump run picker: the title, the big heading of the run and the degrees under
 * it, white with a halo whatever the scheme (it sits on imagery). The web lays the bottom label out from the bottom.
 */
export default function useJumpRunStyles(variant: 'native' | 'web') {
  return useStyles((theme) => {
    // White text over imagery needs something dark under it to be legible whatever the imagery is (and when it has not loaded)
    const halo = {
      color: theme.colour.map.text,
      backgroundColor: theme.colour.map.halo,
      textShadowColor: theme.colour.map.halo,
      textShadowRadius: theme.space.md,
      textShadowOffset: { width: 2, height: 2 },
    } as const;
    return {
      title: {
        ...halo,
        fontSize: theme.type.countdown.fontSize,
        fontWeight: 'bold',
        left: 0,
        width: '100%',
        paddingBottom: theme.space.xxxl,
        textAlign: 'center',
      },
      degreeLabel: {
        ...halo,
        position: 'absolute',
        width: 200,
        height: 120,
        ...(variant === 'native' ? { left: 0, top: '50%' } : {}),
        textAlign: 'center',
        fontSize: theme.type.countdown.fontSize * 2,
      },
      bottomDegreeLabel: {
        ...halo,
        position: 'absolute',
        left: 0,
        width: '100%',
        fontSize: theme.type.countdown.fontSize,
        fontWeight: 'bold',
        textAlign: 'center',
        ...(variant === 'native'
          ? { top: 100 }
          : { top: theme.space.xxxl, bottom: theme.space.xxxl, paddingBottom: theme.space.lg }),
      },
    };
  });
}
