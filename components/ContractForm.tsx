import React, { useState } from 'react';
import { WARDS } from '../constants';
import { Contract } from '../types';

interface ContractFormProps {
    onSave: (data: Omit<Contract, 'id' | 'contractNumber' | 'status' | 'createdAt' | 'history'>) => void;
}

const ContractForm: React.FC<ContractFormProps> = ({ onSave }) => {
    const [ward, setWard] = useState(WARDS[0]);
    const [ownerName, setOwnerName] = useState('');
    const [sheetNumber, setSheetNumber] = useState('');
    const [plotNumber, setPlotNumber] = useState('');
    const [isBranch, setIsBranch] = useState(false);
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    const resetForm = () => {
        setOwnerName('');
        setSheetNumber('');
        setPlotNumber('');
        setIsBranch(false);
        setWard(WARDS[0]);
        setNotes('');
        setErrors({});
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!ownerName.trim()) newErrors.ownerName = "Tên chủ sở hữu là bắt buộc.";
        if (!sheetNumber.trim()) newErrors.sheetNumber = "Số tờ bản đồ là bắt buộc.";
        if (!plotNumber.trim()) newErrors.plotNumber = "Số thửa đất là bắt buộc.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        onSave({ ward, ownerName, sheetNumber, plotNumber, isBranch, notes });
        
        resetForm();
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">
                Tạo Hợp đồng Mới
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="ward" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phường</label>
                        <select
                            id="ward"
                            value={ward}
                            onChange={(e) => setWard(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            {WARDS.map(w => <option key={w}>{w}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="ownerName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tên chủ sở hữu</label>
                        <input
                            type="text"
                            id="ownerName"
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm bg-white dark:bg-slate-900/50 ${errors.ownerName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500'}`}
                        />
                        {errors.ownerName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.ownerName}</p>}
                    </div>
                    <div>
                        <label htmlFor="sheetNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số tờ bản đồ</label>
                        <input
                            type="number"
                            id="sheetNumber"
                            value={sheetNumber}
                            onChange={(e) => setSheetNumber(e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm bg-white dark:bg-slate-900/50 ${errors.sheetNumber ? 'border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500'}`}
                        />
                         {errors.sheetNumber && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.sheetNumber}</p>}
                    </div>
                    <div>
                        <label htmlFor="plotNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số thửa đất</label>
                        <input
                            type="number"
                            id="plotNumber"
                            value={plotNumber}
                            onChange={(e) => setPlotNumber(e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm bg-white dark:bg-slate-900/50 ${errors.plotNumber ? 'border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500'}`}
                        />
                         {errors.plotNumber && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.plotNumber}</p>}
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ghi chú</label>
                        <textarea
                            id="notes"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Thêm ghi chú nếu cần..."
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none sm:text-sm bg-white dark:bg-slate-900/50 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
                <div className="flex items-center">
                    <input
                        id="isBranch"
                        type="checkbox"
                        checked={isBranch}
                        onChange={(e) => setIsBranch(e.target.checked)}
                        className="h-4 w-4 text-blue-600 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isBranch" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">Chi nhánh</label>
                </div>
                <div className="flex justify-end items-center gap-4">
                    <button type="submit" className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Lưu
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContractForm;