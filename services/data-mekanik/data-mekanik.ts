'use server'

import { supabase } from '@/lib/supabase';
import { DataMekanik } from '@/hooks/useDataMekanik';

interface DataMekanikRow {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export async function getMechaAction(): Promise<DataMekanik[]> {
    try {
        const { data, error } = await supabase
            .from('data_mekanik')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching mekaniks from Supabase:', error);
            throw new Error(`Gagal mengambil data dari database: ${error.message}`);
        }

        const mekaniks: DataMekanik[] = (data as DataMekanikRow[]).map((row) => ({
            id: row.id.toString(),
            name: row.name,
        }));

        return mekaniks;
    } catch (error) {
        console.error('Error fetching mekaniks from Supabase:', error);
        throw new Error(`Gagal mengambil data dari database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function updateMechaAction(mekanik: DataMekanik) {
    try {
        const id = Number.parseInt(mekanik.id);
        if (Number.isNaN(id)) {
            throw new TypeError(`ID Mekanik tidak valid: ${mekanik.id}`);
        }

        // Check if mekanik exists
        const { data: existingRows, error } = await supabase
            .from('data_mekanik')
            .select('id')
            .eq('id', id);

        if (error) {
            console.error('Error checking existing mekanik:', error);
            throw new Error(`Gagal memeriksa mekanik: ${error.message}`);
        }

        if (existingRows.length === 0) {
            throw new Error(`Mekanik dengan ID ${mekanik.id} tidak ditemukan.`);
        }

        // Update mekanik
        const { error: updateError } = await supabase
            .from('data_mekanik')
            .update({ name: mekanik.name })
            .eq('id', id);

        if (updateError) {
            console.error('Error updating mekanik:', updateError);
            throw new Error(`Gagal update data: ${updateError.message}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating mekanik:', error);
        throw new Error(`Gagal update data di database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function deleteMechaAction(id: string) {
    try {
        const mekanikId = Number.parseInt(id);
        if (Number.isNaN(mekanikId)) {
            throw new TypeError(`ID Mekanik tidak valid: ${id}`);
        }

        // Check if mekanik exists
        const { data: existingRows, error } = await supabase
            .from('data_mekanik')
            .select('id')
            .eq('id', mekanikId);

        if (error) {
            console.error('Error checking existing mekanik:', error);
            throw new Error(`Gagal memeriksa mekanik: ${error.message}`);
        }

        if (existingRows.length === 0) {
            throw new Error(`Mekanik dengan ID ${id} tidak ditemukan untuk dihapus.`);
        }

        // Delete mekanik
        const { error: deleteError } = await supabase
            .from('data_mekanik')
            .delete()
            .eq('id', mekanikId);

        if (deleteError) {
            console.error('Error deleting mekanik:', deleteError);
            throw new Error(`Gagal menghapus mekanik: ${deleteError.message}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Server Action Delete Error:', error);
        throw new Error(`Gagal menghapus data dari database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function addMechaAction(mekanik: DataMekanik): Promise<DataMekanik> {
    try {
        // Insert new mekanik
        const { data, error } = await supabase
            .from('data_mekanik')
            .insert({ name: mekanik.name })
            .select()
            .single();

        if (error) {
            console.error('Error adding mekanik:', error);
            throw new Error(`Gagal menambah mekanik: ${error.message}`);
        }

        return {
            id: data.id.toString(),
            name: data.name,
        };
    } catch (error) {
        console.error('Server Action Add Error:', error);
        throw new Error(`Gagal menambah data ke database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
