import React, { useState, useEffect } from 'react';
import { Contract, ContractStatus, HistoryEntry } from '../types';
import { supabase } from '../services/supabaseClient';

interface ContractDetailModalProps {
    contract: Contract;
    onClose: () => void;
}

const statusColorMapModal: { [key in ContractStatus]: string } = {
    [ContractStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [ContractStatus.LIQUIDATED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [ContractStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
        <dd className="text-sm text-slate-900 dark:text-slate-200 sm:col-span-2">{value}</dd>
    </div>
);

const ContractDetailModal: React.FC<ContractDetailModalProps> = ({ contract, onClose }) => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

    // Tải lịch sử khi modal được mở
    useEffect(() => {
        const fetchHistory = async () => {
            if (!contract.id) return;
            setIsLoadingHistory(true);
            const { data, error } = await supabase
                .from('contract_history')
                .select('*')
                .eq('contract_id', contract.id)
                .order('timestamp', { ascending: false });

            if (error) {
                console.error('Lỗi khi tải lịch sử hợp đồng:', error);
            } else if (data) {
                const parsedHistory = data.map((h: any) => ({
                    timestamp: new Date(h.timestamp),
                    action: h.action,
                    details: h.details,
                }));
                setHistory(parsedHistory);
            }
            setIsLoadingHistory(false);
        };

        fetchHistory();
    }, [contract.id]);
    
    // Handle keyboard events for accessibility
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 dark:bg-opacity-80 backdrop-blur-sm animate-fade-in-fast"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contract-details-title"
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl m-4 transform animate-scale-in"
                onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
            >
                <header className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700">
                    <h2 id="contract-details-title" className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        Chi tiết Hợp đồng
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        aria-label="Đóng cửa sổ"
                    >
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
                    <dl>
                        <DetailRow label="Số Hợp đồng" value={<span className={`font-mono font-bold text-blue-600 dark:text-blue-400 ${contract.status === ContractStatus.CANCELLED ? 'line-through text-red-500' : ''}`}>{contract.contractNumber}</span>} />
                        <DetailRow label="Tên Chủ sở hữu" value={contract.ownerName} />
                        <DetailRow label="Thông tin Thửa đất" value={`Tờ bản đồ ${contract.sheetNumber}, Thửa đất ${contract.plotNumber}`} />
                        <DetailRow label="Phường/Xã" value={contract.ward} />
                        <DetailRow label="Chi nhánh" value={contract.isBranch ? 'Có' : 'Không'} />
                        <DetailRow label="Trạng thái" value={
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMapModal[contract.status]}`}>
                                {contract.status}
                            </span>
                        } />
                         {contract.liquidationNumber && (
                            <DetailRow 
                                label="Số Thanh lý" 
                                value={<span className={`font-mono font-bold text-emerald-600 dark:text-emerald-400 ${contract.isLiquidationCancelled ? 'line-through text-red-500' : ''}`}>{contract.liquidationNumber}</span>} 
                            />
                        )}
                        {contract.liquidationDate && (
                             <DetailRow 
                                label="Ngày Thanh lý" 
                                value={new Date(contract.liquidationDate).toLocaleString()} 
                            />
                        )}
                        <DetailRow label="Ngày Tạo" value={new Date(contract.createdAt).toLocaleString()} />
                        {contract.notes && (
                            <DetailRow 
                                label="Ghi chú" 
                                value={<span className="whitespace-pre-wrap">{contract.notes}</span>} 
                            />
                        )}
                        {contract.cancellationReason && (
                             <DetailRow 
                                label={contract.status === ContractStatus.CANCELLED ? "Lý do Hủy HĐ" : "Lý do Hủy Thanh lý"} 
                                value={<span className="whitespace-pre-wrap text-red-500 dark:text-red-400">{contract.cancellationReason}</span>} 
                            />
                        )}
                    </dl>

                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Lịch sử Hợp đồng</h3>
                        {isLoadingHistory ? (
                            <div className="text-sm text-slate-500 dark:text-slate-400">Đang tải lịch sử...</div>
                        ) : history.length > 0 ? (
                            <ul className="space-y-4">
                                {history.map((entry, index) => (
                                    <li key={index} className="flex gap-x-3">
                                        <div className="relative last:after:hidden after:absolute after:top-7 after:bottom-0 after:w-px after:bg-slate-200 dark:after:bg-slate-600 after:left-3.5">
                                            <div className="relative flex h-7 w-7 flex-none items-center justify-center bg-white dark:bg-slate-700">
                                                <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-500 ring-1 ring-slate-200 dark:ring-slate-600"></div>
                                            </div>
                                        </div>
                                        <div className="flex-grow pt-1.5">
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                <time className="font-medium text-slate-800 dark:text-slate-200">{new Date(entry.timestamp).toLocaleString()}</time>
                                                {' '}- {entry.action}
                                            </p>
                                            {entry.details && (
                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{entry.details}</p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <div className="text-sm text-slate-500 dark:text-slate-400">Không có lịch sử cho hợp đồng này.</div>
                        )}
                    </div>
                </div>
                <footer className="px-4 py-3 sm:px-6 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl text-right">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto inline-flex justify-center py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Đóng
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ContractDetailModal;