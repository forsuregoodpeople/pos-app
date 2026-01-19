# Nota Sunda Service - Invoice System

Sistem invoice/POS untuk bengkel otomotif dengan database MySQL.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment Variables

Copy file template environment:
```bash
cp env.example .env.local
```

Edit `.env.local` dan isi dengan nilai yang sesuai. Lihat [ENV_SETUP.md](./ENV_SETUP.md) untuk panduan lengkap.

**Environment Variables yang diperlukan:**
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### 3. Setup Database

Pastikan project Supabase sudah dibuat. Jalankan migrasi di Supabase SQL Editor:
1. Buka folder `supabase/migrations/`
2. Jalankan script SQL secara berurutan.

### 4. Migrasi Data (Opsional)

Jika Anda punya data di Google Sheets dan ingin memigrasikannya ke MySQL:
```bash
# Migrasi langsung dari Google Sheets
pnpm run migrate:sheets

# Atau migrasi dari CSV
pnpm run migrate:csv
```

Lihat [database/MIGRATION_GUIDE.md](./database/MIGRATION_GUIDE.md) untuk detail lebih lanjut.

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

**Default Login:**
- Username: `admin`
- Password: `admin`

## Features

- ✅ Point of Sale (POS) dengan cart management
- ✅ Manajemen stock barang (MySQL)
- ✅ Manajemen data jasa, mekanik (MySQL)
- ✅ History transaksi dengan filter dan pencarian
- ✅ Print invoice/receipt
- ✅ Customer management dengan history
- ✅ Mechanic commission tracking
- ✅ Responsive design (mobile + desktop)

## Project Structure

```
nota-app/
├── app/                    # Next.js app router pages
│   ├── (dashboard)/        # Dashboard routes (protected)
│   │   ├── pos/           # Point of Sale
│   │   ├── history/       # Transaction history
│   │   ├── data-barang/   # Parts management
│   │   ├── data-jasa/     # Services management
│   │   └── data-mekanik/  # Mechanics management
│   └── login/             # Login page
├── components/             # React components
├── hooks/                  # Custom React hooks
├── services/               # Backend services
│   ├── data-barang/       # Parts service (MySQL)
│   ├── data-jasa/         # Services service (MySQL)
│   ├── data-mekanik/      # Mechanics service (MySQL)
│   └── data-transaksi/    # Transactions service (MySQL)
├── lib/                    # Utilities
│   └── db.ts              # MySQL connection
└── database/              # Database scripts
    ├── schema.sql         # Database schema
    └── migrate-*.ts       # Migration scripts
```

## Documentation

- [ENV_SETUP.md](./ENV_SETUP.md) - Panduan setup environment variables
- [database/README.md](./database/README.md) - Setup database MySQL
- [database/MIGRATION_GUIDE.md](./database/MIGRATION_GUIDE.md) - Panduan migrasi data

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

**Important:** Set all environment variables in Vercel dashboard before deploying.
