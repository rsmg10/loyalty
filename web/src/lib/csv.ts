function escapeCsv(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function downloadCsv(
  filename: string,
  headers: Array<string>,
  rows: Array<Array<string | number | boolean | null | undefined>>
) {
  const lines = [headers.map(escapeCsv).join(',')];
  rows.forEach((row) => {
    lines.push(row.map(escapeCsv).join(','));
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
