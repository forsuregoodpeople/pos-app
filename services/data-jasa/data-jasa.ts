'use server'

import { createClient } from '@/lib/supabase-server';
import { DataJasa } from '@/hooks/useDataJasa';

interface DataJasaRow {
    id: number;
    name: string;
    price: number;
    created_at: string;
    updated_at: string;
}

export async function getJasaAction(): Promise<DataJasa[]> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('data_jasa')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching jasa from Supabase:', error);
            throw new Error(`Gagal mengambil data dari database: ${error.message}`);
        }

        const jasa: DataJasa[] = (data as DataJasaRow[]).map((row) => ({
            id: row.id.toString(),
            name: row.name,
            price: Number(row.price),
        }));

        return jasa;
    } catch (error) {
        console.error('Error fetching jasa from Supabase:', error);
        throw new Error(`Gagal mengambil data dari database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function updateJasaAction(jasa: DataJasa) {
    try {
        const supabase = await createClient();
        const id = Number.parseInt(jasa.id);
        if (Number.isNaN(id)) {
            throw new TypeError(`ID Jasa tidak valid: ${jasa.id}`);
        }

        // Check if jasa exists
        const { data: existingRows, error } = await supabase
            .from('data_jasa')
            .select('id')
            .eq('id', id);

        if (error) {
            console.error('Error checking existing jasa:', error);
            throw new Error(`Gagal memeriksa jasa: ${error.message}`);
        }

        if (existingRows.length === 0) {
            throw new Error(`Jasa dengan ID ${jasa.id} tidak ditemukan.`);
        }

        // Update jasa
        const { error: updateError } = await supabase
            .from('data_jasa')
            .update({ name: jasa.name, price: jasa.price })
            .eq('id', id);

        if (updateError) {
            console.error('Error updating jasa:', updateError);
            throw new Error(`Gagal update data: ${updateError.message}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating jasa:', error);
        throw new Error(`Gagal update data di database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function deleteJasaAction(id: string) {
    try {
        const supabase = await createClient();
        const jasaId = Number.parseInt(id);
        if (Number.isNaN(jasaId)) {
            throw new TypeError(`ID Jasa tidak valid: ${id}`);
        }

        // Check if jasa exists
        const { data: existingRows, error } = await supabase
            .from('data_jasa')
            .select('id')
            .eq('id', jasaId);

        if (error) {
            console.error('Error checking existing jasa:', error);
            throw new Error(`Gagal memeriksa jasa: ${error.message}`);
        }

        if (existingRows.length === 0) {
            throw new Error(`Jasa dengan ID ${id} tidak ditemukan untuk dihapus.`);
        }

        // Delete jasa
        const { error: deleteError } = await supabase
            .from('data_jasa')
            .delete()
            .eq('id', jasaId);

        if (deleteError) {
            console.error('Error deleting jasa:', deleteError);
            throw new Error(`Gagal menghapus jasa: ${deleteError.message}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Server Action Delete Error:', error);
        throw new Error(`Gagal menghapus data dari database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function addJasaAction(jasa: DataJasa): Promise<DataJasa> {
    try {
        const supabase = await createClient();
        // Insert new jasa
        const { data, error } = await supabase
            .from('data_jasa')
            .insert({ name: jasa.name, price: jasa.price })
            .select()
            .single();

        if (error) {
            console.error('Error adding jasa:', error);
            throw new Error(`Gagal menambah jasa: ${error.message}`);
        }

        return {
            id: data.id.toString(),
            name: data.name,
            price: data.price,
        };
    } catch (error) {
        console.error('Server Action Add Error:', error);
        throw new Error(`Gagal menambah data ke database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
