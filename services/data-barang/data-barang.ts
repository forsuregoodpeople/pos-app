'use server'

import { supabase } from '@/lib/supabase';
import { Part } from '@/hooks/useProducts';
import { CartItem } from '@/hooks';

interface DataBarangRow {
    id: number;
    code: string;
    name: string;
    category: string;
    initial_quantity: number;
    quantity: number;
    price: number;
    type: 'mutasi' | 'bengkel';
    created_at: string;
    updated_at: string;
}

export async function getPartsAction(): Promise<Part[]> {
    try {
        const { data, error } = await supabase
            .from('data_barang')
            .select('*')
            .order('code', { ascending: true });

        if (error) {
            console.error('Error fetching parts from Supabase:', error);
            throw new Error(`Gagal mengambil data dari database: ${error.message}`);
        }

        const parts: Part[] = (data as DataBarangRow[]).map((row) => ({
            id: row.code,
            code: row.code,
            name: row.name,
            quantity: row.quantity,
            price: Number(row.price),
            type: row.type,
        }));

        return parts;
    } catch (error) {
        console.error('Error fetching parts from Supabase:', error);
        throw new Error(`Gagal mengambil data dari database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function updateStockAction(items: CartItem[]): Promise<{ success: boolean }> {
    try {
        for (const item of items) {
            // Only update stock for parts, not services
            if (item.type !== 'part') {
                continue;
            }

            const { id, qty } = item;

            // Get current stock
            const { data: currentRows, error } = await supabase
                .from('data_barang')
                .select('quantity')
                .eq('code', id);

            if (error) {
                console.error('Error fetching current stock:', error);
                throw new Error(`Gagal mengambil stok saat ini: ${error.message}`);
            }

            if (currentRows.length === 0) {
                console.warn(`Barang dengan code ${id} tidak ditemukan di database. Melewati update stok.`);
                continue;
            }

            const currentStock = currentRows[0].quantity;
            const newStock = currentStock - qty;

            // Update stock
            const { error: updateError } = await supabase
                .from('data_barang')
                .update({ quantity: newStock })
                .eq('code', id);

            if (updateError) {
                console.error('Error updating stock:', updateError);
                throw new Error(`Gagal update stok: ${updateError.message}`);
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating stock:', error);
        const errorMessage = error instanceof Error
            ? `Gagal menyimpan kuantitas transaksi: ${error.message}`
            : 'Gagal menyimpan kuantitas transaksi di database';
        throw new Error(errorMessage);
    }
}

export async function updatePartAction(code: string, updates: { code?: string; name?: string; price?: number; type?: 'mutasi' | 'bengkel' }) {
    try {
        // Check if part exists
        const { data: existingRows, error } = await supabase
            .from('data_barang')
            .select('*')
            .eq('code', code);

        if (error) {
            console.error('Error checking existing part:', error);
            throw new Error(`Gagal memeriksa barang: ${error.message}`);
        }

        if (existingRows.length === 0) {
            throw new Error(`Barang dengan code ${code} tidak ditemukan.`);
        }

        const currentPart = existingRows[0];

        // Build update object dynamically
        const updateData: any = {};

        if (updates.code !== undefined && updates.code !== currentPart.code) {
            // Check if new code already exists
            if (updates.code !== code) {
                const { data: codeCheck, error: codeCheckError } = await supabase
                    .from('data_barang')
                    .select('code')
                    .eq('code', updates.code);

                if (codeCheckError) {
                    console.error('Error checking new code:', codeCheckError);
                    throw new Error(`Gagal memeriksa kode baru: ${codeCheckError.message}`);
                }

                if (codeCheck.length > 0) {
                    throw new Error(`Barang dengan kode ${updates.code} sudah ada.`);
                }
            }
            updateData.code = updates.code;
        }

        if (updates.name !== undefined && updates.name !== currentPart.name) {
            updateData.name = updates.name;
        }

        if (updates.price !== undefined && updates.price !== currentPart.price) {
            updateData.price = updates.price;
        }

        if (updates.type !== undefined && updates.type !== currentPart.type) {
            updateData.type = updates.type;
        }

        if (Object.keys(updateData).length === 0) {
            return { success: true };
        }

        // Update part
        const { error: updateError } = await supabase
            .from('data_barang')
            .update(updateData)
            .eq('code', code);

        if (updateError) {
            console.error('Error updating part:', updateError);
            throw new Error(`Gagal update data: ${updateError.message}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating part:', error);
        throw new Error(`Gagal update data di database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function addPartAction(item: { code: string; name: string; price: number; type?: 'mutasi' | 'bengkel' }) {
    try {
        // Check if code already exists
        const { data: existingRows, error } = await supabase
            .from('data_barang')
            .select('code')
            .eq('code', item.code);

        if (error) {
            console.error('Error checking existing code:', error);
            throw new Error(`Gagal memeriksa kode: ${error.message}`);
        }

        if (existingRows.length > 0) {
            throw new Error(`Barang dengan kode ${item.code} sudah ada.`);
        }

        // Insert new part
        const { error: insertError } = await supabase
            .from('data_barang')
            .insert({
                code: item.code,
                name: item.name,
                category: '', // category (empty for now)
                initial_quantity: 0, // initial_quantity
                quantity: 0, // quantity (current stock)
                price: item.price,
                type: item.type || 'mutasi'
            });

        if (insertError) {
            console.error('Error adding part:', insertError);
            throw new Error(`Gagal menambah barang: ${insertError.message}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error adding part:', error);
        throw new Error(`Gagal menambah data barang: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function deletePartAction(id: string) {
    try {
        // Check if part exists
        const { data: existingRows, error } = await supabase
            .from('data_barang')
            .select('code')
            .eq('code', id);

        if (error) {
            console.error('Error checking existing part:', error);
            throw new Error(`Gagal memeriksa barang: ${error.message}`);
        }

        if (existingRows.length === 0) {
            throw new Error(`Barang dengan ID ${id} tidak ditemukan untuk dihapus.`);
        }

        // Delete part
        const { error: deleteError } = await supabase
            .from('data_barang')
            .delete()
            .eq('code', id);

        if (deleteError) {
            console.error('Error deleting part:', deleteError);
            throw new Error(`Gagal menghapus barang: ${deleteError.message}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Server Action Delete Error:', error);
        throw new Error(`Gagal menghapus data dari database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
