import React from 'react';

interface PieChartProps {
    data: { name: string; value: number; color: string }[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    if (totalValue === 0) return null;

    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative w-48 h-48">
                <svg viewBox="-1 -1 2 2" className="transform -rotate-90">
                    {data.map(item => {
                        const percent = item.value / totalValue;
                        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                        cumulativePercent += percent;
                        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                        const largeArcFlag = percent > 0.5 ? 1 : 0;

                        const pathData = [
                            `M ${startX} ${startY}`, // Move
                            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
                            `L 0 0`, // Line to center
                        ].join(' ');

                        return <path key={item.name} d={pathData} fill={item.color} />;
                    })}
                </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full"></div>
                </div>
            </div>
            <div className="w-full pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2">
                {data.map(item => (
                    <div key={item.name} className="flex items-center gap-3 text-sm w-full max-w-xs">
                        <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-700 dark:text-slate-300 flex-grow">{item.name}</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{item.value}</span>
                         <span className="text-slate-500 dark:text-slate-400 w-16 text-right">({((item.value / totalValue) * 100).toFixed(1)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PieChart;