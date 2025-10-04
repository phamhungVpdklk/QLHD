import React from 'react';

interface BarChartProps {
  data: { label: string; value: number }[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    const chartHeight = 250;
    const barWidth = 40;
    const barMargin = 20;

    if (maxValue === 0) return null;

    return (
        <div className="w-full overflow-x-auto">
            <svg
                width="100%"
                height={chartHeight + 40} // height for chart + labels
                className="text-xs text-slate-500 dark:text-slate-400"
            >
                <g transform="translate(30, 10)">
                    {/* Y-axis Lines and Labels */}
                     {[...Array(5)].map((_, i) => {
                        const y = chartHeight - (chartHeight / 4) * i;
                        const value = (maxValue / 4) * i;
                        return (
                            <g key={i}>
                                <line
                                    x1={0}
                                    y1={y}
                                    x2={(barWidth + barMargin) * data.length}
                                    y2={y}
                                    className="stroke-current text-slate-200 dark:text-slate-700"
                                    strokeDasharray="2,2"
                                />
                                <text x="-10" y={y + 4} textAnchor="end" className="fill-current">
                                    {Math.ceil(value)}
                                </text>
                            </g>
                        );
                    })}
                     <line
                            x1={0}
                            y1={0}
                            x2={0}
                            y2={chartHeight}
                            className="stroke-current text-slate-300 dark:text-slate-600"
                        />


                    {/* Bars and X-axis Labels */}
                    {data.map((d, i) => {
                        const barHeight = maxValue > 0 ? (d.value / maxValue) * chartHeight : 0;
                        const x = i * (barWidth + barMargin);
                        return (
                            <g key={d.label}>
                                <rect
                                    x={x}
                                    y={chartHeight - barHeight}
                                    width={barWidth}
                                    height={barHeight}
                                    className="fill-current text-blue-500 hover:text-blue-600 transition-colors"
                                />
                                <text
                                    x={x + barWidth / 2}
                                    y={chartHeight + 20}
                                    textAnchor="middle"
                                    className="fill-current font-medium text-slate-600 dark:text-slate-300"
                                >
                                    {d.label.replace('Phường ', '')}
                                </text>
                                 <text
                                    x={x + barWidth / 2}
                                    y={chartHeight - barHeight - 5}
                                    textAnchor="middle"
                                    className="fill-current text-sm font-semibold text-slate-800 dark:text-slate-100"
                                >
                                    {d.value}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>
        </div>
    );
};

export default BarChart;
