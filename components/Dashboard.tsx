import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { Contract, ContractStatus } from '../types';
import { WARDS } from '../constants';
import DashboardCard from './DashboardCard';
import PieChart from './charts/PieChart';
import StackedBarChart from './charts/StackedBarChart';
import { DocumentIcon } from './icons/DocumentIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { DownloadIcon } from './icons/DownloadIcon';


const statusColors: { [key in ContractStatus]: string } = {
    [ContractStatus.ACTIVE]: '#22c55e', // green-500
    [ContractStatus.LIQUIDATED]: '#3b82f6', // blue-500
    [ContractStatus.CANCELLED]: '#ef4444', // red-500
};

type FilterType = 'today' | 'thisMonth' | 'thisYear' | 'custom' | null;

const Dashboard: React.FC = () => {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeFilter, setActiveFilter] = useState<FilterType>(null);
    const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

    const pieChartRef = useRef<HTMLDivElement>(null);
    const barChartRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const fetchContracts = async () => {
            setIsLoading(true);
            setError(null);

            let query = supabase
                .from('contracts_with_details')
                .select(`*`);

            let startOfPeriod: Date | null = null;
            let endOfPeriod: Date | null = null;
            const now = new Date();

            switch (activeFilter) {
                case 'today':
                    startOfPeriod = new Date(now.setHours(0, 0, 0, 0));
                    endOfPeriod = new Date(new Date().setHours(23, 59, 59, 999));
                    break;
                case 'thisMonth':
                    startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
                    endOfPeriod = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                    break;
                case 'thisYear':
                    startOfPeriod = new Date(now.getFullYear(), 0, 1);
                    endOfPeriod = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                    break;
                case 'custom':
                    if (customDateRange.start && customDateRange.end) {
                        startOfPeriod = new Date(customDateRange.start);
                        startOfPeriod.setHours(0, 0, 0, 0);
                        endOfPeriod = new Date(customDateRange.end);
                        endOfPeriod.setHours(23, 59, 59, 999);
                    }
                    break;
            }

            if (startOfPeriod) {
                query = query.gte('created_at', startOfPeriod.toISOString());
            }
            if (endOfPeriod) {
                query = query.lte('created_at', endOfPeriod.toISOString());
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) {
                setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.");
                console.error("Lỗi khi tải dữ liệu dashboard:", error);
            } else if (data) {
                // SỬA LỖI: Chuyển đổi dữ liệu từ snake_case của DB sang camelCase của ứng dụng
                const parsedData = data.map((c: any) => ({
                    id: c.id,
                    contractNumber: c.contract_number,
                    ward: c.ward,
                    ownerName: c.owner_name,
                    sheetNumber: c.sheet_number,
                    plotNumber: c.plot_number,
                    isBranch: c.is_branch,
                    status: c.status as ContractStatus,
                    createdAt: new Date(c.created_at),
                    liquidationNumber: c.liquidation_number,
                    liquidationDate: c.liquidation_date ? new Date(c.liquidation_date) : undefined,
                    isLiquidationCancelled: c.is_liquidation_cancelled,
                    notes: c.notes,
                    cancellationReason: c.cancellation_reason,
                    history: [],
                }));
                setContracts(parsedData);
            }
            setIsLoading(false);
        };

        fetchContracts();
    }, [activeFilter, customDateRange]);

    const handleQuickFilter = (filter: FilterType) => {
        setCustomDateRange({ start: '', end: '' });
        setActiveFilter(filter);
    };

    const handleApplyCustomFilter = () => {
        if (customDateRange.start && customDateRange.end) {
            setActiveFilter('custom');
        }
    };
    
    const handleClearFilter = () => {
        setActiveFilter(null);
        setCustomDateRange({ start: '', end: '' });
    };

    const stats = useMemo(() => {
        const total = contracts.length;
        const active = contracts.filter(c => c.status === ContractStatus.ACTIVE).length;
        const liquidated = contracts.filter(c => c.status === ContractStatus.LIQUIDATED).length;
        const cancelled = contracts.filter(c => c.status === ContractStatus.CANCELLED).length;
        return { total, active, liquidated, cancelled };
    }, [contracts]);

    const contractsByStatusData = useMemo(() => {
        return [
            { name: ContractStatus.ACTIVE, value: stats.active, color: statusColors[ContractStatus.ACTIVE] },
            { name: ContractStatus.LIQUIDATED, value: stats.liquidated, color: statusColors[ContractStatus.LIQUIDATED] },
            { name: ContractStatus.CANCELLED, value: stats.cancelled, color: statusColors[ContractStatus.CANCELLED] },
        ].filter(item => item.value > 0);
    }, [stats]);
    
    const handleExport = async () => {
        if (!pieChartRef.current || !barChartRef.current) {
            alert('Không thể xuất báo cáo do biểu đồ chưa được tải xong.');
            return;
        }

        const svgToPngDataURL = (svgElement: SVGElement): Promise<string> => {
            return new Promise((resolve, reject) => {
                const svgString = new XMLSerializer().serializeToString(svgElement);
                const svgBase64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();

                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.onerror = (e) => {
                    console.error("Lỗi khi chuyển đổi SVG sang PNG:", e);
                    reject('Không thể chuyển đổi biểu đồ thành hình ảnh.');
                };
                img.src = svgBase64;
            });
        };

        try {
            const pieChartSvg = pieChartRef.current.querySelector('svg');
            const barChartSvg = barChartRef.current.querySelector('svg');

            const pieChartDataUrl = pieChartSvg ? await svgToPngDataURL(pieChartSvg) : '';
            const barChartDataUrl = barChartSvg ? await svgToPngDataURL(barChartSvg) : '';

            let filterDescription = 'Tất cả dữ liệu';
            const now = new Date();
            switch (activeFilter) {
                case 'today': filterDescription = `Hôm nay (${now.toLocaleDateString('vi-VN')})`; break;
                case 'thisMonth': filterDescription = `Tháng này (${now.getMonth() + 1}/${now.getFullYear()})`; break;
                case 'thisYear': filterDescription = `Năm nay (${now.getFullYear()})`; break;
                case 'custom':
                    if (customDateRange.start && customDateRange.end) {
                        const start = new Date(customDateRange.start).toLocaleDateString('vi-VN');
                        const end = new Date(customDateRange.end).toLocaleDateString('vi-VN');
                        filterDescription = `Tùy chỉnh: Từ ngày ${start} đến ngày ${end}`;
                    }
                    break;
            }

            const reportDate = now.toLocaleString('vi-VN');

            const tableRows = contracts.map((contract, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${contract.contractNumber || ''}</td>
                    <td>${contract.liquidationNumber || ''}</td>
                    <td>${contract.ownerName || ''}</td>
                    <td>Tờ ${contract.sheetNumber}, Thửa ${contract.plotNumber}</td>
                    <td>${new Date(contract.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>${contract.status}</td>
                </tr>
            `).join('');

            const pieTotal = contractsByStatusData.reduce((sum, item) => sum + item.value, 0);
            const pieChartLegendHtml = pieTotal > 0 ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                    ${contractsByStatusData.map(item => {
                        const percentage = pieTotal > 0 ? ((item.value / pieTotal) * 100).toFixed(1) : 0;
                        return `
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 14px; margin-bottom: 5px; max-width: 250px; margin-left: auto; margin-right: auto;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="height: 12px; width: 12px; border-radius: 50%; background-color: ${item.color}; flex-shrink: 0;"></span>
                                    <span style="flex-grow: 1;">${item.name}</span>
                                </div>
                                <div>
                                    <span style="font-weight: bold;">${item.value}</span>
                                    <span style="color: #666; width: 60px; text-align: right; display: inline-block;">(${percentage}%)</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : '';

            const reportHtml = `
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <title>Báo Cáo Tình Hình Hợp Đồng</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.5; color: #333; }
                        .container { max-width: 1000px; margin: 20px auto; padding: 20px; }
                        h1, h2, h3 { color: #111; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px; }
                        h1 { text-align: center; border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
                        .meta-info { background: #f9f9f9; padding: 15px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 30px; }
                        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
                        .card { background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; text-align: center; }
                        .card .value { font-size: 2em; font-weight: bold; }
                        .card .title { font-size: 0.9em; color: #666; }
                        .charts-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; align-items: start; }
                        .charts-grid .chart-container { border: 1px solid #eee; padding: 15px; border-radius: 8px; text-align: center; }
                        .charts-grid img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9em; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        tbody tr:nth-child(even) { background-color: #f9f9f9; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            .container { margin: 0; max-width: 100%; padding: 0; border: none; }
                            h1, h2, h3 { page-break-after: avoid; }
                            table { page-break-inside: auto; }
                            tr { page-break-inside: avoid; page-break-after: auto; }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Báo Cáo Tình Hình Hợp Đồng</h1>
                        <div class="meta-info">
                            <p><strong>Ngày xuất báo cáo:</strong> ${reportDate}</p>
                            <p><strong>Bộ lọc áp dụng:</strong> ${filterDescription}</p>
                        </div>
                        <h2>I. Tóm tắt số liệu</h2>
                        <div class="grid">
                            <div class="card"><div class="value">${stats.total}</div><div class="title">Tổng số Hợp đồng</div></div>
                            <div class="card"><div class="value">${stats.active}</div><div class="title">Đang hiệu lực</div></div>
                            <div class="card"><div class="value">${stats.liquidated}</div><div class="title">Đã thanh lý</div></div>
                            <div class="card"><div class="value">${stats.cancelled}</div><div class="title">Đã hủy</div></div>
                        </div>
                        <h2>II. Biểu đồ trực quan</h2>
                        <div class="charts-grid">
                             <div class="chart-container">
                                <h3>Tỷ lệ theo Trạng thái</h3>
                                ${pieChartDataUrl ? `<img src="${pieChartDataUrl}" alt="Biểu đồ tròn tỷ lệ hợp đồng" style="max-width: 200px;">` : '<p>Không có dữ liệu.</p>'}
                                ${pieChartLegendHtml}
                            </div>
                            <div class="chart-container">
                                <h3>Phân tích theo Trạng thái & Phường</h3>
                                ${barChartDataUrl ? `<img src="${barChartDataUrl}" alt="Biểu đồ cột phân tích hợp đồng">` : '<p>Không có dữ liệu.</p>'}
                            </div>
                        </div>
                        <h2>III. Danh sách Hợp đồng Chi tiết</h2>
                        ${contracts.length > 0 ? `
                            <table>
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Số HĐ</th>
                                        <th>Số Thanh Lý</th>
                                        <th>Tên chủ sở hữu</th>
                                        <th>Thông tin thửa đất</th>
                                        <th>Ngày tạo</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tableRows}
                                </tbody>
                            </table>` : '<p>Không có hợp đồng nào trong danh sách.</p>'}
                    </div>
                </body>
                </html>
            `;

            const reportWindow = window.open('', '_blank');
            if (reportWindow) {
                reportWindow.document.write(reportHtml);
                reportWindow.document.close();
            } else {
                alert('Không thể mở cửa sổ mới. Vui lòng cho phép pop-up cho trang web này.');
            }

        } catch (error) {
            alert(String(error));
        }
    };

    const contractsByWardAndStatusData = useMemo(() => {
        const initialData = WARDS.reduce((acc, ward) => {
            acc[ward] = {
                [ContractStatus.ACTIVE]: 0,
                [ContractStatus.LIQUIDATED]: 0,
                [ContractStatus.CANCELLED]: 0,
            };
            return acc;
        }, {} as { [key: string]: { [key in ContractStatus]: number } });

        contracts.forEach(contract => {
            if (initialData[contract.ward]) {
                initialData[contract.ward][contract.status]++;
            }
        });

        return Object.entries(initialData).map(([ward, statuses]) => ({
            label: ward,
            ...statuses,
        }));
    }, [contracts]);

    const FilterButton = ({ filter, label }: { filter: FilterType, label: string }) => (
        <button
            onClick={() => handleQuickFilter(filter)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors border ${
                activeFilter === filter
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Báo cáo & Thống kê</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Tổng quan về tình hình hợp đồng của bạn. Lọc dữ liệu theo khoảng thời gian để phân tích.
                </p>
            </div>
            
             <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <FilterButton filter="today" label="Hôm nay" />
                    <FilterButton filter="thisMonth" label="Tháng này" />
                    <FilterButton filter="thisYear" label="Năm nay" />
                </div>
                <div className="h-px sm:h-6 w-full sm:w-px bg-slate-200 dark:bg-slate-600"></div>
                <div className="flex items-center gap-2 flex-wrap">
                     <div className="relative">
                        <label htmlFor="start-date" className="absolute -top-2 left-2 inline-block bg-white dark:bg-slate-800 px-1 text-xs font-medium text-slate-600 dark:text-slate-400">Từ ngày</label>
                        <input
                            type="date"
                            id="start-date"
                            value={customDateRange.start}
                            onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                        />
                    </div>
                    <div className="relative">
                        <label htmlFor="end-date" className="absolute -top-2 left-2 inline-block bg-white dark:bg-slate-800 px-1 text-xs font-medium text-slate-600 dark:text-slate-400">Đến ngày</label>
                        <input
                            type="date"
                            id="end-date"
                            value={customDateRange.end}
                            onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                        />
                    </div>
                    <button
                        onClick={handleApplyCustomFilter}
                        disabled={!customDateRange.start || !customDateRange.end}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                    >
                        <CalendarDaysIcon />
                        Áp dụng
                    </button>
                </div>
                 <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
                    {activeFilter && (
                        <button onClick={handleClearFilter} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900">
                            <XMarkIcon/>
                            Xóa Lọc
                        </button>
                    )}
                    <button
                        onClick={handleExport}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors"
                    >
                        <DownloadIcon />
                        Xuất Báo cáo
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : error ? (
                 <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <DashboardCard title="Tổng số Hợp đồng" value={stats.total} icon={<DocumentIcon />} color="text-indigo-500" />
                        <DashboardCard title="Đang hiệu lực" value={stats.active} icon={<CheckCircleIcon />} color="text-green-500" />
                        <DashboardCard title="Đã thanh lý" value={stats.liquidated} icon={<ArchiveBoxIcon />} color="text-blue-500" />
                        <DashboardCard title="Đã hủy" value={stats.cancelled} icon={<XCircleIcon />} color="text-red-500" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div ref={pieChartRef} className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Tỷ lệ Hợp đồng theo Trạng thái</h2>
                            {contractsByStatusData.length > 0 ? (
                                <PieChart data={contractsByStatusData} />
                            ) : (
                                <p className="text-center text-slate-500 dark:text-slate-400 py-10">Không có dữ liệu để hiển thị.</p>
                            )}
                        </div>
                        <div ref={barChartRef} className="lg:col-span-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Phân tích Hợp đồng theo Trạng thái & Phường</h2>
                            {contracts.length > 0 ? (
                                <StackedBarChart data={contractsByWardAndStatusData} colors={statusColors} />
                            ) : (
                                <p className="text-center text-slate-500 dark:text-slate-400 py-10">Không có dữ liệu để hiển thị.</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;