import type { Category, CategoryKind, Id, Tx } from './types';

export function monogram(name: string): string {
  const words = name.match(/[A-Za-z0-9]+/g);
  if (!words || words.length === 0) return '??';
  const raw = words.length >= 2 ? words[0][0] + words[1][0] : words[0].slice(0, 2);
  return raw.toUpperCase();
}

export function groupColorToken(group: string, allGroups: readonly string[]): string {
  const idx = allGroups.indexOf(group);
  if (idx < 0) return 'var(--cat-8)';
  return `var(--cat-${(idx % 8) + 1})`;
}

export function recentCategoryIds(txs: readonly Tx[], kind: CategoryKind, limit = 6): Id[] {
  const sorted = [...txs].sort((a, b) => b.createdAt - a.createdAt);
  const seen = new Set<Id>();
  const out: Id[] = [];
  for (const tx of sorted) {
    if (tx.kind !== kind || !tx.categoryId || seen.has(tx.categoryId)) continue;
    seen.add(tx.categoryId);
    out.push(tx.categoryId);
    if (out.length >= limit) break;
  }
  return out;
}

export function filterCategories(
  categories: readonly Category[],
  kind: CategoryKind,
  query: string,
): Category[] {
  const q = query.trim().toLowerCase();
  return categories.filter((c) => {
    if (c.archived || c.kind !== kind) return false;
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q);
  });
}
