# Setup Superadmin User

## Cara Membuat Superadmin User

### Option 1: Manual via Supabase Dashboard (Recommended)

1. **Buat User di Supabase Auth**
   - Buka Supabase Dashboard
   - Pilih project Anda
   - Go to **Authentication** > **Users**
   - Klik **Add user**
   - Masukkan:
     - Email: `superadmin@sunda-servis.com`
     - Password: `superadmin_password123`
   - Set **Auto-confirm** ke ON
   - Klik **Save**

2. **Jalankan SQL Script**
   - Go to **SQL Editor**
   - Copy dan paste isi dari `supabase/create-superadmin.sql`
   - Klik **Run**

### Option 2: Menggunakan Script

1. **Tambahkan Service Role Key ke .env**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   - Dapatkan dari Supabase Dashboard > Settings > API

2. **Install dependencies (jika belum)**
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

3. **Jalankan script**
   ```bash
   # Untuk TypeScript version
   npx tsx scripts/create-superadmin.ts
   
   # Atau untuk JavaScript version
   node scripts/create-superadmin.js
   ```

## Login Credentials

Setelah setup selesai, Anda bisa login dengan:

- **Email**: `superadmin@sunda-servis.com`
- **Password**: `superadmin_password123`

## Verifikasi

Untuk memverifikasi bahwa superadmin user berhasil dibuat:

1. Login ke aplikasi dengan credentials di atas
2. Atau jalankan query berikut di SQL Editor:

```sql
SELECT 
    u.email,
    u.name,
    u.is_active,
    r.name as role_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'superadmin@sunda-servis.com';
```

## Troubleshooting

### Error "User already registered"
- User sudah ada di Supabase Auth
- Lanjutkan ke step 2 (jalankan SQL script)

### Error "Permission denied"
- Pastikan Anda menggunakan Service Role Key
- Pastikan RLS policies memungkinkan operasi

### Error "Table not found"
- Pastikan Anda sudah menjalankan semua migration files
- Jalankan schema.sql terlebih dahulu