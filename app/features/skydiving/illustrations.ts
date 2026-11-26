import { useOperatorContext } from 'app/providers/operator/context';

/** Which set of illustrations, animations and decorative glyphs an operator gets (D10) */
export type IllustrationSet = 'skydiving' | 'neutral';

/**
 * The illustration set of an operator's template (`operator.template.illustrations`), never guessed from its slug:
 * only a skydiving-based template shows the skydiving artwork; every other operator, and one not loaded yet, the
 * neutral set.
 */
export function illustrationsOf(
  operator?: { template?: { illustrations?: string | null } | null } | null
): IllustrationSet {
  return operator?.template?.illustrations === 'skydiving' ? 'skydiving' : 'neutral';
}

/** The illustration set of the operator in context */
export function useIllustrations(): IllustrationSet {
  const {
    operator: { operator },
  } = useOperatorContext();
  return illustrationsOf(operator);
}
