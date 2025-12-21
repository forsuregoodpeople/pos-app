# Manual Migration Instructions

## Problem
Error: `Could not find 'mechanic_commissions' column of 'data_transaksi' in schema cache`

## Solution
Jalankan migration ini secara manual di Supabase SQL Editor:

```sql
-- Add mechanic_commissions column to data_transaksi table
ALTER TABLE data_transaksi ADD COLUMN IF NOT EXISTS mechanic_commissions JSONB DEFAULT NULL;
```

## Steps
1. Buka Supabase Dashboard
2. Pilih project anda
3. Klik "SQL Editor" di sidebar
4. Copy dan paste SQL di atas
5. Klik "Run" untuk menjalankan migration
6. Verifikasi column berhasil ditambahkan dengan query:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'data_transaksi' 
   AND column_name = 'mechanic_commissions';
   ```

## Setelah Migration
Setelah migration berhasil dijalankan:
1. Restart development server
2. Coba checkout lagi untuk memastikan error tidak muncul lagi

## Alternative
Jika masih error, coba:
1. Clear browser cache
2. Restart Supabase service
3. Refresh schema cache dengan query:
   ```sql
   NOTIFY pgrn_master; 
   SELECT pg_reload_conf();