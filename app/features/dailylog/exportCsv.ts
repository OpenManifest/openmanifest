import { Platform, Share } from 'react-native';

/** "guest-list-2026-11-26.csv": the file of a day's log, named by the operator's word for the log */
export function csvFileName(logName: string, isoDay: string): string {
  const slug = logName
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'daily-log'}-${isoDay}.csv`;
}

/**
 * Hands the CSV over: a download on the web; on a phone the share sheet, to mail it or save it to Files. A byte order
 * mark leads the file so that spreadsheets read the names as UTF-8.
 */
export async function exportCsv(csv: string, fileName: string): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  await Share.share({ message: csv, title: fileName });
}
