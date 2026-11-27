import type { CertificationLevelDetailsFragment } from 'app/api/operations';

export type RankOption = { value: string; label: string };

/**
 * The certification ranks a destination can ask for, lowest first: one for each rank of the levels of the bodies the
 * operator accepts, named by those levels ("Advanced Open Water Diver / Advanced Adventurer"). A rank compares across
 * bodies, so a site that asks for rank 30 takes an advanced diver of any of them.
 */
export function rankOptions(
  levels: readonly CertificationLevelDetailsFragment[],
  acceptedBodyIds: readonly string[]
): RankOption[] {
  const byRank = new Map<number, string[]>();
  for (const level of levels) {
    const bodyId = level.certificationBody?.id;
    if (!level.rank || !level.name || !bodyId || !acceptedBodyIds.includes(bodyId)) continue;
    const names = byRank.get(level.rank) ?? [];
    if (!names.includes(level.name)) names.push(level.name);
    byRank.set(level.rank, names);
  }
  return [...byRank.entries()]
    .sort(([a], [b]) => a - b)
    .map(([rank, names]) => ({ value: String(rank), label: names.join(' / ') }));
}
