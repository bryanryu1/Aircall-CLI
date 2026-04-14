import Table from 'cli-table3';

export type OutputFormat = 'table' | 'json';

interface ColumnDef {
  header: string;
  key: string;
  formatter?: (value: any, row: any) => string;
  width?: number;
}

export function formatOutput(data: any[], columns: ColumnDef[], format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }
  return formatTable(data, columns);
}

function formatTable(data: any[], columns: ColumnDef[]): string {
  if (data.length === 0) {
    return 'No results found.';
  }

  const table = new Table({
    head: columns.map((c) => c.header),
    style: { head: ['cyan'] },
    wordWrap: true,
  });

  for (const row of data) {
    table.push(
      columns.map((col) => {
        const value = col.key.split('.').reduce((obj: any, key: string) => obj?.[key], row);
        return col.formatter ? col.formatter(value, row) : String(value ?? '');
      }),
    );
  }

  return table.toString();
}

export function formatSingle(data: Record<string, any>, format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }

  const table = new Table({
    style: { head: ['cyan'] },
  });

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'object' && value !== null) {
      table.push({ [key]: JSON.stringify(value, null, 2) });
    } else {
      table.push({ [key]: String(value ?? '') });
    }
  }

  return table.toString();
}
