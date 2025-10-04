import React from 'react';
import { ContractStatus } from '../../types';

interface StackedBarChartData {
    label: string;
    [ContractStatus.ACTIVE]: number;
    [ContractStatus.LIQUIDATED]: number;
    [ContractStatus.CANCELLED]: number;
}

interface StackedBarChartProps {
    data: StackedBarChartData[];
    colors: { [key in ContractStatus]: string };
}

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <div className="flex items-center gap-2 text-xs">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }}></span>
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
    </div>
);

const StackedBarChart: React.FC<StackedBarChartProps> = ({ data, colors }) => {
    const statuses: ContractStatus[] = [ContractStatus.ACTIVE, ContractStatus.LIQUIDATED, ContractStatus.CANCELLED];
    
    const totals = data.map(d => d[ContractStatus.ACTIVE] + d[ContractStatus.LIQUIDATED] + d[ContractStatus.CANCELLED]);
    const maxValue = Math.max(...totals, 0);
    
    const chartHeight = 250;
    const barWidth = 40;
    const barMargin = 50; // Tăng khoảng cách giữa các cột

    if (maxValue === 0) {
        return <p className="text-center text-slate-500 dark:text-slate-400 py-10">Không có dữ liệu để hiển thị.</p>;
    }

    return (
        <div className="w-full">
            <div className="w-full overflow-x-auto pb-4">
                <svg
                    width={(barWidth + barMargin) * data.length + 30}
                    height={chartHeight + 60} // Tăng chiều cao SVG để có thêm không gian cho nhãn trên cùng
                    className="text-xs text-slate-500 dark:text-slate-400"
                >
                    <g transform="translate(30, 30)"> {/* Dịch chuyển toàn bộ biểu đồ xuống để tạo khoảng đệm */}
                        {/* Y-axis Lines and Labels */}
                        {[...Array(5)].map((_, i) => {
                            const y = chartHeight - (chartHeight / 4) * i;
                            const value = (maxValue / 4) * i;
                            if (i === 0 && maxValue > 0) return null; // Avoid drawing line at 0
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
                        {/* Base line */}
                        <line
                                x1={0}
                                y1={chartHeight}
                                x2={(barWidth + barMargin) * data.length}
                                y2={chartHeight}
                                className="stroke-current text-slate-300 dark:text-slate-600"
                        />

                        {/* Bars and X-axis Labels */}
                        {data.map((d, i) => {
                            const x = i * (barWidth + barMargin);
                            let yOffset = 0;
                            const totalValue = totals[i];

                            return (
                                <g key={d.label}>
                                    {statuses.map(status => {
                                        const value = d[status];
                                        if (value === 0) return null;

                                        const barHeight = (value / maxValue) * chartHeight;
                                        const y = chartHeight - barHeight - yOffset;
                                        yOffset += barHeight;

                                        return (
                                            <g key={status}>
                                                <rect
                                                    x={x}
                                                    y={y}
                                                    width={barWidth}
                                                    height={barHeight}
                                                    fill={colors[status]}
                                                    className="transition-opacity hover:opacity-80"
                                                >
                                                   <title>{`${d.label} - ${status}: ${value}`}</title>
                                                </rect>
                                                {barHeight > 18 && (
                                                    <text
                                                        x={x + barWidth / 2}
                                                        y={y + barHeight / 2}
                                                        textAnchor="middle"
                                                        dominantBaseline="central"
                                                        className="fill-white text-[11px] font-bold pointer-events-none"
                                                    >
                                                        {value}
                                                    </text>
                                                )}
                                            </g>
                                        );
                                    })}
                                    {totalValue > 0 && (
                                        <text
                                            x={x + barWidth / 2}
                                            y={chartHeight - yOffset - 8}
                                            textAnchor="middle"
                                            className="fill-current text-sm font-semibold text-slate-800 dark:text-slate-100"
                                        >
                                            {totalValue}
                                        </text>
                                    )}
                                    <text
                                        x={x + barWidth / 2}
                                        y={chartHeight + 20}
                                        textAnchor="middle"
                                        className="fill-current font-medium text-slate-600 dark:text-slate-300"
                                    >
                                        {d.label.replace('Phường ', '')}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>
             <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                <LegendItem color={colors[ContractStatus.ACTIVE]} label={ContractStatus.ACTIVE} />
                <LegendItem color={colors[ContractStatus.LIQUIDATED]} label={ContractStatus.LIQUIDATED} />
                <LegendItem color={colors[ContractStatus.CANCELLED]} label={ContractStatus.CANCELLED} />
            </div>
        </div>
    );
};

export default StackedBarChart;