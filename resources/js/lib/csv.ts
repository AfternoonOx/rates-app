/**
 * CSV helpers for simple client-side exports.
 */

export function toCsv(
    headers: string[],
    rows: Array<Array<string | number | null | undefined>>
) {
    const escape = (value: string | number | null | undefined) => {
        const str = value == null ? '' : String(value);
        const escaped = str.replace(/"/g, '""');
        return `"${escaped}"`;
    };

    const lines = [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))];

    return `${lines.join('\r\n')}\r\n`;
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

