import type { CommunicationLogEntry } from '../types/emcon';

/**
 * Cleanly escapes and formats string values for standard RFC 4180 CSV output.
 */
function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return `"${stringValue}"`;
}

/**
 * Exports filtered communication log entries into a downloadable CSV file.
 * Returns true if export was successful, false if dataset was empty.
 */
export function exportCommunicationLogCsv(
  entries: CommunicationLogEntry[],
  filters?: { unit?: string; timeRange?: string }
): { success: boolean; filename: string; rowCount: number; error?: string } {
  if (!entries || entries.length === 0) {
    return {
      success: false,
      filename: '',
      rowCount: 0,
      error: 'No log records available for the selected filters.'
    };
  }

  const headers = [
    'TIME (Z)',
    'LOCAL TIME',
    'SOURCE UNIT',
    'DESTINATION',
    'CHANNEL',
    'EVENT',
    'SECURITY POLICY',
    'DETAILS',
    'STATUS',
    'TRANSACTION HASH'
  ];

  const rows = entries.map((entry) => [
    escapeCsvCell(entry.timeZ),
    escapeCsvCell(entry.timeLocal),
    escapeCsvCell(entry.source),
    escapeCsvCell(entry.destination),
    escapeCsvCell(entry.channel),
    escapeCsvCell(entry.event),
    escapeCsvCell(entry.policy),
    escapeCsvCell(entry.details),
    escapeCsvCell(entry.status),
    escapeCsvCell(entry.txHash || 'N/A')
  ]);

  const csvContent = [
    `# NAV-TRAC X - EMCON Tactical Communication Audit Log`,
    `# Scope: ${filters?.unit || 'All Units'} | Time Window: ${filters?.timeRange || 'Last 24 Hours'}`,
    `# Exported At: ${new Date().toISOString()}`,
    headers.join(','),
    ...rows.map((row) => row.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const cleanUnit = (filters?.unit || 'all_units').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `NAVTRAC_EMCON_Log_${cleanUnit}_${timestamp}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    filename,
    rowCount: entries.length
  };
}
