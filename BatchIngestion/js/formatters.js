export function formatNumber(num) {
    return num.toLocaleString('en-US');
}

export function formatBytes(bytes) {
    if (bytes < 0) return '-' + formatBytes(-bytes);
    if (bytes < 1024) return formatNumber(Math.round(bytes)) + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    if (bytes < 1024 * 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(3) + ' TB';
}

export function formatPercent(value) {
    if (value === Infinity) return '∞';
    return value.toFixed(1) + '%';
}

export function formatDays(days) {
    if (days === Infinity) return '∞';
    if (days <= 0) return '0';
    return Math.round(days).toLocaleString();
}

export function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatCompactNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
}
