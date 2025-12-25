import { useState, useEffect, useCallback } from 'react';
import { 
    getMechanicSettingsAction,
    getMechanicSettingByIdAction,
    createMechanicSettingAction,
    updateMechanicSettingAction,
    deleteMechanicSettingAction,
    getGlobalSettingsAction,
    getGlobalSettingByKeyAction,
    updateGlobalSettingAction,
    calculateCommissionForMechanicsAction,
    isCustomMechanicSettingsEnabled,
    MechanicSetting,
    MechanicSettingWithMechanic,
    GlobalSetting,
    CommissionCalculation
} from '@/services/mechanic-settings/mechanic-settings';

export function useMechanicSettings() {
    const [mechanicSettings, setMechanicSettings] = useState<MechanicSettingWithMechanic[]>([]);
    const [globalSettings, setGlobalSettings] = useState<GlobalSetting[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadMechanicSettings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMechanicSettingsAction();
            setMechanicSettings(data);
            return data;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal memuat pengaturan mekanik';
            setError(errorMessage);
            console.error('Load mechanic settings error:', err);
            setMechanicSettings([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const loadGlobalSettings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getGlobalSettingsAction();
            setGlobalSettings(data);
            return data;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal memuat pengaturan global';
            setError(errorMessage);
            console.error('Load global settings error:', err);
            setGlobalSettings([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getMechanicSetting = useCallback(async (mechanicId: number) => {
        try {
            const setting = await getMechanicSettingByIdAction(mechanicId);
            return setting;
        } catch (err: any) {
            console.error('Get mechanic setting error:', err);
            return null;
        }
    }, []);

    const getGlobalSetting = useCallback(async (key: string) => {
        try {
            const setting = await getGlobalSettingByKeyAction(key);
            return setting?.setting_value || null;
        } catch (err: any) {
            console.error('Get global setting error:', err);
            return null;
        }
    }, []);

    const saveMechanicSetting = useCallback(async (
        setting: Omit<MechanicSetting, 'id' | 'created_at' | 'updated_at'>,
        mechanicName?: string
    ) => {
        setLoading(true);
        setError(null);
        try {
            const data = await createMechanicSettingAction(setting);
            setMechanicSettings(prev => {
                const existingIndex = prev.findIndex(s => s.mechanic_id === setting.mechanic_id);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = { ...data, mechanic_name: prev[existingIndex].mechanic_name };
                    return updated;
                }
                return [...prev, { ...data, mechanic_name: mechanicName || 'New Mechanic' }];
            });
            return data;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal menyimpan pengaturan mekanik';
            setError(errorMessage);
            console.error('Save mechanic setting error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateMechanicSetting = useCallback(async (id: number, updates: Partial<Omit<MechanicSetting, 'id' | 'created_at' | 'updated_at'>>) => {
        setLoading(true);
        setError(null);
        try {
            const data = await updateMechanicSettingAction(id, updates);
            setMechanicSettings(prev => 
                prev.map(s => s.id === id ? { ...data, mechanic_name: s.mechanic_name } : s)
            );
            return data;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal mengupdate pengaturan mekanik';
            setError(errorMessage);
            console.error('Update mechanic setting error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteMechanicSetting = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await deleteMechanicSettingAction(id);
            setMechanicSettings(prev => prev.filter(s => s.id !== id));
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal menghapus pengaturan mekanik';
            setError(errorMessage);
            console.error('Delete mechanic setting error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateGlobalSetting = useCallback(async (key: string, value: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await updateGlobalSettingAction(key, value);
            setGlobalSettings(prev => 
                prev.map(s => s.setting_key === key ? data : s)
            );
            return data;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal mengupdate pengaturan global';
            setError(errorMessage);
            console.error('Update global setting error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const calculateCommission = useCallback(async (
        mechanicIds: number[],
        totalRevenue: number,
        mechanicPercentages: { mechanic_id: number; percentage: number }[]
    ) => {
        setLoading(true);
        setError(null);
        try {
            const calculations = await calculateCommissionForMechanicsAction(
                mechanicIds, 
                totalRevenue, 
                mechanicPercentages
            );
            return calculations;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal menghitung komisi';
            setError(errorMessage);
            console.error('Calculate commission error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const checkCustomSettingsEnabled = useCallback(async () => {
        try {
            return await isCustomMechanicSettingsEnabled();
        } catch (err: any) {
            console.error('Check custom settings enabled error:', err);
            return true; // Default fallback
        }
    }, []);

    useEffect(() => {
        loadMechanicSettings();
        loadGlobalSettings();
    }, [loadMechanicSettings, loadGlobalSettings]);

    return {
        mechanicSettings,
        globalSettings,
        loading,
        error,
        loadMechanicSettings,
        loadGlobalSettings,
        getMechanicSetting,
        getGlobalSetting,
        saveMechanicSetting,
        updateMechanicSetting,
        deleteMechanicSetting,
        updateGlobalSetting,
        calculateCommission,
        checkCustomSettingsEnabled
    };
}

// Helper hook for getting specific global settings
export function useGlobalSetting(key: string) {
    const [value, setValue] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { getGlobalSetting, updateGlobalSetting } = useMechanicSettings();

    useEffect(() => {
        const loadValue = async () => {
            setLoading(true);
            try {
                const settingValue = await getGlobalSetting(key);
                setValue(settingValue);
            } catch (error) {
                console.error('Error loading global setting:', error);
            } finally {
                setLoading(false);
            }
        };

        loadValue();
    }, [key, getGlobalSetting]);

    const updateValue = useCallback(async (newValue: string) => {
        try {
            await updateGlobalSetting(key, newValue);
            setValue(newValue);
        } catch (error) {
            console.error('Error updating global setting:', error);
            throw error;
        }
    }, [key, updateGlobalSetting]);

    return { value, loading, updateValue };
}