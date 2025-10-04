import React, { useState, useEffect } from 'react';

interface ConfirmationModalProps {
    title: string;
    message: string;
    requiresReason: boolean;
    onConfirm: (reason?: string) => void;
    onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, requiresReason, onConfirm, onClose }) => {
    const [reason, setReason] = useState('');
    const [isConfirmDisabled, setIsConfirmDisabled] = useState(requiresReason);

    useEffect(() => {
        if (requiresReason) {
            setIsConfirmDisabled(reason.trim() === '');
        }
    }, [reason, requiresReason]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleConfirm = () => {
        onConfirm(requiresReason ? reason : undefined);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 dark:bg-opacity-80 backdrop-blur-sm animate-fade-in-fast"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md m-4 transform animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 sm:mx-0 sm:h-10 sm:w-10">
                             <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                            </svg>
                        </div>
                        <div className="mt-0 text-left flex-1">
                            <h3 className="text-lg font-semibold leading-6 text-slate-900 dark:text-slate-200" id="confirmation-title">
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>

                    {requiresReason && (
                        <div className="mt-4">
                            <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Lý do <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="reason"
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none sm:text-sm bg-white dark:bg-slate-900/50 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập lý do..."
                            />
                        </div>
                    )}
                </div>
                <footer className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl flex flex-col-reverse sm:flex-row sm:justify-end items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                        className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        Xác nhận
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ConfirmationModal;
