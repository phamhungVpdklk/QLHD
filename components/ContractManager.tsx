import React, { useState, useCallback, useEffect } from 'react';
import { Contract, ContractStatus } from '../types';
import { WARDS } from '../constants';
import ContractForm from './ContractForm';
import ContractTable from './ContractTable';
import ContractDetailModal from './ContractDetailModal';
import EditContractModal from './EditContractModal';
import ConfirmationModal from './ConfirmationModal';
import { supabase } from '../services/supabaseClient';

type ConfirmationAction = 'liquidate' | 'cancelContract' | 'cancelLiquidation';

interface ConfirmationState {
    isOpen: boolean;
    action: ConfirmationAction | null;
    contractId: string | null;
    title: string;
    message: string;
    requiresReason: boolean;
}

const initialConfirmationState: ConfirmationState = {
    isOpen: false,
    action: null,
    contractId: null,
    title: '',
    message: '',
    requiresReason: false,
};

const ContractManager: React.FC = () => {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewingContract, setViewingContract] = useState<Contract | null>(null);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);
    const [confirmationState, setConfirmationState] = useState<ConfirmationState>(initialConfirmationState);

    const fetchContracts = useCallback(async (showLoading = false) => {
        if (showLoading) {
            setIsLoading(true);
        }
        console.log('Tự động làm mới dữ liệu hợp đồng từ Supabase...');
        const { data, error } = await supabase
            .from('contracts_with_details') // Truy vấn từ VIEW
            .select(`*`) // ** SỬA LỖI: Bỏ truy vấn lồng `contract_history`
            .order('created_at', { ascending: false });

        if (error) {
            const errorMessage = `Lỗi khi tải hợp đồng: ${error.message}`;
            console.error(errorMessage, error);
            alert("Không thể tải danh sách hợp đồng. Vui lòng kiểm tra kết nối và thử lại. Chi tiết: " + error.message);
        } else if (data) {
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
                history: [], // ** SỬA LỖI: Khởi tạo mảng rỗng, lịch sử sẽ được tải trong modal chi tiết
            }));
            setContracts(parsedData);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchContracts(true);
        const intervalId = setInterval(() => fetchContracts(false), 30000);
        return () => clearInterval(intervalId);
    }, [fetchContracts]);

    const addContract = useCallback(async (newContractData: Omit<Contract, 'id' | 'contractNumber' | 'status' | 'createdAt' | 'history'>) => {
        setIsLoading(true);
        const { error } = await supabase.rpc('create_new_contract', {
            p_ward: newContractData.ward,
            p_owner_name: newContractData.ownerName,
            p_sheet_number: newContractData.sheetNumber,
            p_plot_number: newContractData.plotNumber,
            p_is_branch: newContractData.isBranch,
            p_notes: newContractData.notes,
        });
        if (error) {
            const errorMessage = `Lỗi khi tạo hợp đồng: ${error.message}`;
            console.error(errorMessage, error);
            alert(errorMessage);
            setIsLoading(false);
        } else {
            await fetchContracts(true);
        }
    }, [fetchContracts]);

    const updateContract = useCallback(async (id: string, updatedData: Omit<Contract, 'id' | 'contractNumber' | 'status' | 'createdAt' | 'history'>) => {
        setIsLoading(true);
        const { error } = await supabase.rpc('update_contract_details', {
            p_contract_id: id,
            p_ward: updatedData.ward,
            p_owner_name: updatedData.ownerName,
            p_sheet_number: updatedData.sheetNumber,
            p_plot_number: updatedData.plotNumber,
            p_is_branch: updatedData.isBranch,
            p_notes: updatedData.notes,
        });
        if (error) {
            const errorMessage = `Lỗi khi cập nhật hợp đồng: ${error.message}`;
            console.error(errorMessage, error);
            alert(errorMessage);
            setIsLoading(false);
        } else {
            await fetchContracts(true);
        }
        setEditingContract(null);
    }, [fetchContracts]);

    const handleLiquidationRequest = useCallback((id: string) => {
        setConfirmationState({
            isOpen: true,
            action: 'liquidate',
            contractId: id,
            title: 'Xác nhận Thanh lý Hợp đồng',
            message: 'Bạn có chắc chắn muốn thanh lý hợp đồng này không?',
            requiresReason: false,
        });
    }, []);
    
    const handleCancelContractRequest = useCallback((contractId: string) => {
        setConfirmationState({
            isOpen: true,
            action: 'cancelContract',
            contractId: contractId,
            title: 'Xác nhận Hủy Hợp đồng',
            message: 'Hành động này không thể hoàn tác. Vui lòng cung cấp lý do hủy.',
            requiresReason: true,
        });
    }, []);

    const handleCancelLiquidationRequest = useCallback((contractId: string) => {
         setConfirmationState({
            isOpen: true,
            action: 'cancelLiquidation',
            contractId: contractId,
            title: 'Xác nhận Hủy Thanh lý',
            message: 'Hợp đồng sẽ trở về trạng thái "Đang hiệu lực". Vui lòng cung cấp lý do.',
            requiresReason: true,
        });
    }, []);
    
    const handleConfirmAction = useCallback(async (reason?: string) => {
        if (!confirmationState.action || !confirmationState.contractId) return;
        
        setIsLoading(true);
        setConfirmationState(initialConfirmationState);

        let error;
        let actionDescription = '';

        switch (confirmationState.action) {
            case 'liquidate':
                actionDescription = 'thanh lý hợp đồng';
                ({ error } = await supabase.rpc('liquidate_contract', { p_contract_id: confirmationState.contractId }));
                break;
            case 'cancelContract':
                actionDescription = 'hủy hợp đồng';
                ({ error } = await supabase.rpc('cancel_contract', { p_contract_id: confirmationState.contractId, p_reason: reason }));
                break;
            case 'cancelLiquidation':
                actionDescription = 'hủy thanh lý';
                ({ error } = await supabase.rpc('cancel_liquidation', { p_contract_id: confirmationState.contractId, p_reason: reason }));
                break;
        }

        if (error) {
            const errorMessage = `Lỗi khi ${actionDescription}: ${error.message}`;
            console.error(errorMessage, error);
            alert(errorMessage);
            setIsLoading(false);
        } else {
            await fetchContracts(true);
        }
    }, [confirmationState, fetchContracts]);


    const handleViewDetails = useCallback((contract: Contract) => {
        setViewingContract(contract);
    }, []);

    const handleCloseDetails = useCallback(() => {
        setViewingContract(null);
    }, []);

    const handleStartEdit = useCallback((contract: Contract) => {
        setEditingContract(contract);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingContract(null);
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <ContractForm 
                onSave={addContract}
            />
            <ContractTable 
                contracts={contracts}
                isLoading={isLoading}
                onUpdateStatus={(id) => handleLiquidationRequest(id)} 
                onViewDetails={handleViewDetails}
                onEdit={handleStartEdit}
                onCancelContract={handleCancelContractRequest}
                onCancelLiquidation={handleCancelLiquidationRequest}
            />
            {viewingContract && (
                <ContractDetailModal 
                    contract={viewingContract} 
                    onClose={handleCloseDetails} 
                />
            )}
            {editingContract && (
                <EditContractModal 
                    contract={editingContract}
                    onSave={updateContract}
                    onClose={handleCancelEdit}
                />
            )}
            {confirmationState.isOpen && (
                <ConfirmationModal
                    title={confirmationState.title}
                    message={confirmationState.message}
                    requiresReason={confirmationState.requiresReason}
                    onConfirm={handleConfirmAction}
                    onClose={() => setConfirmationState(initialConfirmationState)}
                />
            )}
        </div>
    );
};

export default ContractManager;