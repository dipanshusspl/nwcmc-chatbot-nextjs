/**
 * Port of Python's difflib.SequenceMatcher(None, a, b).ratio() (without the
 * "autojunk" heuristic, which only matters for sequences >= 200 chars).
 */
export function sequenceRatio(a: string, b: string): number {
  const la = a.length, lb = b.length;
  if (la + lb === 0) return 1;

  const b2j = new Map<string, number[]>();
  for (let j = 0; j < lb; j++) {
    const ch = b[j];
    const arr = b2j.get(ch);
    if (arr) arr.push(j); else b2j.set(ch, [j]);
  }

  function longest(alo: number, ahi: number, blo: number, bhi: number): [number, number, number] {
    let besti = alo, bestj = blo, bestsize = 0;
    let j2len = new Map<number, number>();
    for (let i = alo; i < ahi; i++) {
      const newj2len = new Map<number, number>();
      for (const j of b2j.get(a[i]) ?? []) {
        if (j < blo) continue;
        if (j >= bhi) break;
        const k = (j2len.get(j - 1) ?? 0) + 1;
        newj2len.set(j, k);
        if (k > bestsize) { besti = i - k + 1; bestj = j - k + 1; bestsize = k; }
      }
      j2len = newj2len;
    }
    // no junk elements, so no extension passes are needed
    return [besti, bestj, bestsize];
  }

  let matches = 0;
  const queue: Array<[number, number, number, number]> = [[0, la, 0, lb]];
  while (queue.length) {
    const [alo, ahi, blo, bhi] = queue.pop()!;
    const [i, j, k] = longest(alo, ahi, blo, bhi);
    if (k) {
      matches += k;
      if (alo < i && blo < j) queue.push([alo, i, blo, j]);
      if (i + k < ahi && j + k < bhi) queue.push([i + k, ahi, j + k, bhi]);
    }
  }
  return (2 * matches) / (la + lb);
}
