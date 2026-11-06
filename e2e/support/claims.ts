import { mkdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// The specs share one seed, and the seed's members can be on one load at a time: two workers that each put "Pat Pilot" on
// a load of their own make the second one fail. A spec claims the members it books; a claim is a directory that only one
// worker can create, held until the spec has taken its loads away.
const DIR = join(tmpdir(), 'openmanifest-e2e-claims');
const STALE_MS = 3 * 60_000;
const held = new Set<string>();

const lockOf = (name: string) => join(DIR, name.replace(/\W+/g, '-').toLowerCase());

async function acquire(name: string, timeoutMs: number) {
  const lock = lockOf(name);
  const started = Date.now();
  mkdirSync(DIR, { recursive: true });
  for (;;) {
    try {
      mkdirSync(lock);
      return;
    } catch {
      // A lock that nobody released (a worker that was killed) does not hold for ever
      try {
        if (Date.now() - statSync(lock).mtimeMs > STALE_MS) rmSync(lock, { recursive: true });
      } catch {
        // gone already
      }
      if (Date.now() - started > timeoutMs) throw new Error(`could not claim ${name}`);
      await new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 250));
    }
  }
}

/** Waits until no other worker has these members booked, and holds them until `releaseClaims` (the end of the spec) */
export async function claim(...names: string[]) {
  for (const name of [...names].sort()) {
    if (held.has(name)) continue;
    await acquire(name, 90_000);
    held.add(name);
  }
}

export function releaseClaims() {
  for (const name of held) rmSync(lockOf(name), { recursive: true, force: true });
  held.clear();
}
