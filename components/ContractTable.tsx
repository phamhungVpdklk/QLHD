import React, { useState, useMemo, useEffect } from 'react';
import { Contract, ContractStatus } from '../types';
import { EllipsisVerticalIcon } from './icons/EllipsisVerticalIcon';

interface ContractTableProps {
    contracts: Contract[];
    isLoading: boolean;
    onUpdateStatus: (id: string, status: ContractStatus) => void;
    onViewDetails: (contract: Contract) => void;
    onEdit: (contract: Contract) => void;
    onCancelContract: (id: string) => void;
    onCancelLiquidation: (id: string) => void;
}

type SortableKeys = 'contractNumber' | 'liquidationNumber' | 'ownerName' | 'createdAt';

const statusColorMap: { [key in ContractStatus]: string } = {
    [ContractStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [ContractStatus.LIQUIDATED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [ContractStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

const SortIcon: React.FC<{ direction: 'ascending' | 'descending' | null }> = ({ direction }) => {
    if (direction === 'ascending') {
        return <svg className="h-4 w-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
    }
    if (direction === 'descending') {
        return <svg className="h-4 w-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
    }
    return <svg className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
}

const ActionMenuItem: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button
        onClick={onClick}
        className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        role="menuitem"
    >
        {children}
    </button>
);


const ContractTable: React.FC<ContractTableProps> = ({ contracts, isLoading, onUpdateStatus, onViewDetails, onEdit, onCancelContract, onCancelLiquidation }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' }>({ key: 'createdAt', direction: 'descending' });
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        const handleClickOutside = () => {
            setActiveMenuId(null);
        };
        if (activeMenuId) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [activeMenuId]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const sortedAndFilteredContracts = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase().trim();
        
        const filtered = lowercasedFilter
            ? contracts.filter(contract =>
                contract.contractNumber.toLowerCase().includes(lowercasedFilter) ||
                (contract.liquidationNumber && contract.liquidationNumber.toLowerCase().includes(lowercasedFilter)) ||
                contract.ownerName.toLowerCase().includes(lowercasedFilter) ||
                contract.plotNumber.toLowerCase().includes(lowercasedFilter)
              )
            : [...contracts];

        const sortableItems = [...filtered];
        sortableItems.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            let comparison = 0;
            if (aValue instanceof Date && bValue instanceof Date) {
                comparison = aValue.getTime() - bValue.getTime();
            } else {
                const strA = (aValue as string | undefined) || '';
                const strB = (bValue as string | undefined) || '';
                comparison = strA.localeCompare(strB, undefined, { sensitivity: 'base' });
            }

            return sortConfig.direction === 'ascending' ? comparison : -comparison;
        });

        return sortableItems;
    }, [contracts, searchTerm, sortConfig]);

    const totalPages = Math.ceil(sortedAndFilteredContracts.length / ITEMS_PER_PAGE);
    const paginatedContracts = sortedAndFilteredContracts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    const startItem = sortedAndFilteredContracts.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, sortedAndFilteredContracts.length);


    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortDirection = (key: SortableKeys) => {
        return sortConfig.key === key ? sortConfig.direction : null;
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Danh sách Hợp đồng</h2>
                 <div className="relative sm:w-64">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        id="search-contracts"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150"
                        placeholder="Tìm kiếm hợp đồng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Tìm kiếm hợp đồng"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <button onClick={() => requestSort('contractNumber')} className="flex items-center gap-1 group">
                                    Số HĐ <SortIcon direction={getSortDirection('contractNumber')} />
                                </button>
                            </th>
                             <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <button onClick={() => requestSort('liquidationNumber')} className="flex items-center gap-1 group">
                                    Số Thanh lý <SortIcon direction={getSortDirection('liquidationNumber')} />
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <button onClick={() => requestSort('ownerName')} className="flex items-center gap-1 group">
                                    Tên chủ <SortIcon direction={getSortDirection('ownerName')} />
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thông tin thửa đất</th>
                            <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <button onClick={() => requestSort('createdAt')} className="flex items-center gap-1 group">
                                    Ngày tạo <SortIcon direction={getSortDirection('createdAt')} />
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
                            <th scope="col" className="px-6 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                    Đang tải dữ liệu hợp đồng...
                                </td>
                            </tr>
                        ) : paginatedContracts.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                    {searchTerm ? 'Không có hợp đồng nào khớp với tìm kiếm của bạn.' : 'Không tìm thấy hợp đồng nào.'}
                                </td>
                            </tr>
                        ) : (
                            paginatedContracts.map((contract) => (
                                <tr key={contract.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-1 whitespace-nowrap text-sm font-medium">
                                        <span className={`block text-blue-600 dark:text-blue-400 ${contract.status === ContractStatus.CANCELLED ? 'line-through text-red-500 dark:text-red-500' : ''}`}>{contract.contractNumber}</span>
                                    </td>
                                    <td className="px-6 py-1 whitespace-nowrap text-sm font-medium">
                                        {contract.liquidationNumber && (
                                            <span className={`block text-emerald-600 dark:text-emerald-400 ${contract.isLiquidationCancelled ? 'line-through text-red-500 dark:text-red-500' : ''}`}>{contract.liquidationNumber}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-1 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{contract.ownerName}</td>
                                    <td className="px-6 py-1 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">Tờ {contract.sheetNumber}, Thửa {contract.plotNumber}</td>
                                    <td className="px-6 py-1 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{new Date(contract.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-1 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[contract.status]}`}>
                                            {contract.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-1 whitespace-nowrap text-sm font-medium text-center">
                                        <div className="relative inline-block text-left">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuId(activeMenuId === contract.id ? null : contract.id);
                                                }}
                                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
                                                aria-haspopup="true"
                                                aria-expanded={activeMenuId === contract.id}
                                            >
                                                <EllipsisVerticalIcon className="h-5 w-5" />
                                            </button>
                                            {activeMenuId === contract.id && (
                                                <div
                                                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black dark:ring-slate-700 ring-opacity-5 focus:outline-none z-20 animate-scale-in"
                                                    style={{ transformOrigin: 'top right' }}
                                                    role="menu"
                                                    aria-orientation="vertical"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="py-1" role="none">
                                                        <ActionMenuItem onClick={() => { onViewDetails(contract); setActiveMenuId(null); }}>Xem chi tiết</ActionMenuItem>

                                                        {contract.status !== ContractStatus.CANCELLED && (
                                                            <ActionMenuItem onClick={() => { onEdit(contract); setActiveMenuId(null); }}>Sửa thông tin</ActionMenuItem>
                                                        )}
                                                        
                                                        {contract.status === ContractStatus.ACTIVE && !contract.isLiquidationCancelled && (
                                                            <>
                                                                <ActionMenuItem onClick={() => { onUpdateStatus(contract.id, ContractStatus.LIQUIDATED); setActiveMenuId(null); }}>Thanh lý</ActionMenuItem>
                                                                <ActionMenuItem onClick={() => { onCancelContract(contract.id); setActiveMenuId(null); }}>Hủy Hợp đồng</ActionMenuItem>
                                                            </>
                                                        )}
                                                        {contract.status === ContractStatus.ACTIVE && contract.isLiquidationCancelled && (
                                                            <>
                                                                <ActionMenuItem onClick={() => { onUpdateStatus(contract.id, ContractStatus.LIQUIDATED); setActiveMenuId(null); }}>Thanh lý lại</ActionMenuItem>
                                                                <ActionMenuItem onClick={() => { onCancelContract(contract.id); setActiveMenuId(null); }}>Hủy Hợp đồng</ActionMenuItem>
                                                            </>
                                                        )}

                                                        {contract.status === ContractStatus.LIQUIDATED && !contract.isLiquidationCancelled && (
                                                            <ActionMenuItem onClick={() => { onCancelLiquidation(contract.id); setActiveMenuId(null); }}>Hủy Thanh lý</ActionMenuItem>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

             {totalPages > 1 && (
                <nav className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 px-4 sm:px-0 pt-4 mt-4" aria-label="Pagination">
                    <div className="hidden sm:block">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            Hiển thị từ <span className="font-medium">{startItem}</span> đến <span className="font-medium">{endItem}</span> trên <span className="font-medium">{sortedAndFilteredContracts.length}</span> kết quả
                        </p>
                    </div>
                    <div className="flex-1 flex justify-between sm:justify-end gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Sau
                        </button>
                    </div>
                </nav>
            )}
        </div>
    );
};

export default ContractTable;