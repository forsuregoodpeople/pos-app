# Supabase Migration Guide

## Cara Menjalankan Migration

1. **Buka Supabase Dashboard**
   - Login ke [supabase.com](https://supabase.com)
   - Pilih project Anda
   - Klik menu "SQL Editor" di sidebar

2. **Jalankan Migration 001 (RBAC Tables)**
   ```sql
   -- Buka file supabase/migrations/001_create_rbac_tables.sql
   -- Copy semua isi file tersebut
   -- Paste di SQL Editor dan jalankan
   ```

3. **Jalankan Migration 002-005 (Business Tables)**
   ```sql
   -- Buka file supabase/migrations/002_create_data_barang_table.sql
   -- Copy semua isi file tersebut
   -- Paste di SQL Editor dan jalankan
   
   -- Buka file supabase/migrations/003_create_data_jasa_table.sql
   -- Copy semua isi file tersebut
   -- Paste di SQL Editor dan jalankan
   
   -- Buka file supabase/migrations/004_create_data_mekanik_table.sql
   -- Copy semua isi file tersebut
   -- Paste di SQL Editor dan jalankan
   
   -- Buka file supabase/migrations/005_create_data_transaksi_table.sql
   -- Copy semua isi file tersebut
   -- Paste di SQL Editor dan jalankan
   ```

4. **Jalankan Migration 006 (Assign Role Permissions)**
   ```sql
   -- Buka file supabase/migrations/006_assign_role_permissions.sql
   -- Copy semua isi file tersebut
   -- Paste di SQL Editor dan jalankan
   ```

## Struktur Migration

- **001_create_rbac_tables.sql**: Membuat tabel-tabel untuk Role-Based Access Control (RBAC)
  - `users`: Tabel user
  - `roles`: Tabel role (admin, manager, kasir, mekanik)
  - `permissions`: Tabel permissions
  - `role_permissions`: Hubungan many-to-many antara role dan permission
  - `user_roles`: Hubungan many-to-many antara user dan role

- **002_create_data_barang_table.sql**: Membuat tabel data barang
  - `data_barang`: Data barang/sparepart

- **003_create_data_jasa_table.sql**: Membuat tabel data jasa
  - `data_jasa`: Data jasa layanan

- **004_create_data_mekanik_table.sql**: Membuat tabel data mekanik
  - `data_mekanik`: Data mekanik

- **005_create_data_transaksi_table.sql**: Membuat tabel data transaksi
  - `data_transaksi`: Data transaksi

- **006_assign_role_permissions.sql**: Mengassign permissions ke role
  - Memberikan permissions ke role kasir dan mekanik

## Default Data

### User Default
- **Email**: admin@nota-app.com
- **Password**: admin123
- **Role**: admin

### Role Default
1. **admin**: Administrator dengan akses penuh
2. **manager**: Manager dengan akses ke sebagian besar fitur
3. **kasir**: Kasir dengan akses terbatas ke POS dan transaksi
4. **mekanik**: Mekanik dengan akses ke data transaksi terbatas

### Permissions
Permissions dibagi berdasarkan resource dan action:
- **users**: create, read, update, delete
- **roles**: create, read, update, delete
- **permissions**: create, read, update, delete
- **barang**: create, read, update, delete
- **jasa**: create, read, update, delete
- **mekanik**: create, read, update, delete
- **transaksi**: create, read, update, delete
- **pos**: access
- **dashboard**: access

## Environment Variables

Setelah migration selesai, update file `.env.local` Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Catatan Penting

1. Pastikan menjalankan migration secara berurutan:
   - 001 (RBAC Tables)
   - 002 (Data Barang)
   - 003 (Data Jasa)
   - 004 (Data Mekanik)
   - 005 (Data Transaksi)
   - 006 (Assign Role Permissions)
2. Default password untuk admin adalah `admin123`, segera ganti setelah login
3. RLS (Row Level Security) di-enable untuk semua tabel dengan policy allow all
4. Sesuaikan RLS policies sesuai kebutuhan keamanan aplikasi Anda
5. Migration ini menggunakan `ON CONFLICT DO NOTHING` untuk aman dijalankan berulang kali
6. Setiap migration terpisah memudahkan untuk rollback dan debugging jika terjadi masalah