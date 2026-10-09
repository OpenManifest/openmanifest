export interface FieldItem {
  label: string;
  description?: string;
  isRequired?: boolean;
  valueType: 'integer' | 'boolean' | 'date' | 'string';
  value?: number | boolean | string;
}

/** The template and its inspections store their fields as a JSON array */
export function parseFields(definition?: string | null): FieldItem[] {
  try {
    const parsed = JSON.parse(definition || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.error('Failed to read rig inspection template', definition);
    return [];
  }
}
