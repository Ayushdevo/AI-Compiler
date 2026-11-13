import type { PermissionRow, TemplateData } from './types';

/** Normalize model output without carrying policies over from an earlier template. */
export function compilationPermissions(value: unknown): TemplateData['permissions'] {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const rows = (role: string): PermissionRow[] => {
    const candidates = source[role];
    if (!Array.isArray(candidates)) return [];
    return candidates.flatMap((candidate): PermissionRow[] => {
      if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return [];
      const row = candidate as Record<string, unknown>;
      if (typeof row.entity !== 'string' || !row.entity.trim()) return [];
      return [{
        entity: row.entity,
        icon: typeof row.icon === 'string' ? row.icon : 'database',
        read: row.read === true,
        write: row.write === true,
        update: row.update === true,
        delete: row.delete === true,
      }];
    });
  };
  return { admin: rows('admin'), member: rows('member'), guest: rows('guest') };
}
