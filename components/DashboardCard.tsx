import React from 'react';

interface DashboardCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-5">
            <div className={`flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg ${color} bg-opacity-10`}>
                <div className="h-6 w-6">
                    {icon}
                </div>
            </div>
            <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                    {title}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                    {value}
                </dd>
            </div>
        </div>
    );
};

export default DashboardCard;
