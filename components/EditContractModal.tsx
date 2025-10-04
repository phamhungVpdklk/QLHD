import React, { useState, useEffect } from 'react';
import { Contract } from '../types';
import { WARDS } from '../constants';
import ConfirmationModal from './ConfirmationModal';

interface EditContractModalProps {
    contract: Contract;
    onSave: (id: string, data: Omit<Contract, 'id' | 'contractNumber' | 'status' | 'createdAt' | 'history'>) => void;
    onClose: () => void;
}

const EditContractModal: React.FC<EditContractModalProps> = ({ contract, onSave, onClose }) => {
    const [ward, setWard] = useState(contract.ward);
    const [ownerName, setOwnerName] = useState(contract.ownerName);
    const [sheetNumber, setSheetNumber] = useState(contract.sheetNumber);
    const [plotNumber, setPlotNumber] = useState(contract.plotNumber);
    const [isBranch, setIsBranch] = useState(contract.isBranch);
    const [notes, setNotes] = useState(contract.notes || '');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!ownerName.trim()) newErrors.ownerName = "Tên chủ sở hữu là bắt buộc.";
        if (!sheetNumber.toString().trim()) newErrors.sheetNumber = "Số tờ bản đồ là bắt buộc.";
        if (!plotNumber.toString().trim()) newErrors.plotNumber = "Số thửa đất là bắt buộc.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setShowConfirmation(true);
    };

    const handleConfirmSave = () => {
        onSave(contract.id, { ward, ownerName, sheetNumber, plotNumber, isBranch, notes });
    };

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 dark:bg-opacity-80 backdrop-blur-sm animate-fade-in-fast"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-contract-title"
            >
                <div
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl m-4 transform animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700">
                        <h2 id="edit-contract-title" className="text-xl font-bold text-slate-800 dark:text-slate-200">
                            Chỉnh sửa Hợp đồng
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
                    <form onSubmit={handleSubmit}>
                        <div className="p-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-500 dark:text-slate-400">Số Hợp đồng</span>
                                    <span className="font-mono text-slate-800 dark:text-slate-200">{contract.contractNumber}</span>
                                </div>
                                 <div className="flex flex-col">
                                    <span className="font-medium text-slate-500 dark:text-slate-400">Ngày Tạo</span>
                                    <span className="text-slate-800 dark:text-slate-200">{new Date(contract.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="edit-ward" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phường</label>
                                    <select
                                        id="edit-ward"
                                        value={ward}
                                        onChange={(e) => setWard(e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    >
                                        {WARDS.map(w => <option key={w}>{w}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="edit-ownerName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tên chủ sở hữu</label>
                                    <input
                                        type="text"
                                        id="edit-ownerName"
                                        value={ownerName}
                                        onChange={(e) => setOwnerName(e.target.value)}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm bg-white dark:bg-slate-900/50 ${errors.ownerName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500'}`}
                                    />
                                    {errors.ownerName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.ownerName}</p>}
                                </div>
                                <div>
                                    <label htmlFor="edit-sheetNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số tờ bản đồ</label>
                                    <input
                                        type="number"
                                        id="edit-sheetNumber"
                                        value={sheetNumber}
                                        onChange={(e) => setSheetNumber(e.target.value)}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm bg-white dark:bg-slate-900/50 ${errors.sheetNumber ? 'border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500'}`}
                                    />
                                    {errors.sheetNumber && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.sheetNumber}</p>}
                                </div>
                                <div>
                                    <label htmlFor="edit-plotNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số thửa đất</label>
                                    <input
                                        type="number"
                                        id="edit-plotNumber"
                                        value={plotNumber}
                                        onChange={(e) => setPlotNumber(e.target.value)}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm bg-white dark:bg-slate-900/50 ${errors.plotNumber ? 'border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500'}`}
                                    />
                                    {errors.plotNumber && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.plotNumber}</p>}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="edit-notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ghi chú</label>
                                <textarea
                                    id="edit-notes"
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none sm:text-sm bg-white dark:bg-slate-900/50 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="edit-isBranch"
                                    type="checkbox"
                                    checked={isBranch}
                                    onChange={(e) => setIsBranch(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="edit-isBranch" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">Chi nhánh</label>
                            </div>
                        </div>
                        <footer className="px-4 py-3 sm:px-6 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl flex flex-col-reverse sm:flex-row sm:justify-end items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Lưu thay đổi
                            </button>
                        </footer>
                    </form>
                </div>
            </div>
            {showConfirmation && (
                <ConfirmationModal
                    title="Xác nhận Lưu thay đổi"
                    message="Bạn có chắc chắn muốn lưu các thông tin đã chỉnh sửa cho hợp đồng này không?"
                    requiresReason={false}
                    onConfirm={handleConfirmSave}
                    onClose={() => setShowConfirmation(false)}
                />
            )}
        </>
    );
};

export default EditContractModal;