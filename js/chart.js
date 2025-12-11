export class ChartManager {
    constructor() {
        this.chart = null;
    }

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    update(chartData, bandwidthLimitTb, useOptimized = false) {
        if (this.chart) {
            this.chart.destroy();
        }

        const { labels, originalTB, optimizedTB, limitTB, growthDate } = chartData;

        // Find when each line exceeds limit
        let originalCrossoverIndex = originalTB.findIndex((val, i) => val > limitTB[i]);
        let optimizedCrossoverIndex = optimizedTB.findIndex((val, i) => val > limitTB[i]);

        // Create gradient for the original line (blue)
        const originalGradient = this.ctx.createLinearGradient(0, 0, 0, 400);
        originalGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
        originalGradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

        // Create gradient for the optimized line (green)
        const optimizedGradient = this.ctx.createLinearGradient(0, 0, 0, 400);
        optimizedGradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
        optimizedGradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

        // Create annotation for growth date
        const growthDateIndex = labels.findIndex(d =>
            d.getFullYear() === growthDate.getFullYear() &&
            d.getMonth() === growthDate.getMonth() &&
            d.getDate() === growthDate.getDate()
        );

        const annotations = {
            limit: {
                type: 'line',
                yMin: bandwidthLimitTb,
                yMax: bandwidthLimitTb,
                borderColor: 'rgba(99, 102, 241, 0.9)',
                borderWidth: 3,
                borderDash: [10, 5],
                label: {
                    display: true,
                    content: `Limit: ${bandwidthLimitTb} TB`,
                    position: 'end',
                    backgroundColor: 'rgba(99, 102, 241, 0.9)',
                    color: '#fff',
                    font: { weight: 'bold', size: 12 },
                    padding: 6
                }
            }
        };

        // Add growth date annotation if it falls within 2026
        if (growthDateIndex >= 0) {
            annotations.growthDate = {
                type: 'line',
                xMin: growthDateIndex,
                xMax: growthDateIndex,
                borderColor: 'rgba(168, 85, 247, 0.8)',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                    display: true,
                    content: 'Schema Growth',
                    position: 'start',
                    backgroundColor: 'rgba(168, 85, 247, 0.9)',
                    color: '#fff',
                    font: { weight: 'bold', size: 11 },
                    padding: 4,
                    rotation: -90
                }
            };
        }

        // Add crossover points
        if (originalCrossoverIndex >= 0) {
            annotations.originalCrossover = {
                type: 'point',
                xValue: originalCrossoverIndex,
                yValue: originalTB[originalCrossoverIndex],
                backgroundColor: 'rgba(59, 130, 246, 1)',
                radius: 8,
                borderColor: '#fff',
                borderWidth: 2
            };
        }

        if (useOptimized && optimizedCrossoverIndex >= 0) {
            annotations.optimizedCrossover = {
                type: 'point',
                xValue: optimizedCrossoverIndex,
                yValue: optimizedTB[optimizedCrossoverIndex],
                backgroundColor: 'rgba(34, 197, 94, 1)',
                radius: 8,
                borderColor: '#fff',
                borderWidth: 2
            };
        }

        // Format labels to show months
        const monthLabels = labels.map(date => {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        // Build datasets array
        const datasets = [
            {
                label: 'Original Schema',
                data: originalTB,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: originalGradient,
                borderWidth: 3,
                fill: true,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'rgb(59, 130, 246)',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }
        ];

        // Only add optimized line when toggle is on
        if (useOptimized) {
            datasets.push({
                label: 'Optimized Schema',
                data: optimizedTB,
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: optimizedGradient,
                borderWidth: 3,
                fill: true,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'rgb(34, 197, 94)',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            });
        }

        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: monthLabels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { size: 13, weight: '500' }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            title: (items) => {
                                const idx = items[0].dataIndex;
                                return labels[idx].toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                            },
                            label: (context) => {
                                const value = context.parsed.y;
                                const percent = (value / bandwidthLimitTb * 100).toFixed(1);
                                const label = context.dataset.label;
                                return `${label}: ${value.toFixed(3)} TB (${percent}%)`;
                            },
                            afterBody: (items) => {
                                if (useOptimized && items.length >= 2) {
                                    const original = items[0].parsed.y;
                                    const optimized = items[1].parsed.y;
                                    const savings = original - optimized;
                                    const savingsPercent = ((savings / original) * 100).toFixed(1);
                                    return [``, `Savings: ${savings.toFixed(3)} TB (${savingsPercent}%)`];
                                }
                                return '';
                            }
                        }
                    },
                    annotation: {
                        annotations: annotations
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '2026',
                            font: { size: 14, weight: 'bold' },
                            padding: { top: 10 }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            maxTicksLimit: 12,
                            font: { size: 11 },
                            callback: function(value, index) {
                                // Show only month starts
                                const date = labels[index];
                                if (date && date.getDate() === 1) {
                                    return date.toLocaleDateString('en-US', { month: 'short' });
                                }
                                return '';
                            }
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Total Data Synced (TB)',
                            font: { size: 14, weight: 'bold' },
                            padding: { bottom: 10 }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: { size: 11 },
                            callback: (value) => value.toFixed(1) + ' TB'
                        },
                        suggestedMin: 0,
                        suggestedMax: Math.max(bandwidthLimitTb * 1.2, Math.max(...originalTB, ...optimizedTB) * 1.1)
                    }
                }
            }
        });
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}

export const chartManager = new ChartManager();
