import { supabase } from '@/lib/supabase';

export interface MechanicSetting {
    id: number;
    mechanic_id: number;
    shop_cut_percentage: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface MechanicSettingWithMechanic extends MechanicSetting {
    mechanic_name: string;
}

export interface GlobalSetting {
    id: string;
    setting_key: string;
    setting_value: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface CommissionCalculation {
    mechanic_id: number;
    mechanic_name: string;
    total_revenue: number;
    shop_cut_percentage: number;
    shop_cut_amount: number;
    mechanic_share_amount: number;
    mechanic_commission_percentage: number;
    final_commission_amount: number;
}

// Mechanic Settings functions
export async function getMechanicSettingsAction(): Promise<MechanicSettingWithMechanic[]> {
    try {
        // First try the join query
        const { data, error } = await supabase
            .from('mechanic_settings')
            .select(`
                *,
                data_mekanik(name)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            // Check if table doesn't exist or permission denied
            if (error.code === 'PGRST116' || error.code === '42501') {
                console.log('Mechanic settings table not found or no permission, returning empty array');
                return [];
            }
            
            // Fallback: try without join if the join fails
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('mechanic_settings')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (fallbackError) {
                // Check if table doesn't exist
                if (fallbackError.code === 'PGRST116' || fallbackError.code === '42501') {
                    console.log('Mechanic settings table not found, returning empty array');
                    return [];
                }
                console.error('Error fetching mechanic settings (fallback):', fallbackError);
                return [];
            }

            // Get mechanic names separately
            const result = await Promise.all(
                (fallbackData || []).map(async (item) => {
                    try {
                        const { data: mechanic } = await supabase
                            .from('data_mekanik')
                            .select('name')
                            .eq('id', item.mechanic_id)
                            .single();
                        
                        return {
                            ...item,
                            mechanic_name: mechanic?.name || 'Unknown'
                        };
                    } catch {
                        return {
                            ...item,
                            mechanic_name: 'Unknown'
                        };
                    }
                })
            );
            
            console.log('Mechanic settings fetched successfully (fallback):', result.length, 'items');
            return result;
        }
        
        const result = data?.map(item => ({
            ...item,
            mechanic_name: item.data_mekanik?.name || 'Unknown'
        })) || [];
        
        console.log('Mechanic settings fetched successfully:', result.length, 'items');
        return result;
    } catch (error) {
        console.error('Error fetching mechanic settings:', error);
        // Return empty array instead of throwing error to prevent page crash
        return [];
    }
}

export async function getMechanicSettingByIdAction(mechanicId: number): Promise<MechanicSetting | null> {
    try {
        const { data, error } = await supabase
            .from('mechanic_settings')
            .select('*')
            .eq('mechanic_id', mechanicId)
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            if (Object.keys(error).length > 0) {
                console.error('Error fetching mechanic setting by ID:', error);
            }
            return null;
        }
        return data;
    } catch (error) {
        console.error('Error fetching mechanic setting by ID:', error);
        throw new Error('Gagal mengambil pengaturan mekanik');
    }
}

export async function createMechanicSettingAction(setting: Omit<MechanicSetting, 'id' | 'created_at' | 'updated_at'>): Promise<MechanicSetting> {
    try {
        const { data, error } = await supabase
            .from('mechanic_settings')
            .upsert(setting, {
                onConflict: 'mechanic_id'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating mechanic setting:', error);
        throw new Error('Gagal menambah pengaturan mekanik');
    }
}

export async function updateMechanicSettingAction(id: number, setting: Partial<Omit<MechanicSetting, 'id' | 'created_at' | 'updated_at'>>): Promise<MechanicSetting> {
    try {
        const { data, error } = await supabase
            .from('mechanic_settings')
            .update({ ...setting, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating mechanic setting:', error);
        throw new Error('Gagal mengupdate pengaturan mekanik');
    }
}

export async function deleteMechanicSettingAction(id: number): Promise<void> {
    try {
        const { error } = await supabase
            .from('mechanic_settings')
            .update({ is_active: false })
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting mechanic setting:', error);
        throw new Error('Gagal menghapus pengaturan mekanik');
    }
}

// Global Settings functions
export async function getGlobalSettingsAction(): Promise<GlobalSetting[]> {
    try {
        const { data, error } = await supabase
            .from('global_settings')
            .select('*')
            .order('setting_key', { ascending: true });

        if (error) {
            // Check if table doesn't exist or permission denied
            if (error.code === 'PGRST116' || error.code === '42501') {
                console.log('Global settings table not found or no permission, returning empty array');
                return [];
            }
            if (error && Object.keys(error).length > 0) {
                console.error('Error fetching global settings:', error);
            }
            return [];
        }
        return data || [];
    } catch (error) {
        console.error('Error fetching global settings:', error);
        return [];
    }
}

export async function getGlobalSettingByKeyAction(key: string): Promise<GlobalSetting | null> {
    try {
        const { data, error } = await supabase
            .from('global_settings')
            .select('*')
            .eq('setting_key', key)
            .single();

        if (error) {
            // Check if table doesn't exist or permission denied
            if (error.code === 'PGRST116' || error.code === '42501') {
                console.log(`Global setting '${key}' not found or table not accessible`);
                return null;
            }
            if (error && Object.keys(error).length > 0) {
                console.error('Error fetching global setting by key:', error);
            }
            // Return null instead of throwing error to prevent page crash
            return null;
        }
        return data;
    } catch (error) {
        if (error && Object.keys(error).length > 0) {
            console.error('Error fetching global setting by key:', error);
        }
        // Return null instead of throwing error to prevent page crash
        return null;
    }
}

export async function updateGlobalSettingAction(key: string, value: string): Promise<GlobalSetting> {
    try {
        const { data, error } = await supabase
            .from('global_settings')
            .upsert({
                setting_key: key,
                setting_value: value,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'setting_key'
            })
            .select()
            .single();

        if (error) {
            console.error('SERVER ERROR: updateGlobalSettingAction Supabase error:', JSON.stringify(error, null, 2));
            throw new Error(`Gagal mengupdate pengaturan global: ${error.message} (Code: ${error.code})`);
        }
        return data;
    } catch (error: any) {
        console.error('SERVER ERROR: updateGlobalSettingAction Exception:', error);
        throw new Error(`Gagal mengupdate pengaturan global: ${error.message || 'Unknown error'}`);
    }
}

// Commission calculation functions
export async function calculateCommissionForMechanicsAction(
    mechanicIds: number[],
    totalRevenue: number,
    mechanicPercentages: { mechanic_id: number; percentage: number }[]
): Promise<CommissionCalculation[]> {
    try {
        // Get mechanic settings
        const { data: settings, error: settingsError } = await supabase
            .from('mechanic_settings')
            .select('*')
            .in('mechanic_id', mechanicIds)
            .eq('is_active', true);

        if (settingsError) {
            if (settingsError && Object.keys(settingsError).length > 0) {
                console.error('Error fetching mechanic settings for commission:', settingsError);
            }
            // Continue with empty settings if error occurs
        }

        // Get default shop cut percentage
        const defaultShopCut = await getDefaultShopCutPercentage();

        const calculations: CommissionCalculation[] = [];

        for (const mechanicPercentage of mechanicPercentages) {
            const setting = settings?.find(s => s.mechanic_id === mechanicPercentage.mechanic_id);
            const shopCutPercentage = setting?.shop_cut_percentage || defaultShopCut;
            
            const shopCutAmount = (totalRevenue * shopCutPercentage) / 100;
            const mechanicShareAmount = totalRevenue - shopCutAmount;
            const finalCommissionAmount = (mechanicShareAmount * mechanicPercentage.percentage) / 100;

            // Get mechanic name with error handling
            let mechanicName = 'Unknown';
            try {
                const { data: mechanic } = await supabase
                    .from('data_mekanik')
                    .select('name')
                    .eq('id', mechanicPercentage.mechanic_id)
                    .single();
                
                mechanicName = mechanic?.name || 'Unknown';
            } catch (mechanicError) {
                if (mechanicError && Object.keys(mechanicError).length > 0) {
                    console.error(`Error fetching mechanic name for ${mechanicPercentage.mechanic_id}:`, mechanicError);
                }
                mechanicName = 'Unknown';
            }

            calculations.push({
                mechanic_id: mechanicPercentage.mechanic_id,
                mechanic_name: mechanicName,
                total_revenue: totalRevenue,
                shop_cut_percentage: shopCutPercentage,
                shop_cut_amount: shopCutAmount,
                mechanic_share_amount: mechanicShareAmount,
                mechanic_commission_percentage: mechanicPercentage.percentage,
                final_commission_amount: finalCommissionAmount
            });
        }

        return calculations;
    } catch (error) {
        if (error && Object.keys(error).length > 0) {
            console.error('Error calculating commission for mechanics:', error);
        }
        // Return empty array instead of throwing error to prevent page crash
        return [];
    }
}

// Helper function to get default shop cut percentage
async function getDefaultShopCutPercentage(): Promise<number> {
    try {
        const setting = await getGlobalSettingByKeyAction('default_shop_cut_percentage');
        return setting ? parseFloat(setting.setting_value) : 50.0;
    } catch {
        return 50.0; // Default fallback
    }
}

// Helper function to check if custom mechanic settings are enabled
export async function isCustomMechanicSettingsEnabled(): Promise<boolean> {
    try {
        const setting = await getGlobalSettingByKeyAction('enable_custom_mechanic_settings');
        return setting ? setting.setting_value === 'true' : true;
    } catch {
        return true; // Default fallback
    }
}