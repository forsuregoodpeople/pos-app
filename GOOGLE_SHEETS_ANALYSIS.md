# Google Sheets Integration Analysis

## 📍 Lokasi Saving Data Saat Ini

### 1. Transaksi Penjualan
**File:** `hooks/useTransaction.ts`
**Fungsi:** `saveInvoice()` (line 36-42)
```typescript
const saveInvoice = (invoice: Transaction) => {
    const existing = JSON.parse(localStorage.getItem("invoices") || "[]");
    existing.push(invoice);
    localStorage.setItem("invoices", JSON.stringify(existing));
};
```
**Target Sheet:** `Transactions`

### 2. Data Barang (Sparepart)
**File:** `hooks/useDataBarang.ts`
**Fungsi:** 
- `addItem()` (line 18-24)
- `updateItem()` (line 26-32) 
- `deleteItem()` (line 34-40)
```typescript
const addItem = (item: Omit<DataBarang, "id">) => {
    const newData = [...data, { ...item, id: Date.now().toString() }];
    localStorage.setItem("barang", JSON.stringify(newData));
    setData(newData);
};
```
**Target Sheet:** `Barang`

### 3. Data Jasa (Services)
**File:** `hooks/useDataJasa.ts`
**Fungsi:**
- `addItem()` (line 18-24)
- `updateItem()` (line 26-32)
- `deleteItem()` (line 34-40)
```typescript
const addItem = (item: Omit<Service, "id">) => {
    const newData = [...data, { ...item, id: Date.now().toString() }];
    localStorage.setItem("services", JSON.stringify(newData));
    setData(newData);
};
```
**Target Sheet:** `Services`

### 4. Data Mekanik
**File:** `hooks/useDataMekanik.ts`
**Fungsi:**
- `addItem()` (line 18-25)
- `updateItem()` (line 27-34)
- `deleteItem()` (line 36-43)
```typescript
const addItem = (item: Omit<DataMekanik, "id">) => {
    const newData = [...data, { ...item, id: Date.now().toString() }];
    localStorage.setItem("mekanik", JSON.stringify(newData));
    setData(newData);
};
```
**Target Sheet:** `Mekanik`

## 🗂️ Struktur Google Sheets yang Diperlukan

### Sheet 1: Transactions
| Kolom | Tipe Data | Contoh |
|-------|-----------|--------|
| invoiceNumber | String | "INV/2024/11/001" |
| date | String | "27/11/2025" |
| customerName | String | "Budi Santoso" |
| customerPhone | String | "08123456789" |
| kmMasuk | String | "50000" |
| mobil | String | "Toyota Avanza" |
| platNomor | String | "B 1234 ABC" |
| tipe | String | "umum" |
| items | JSON | `[{"id":"1","type":"service",...}]` |
| total | Number | 1500000 |
| savedAt | String | "2025-11-27T10:30:00.000Z" |
| mekaniks | JSON | `[{"name":"John","percentage":50}]` |

### Sheet 2: Barang
| Kolom | Tipe Data | Contoh |
|-------|-----------|--------|
| id | String | "1732694400000" |
| name | String | "Oli Mesin Castrol" |
| price | Number | 150000 |

### Sheet 3: Services
| Kolom | Tipe Data | Contoh |
|-------|-----------|--------|
| id | String | "1732694400001" |
| name | String | "Ganti Oli" |
| price | Number | 50000 |

### Sheet 4: Mekanik
| Kolom | Tipe Data | Contoh |
|-------|-----------|--------|
| id | String | "1732694400002" |
| name | String | "John Doe" |
| phone | String | "08123456789" |
| email | String | "john@example.com" |

## 🔄 Mapping Fungsi Save ke Google Sheets

### 1. Transaksi → Sheet "Transactions"
```typescript
// Dari: localStorage.setItem("invoices", JSON.stringify(existing));
// Ke: sheetsAPI.appendRow('Transactions', [invoiceData]);
```

### 2. Barang → Sheet "Barang"
```typescript
// Dari: localStorage.setItem("barang", JSON.stringify(newData));
// Ke: sheetsAPI.updateRow('Barang', rowData, rowIndex);
```

### 3. Jasa → Sheet "Services"
```typescript
// Dari: localStorage.setItem("services", JSON.stringify(newData));
// Ke: sheetsAPI.updateRow('Services', rowData, rowIndex);
```

### 4. Mekanik → Sheet "Mekanik"
```typescript
// Dari: localStorage.setItem("mekanik", JSON.stringify(newData));
// Ke: sheetsAPI.updateRow('Mekanik', rowData, rowIndex);
```

## 📝 Lokasi Loading Data

### 1. Load Transaksi
**File:** `app/history/page.tsx` (line 31-38)
```typescript
const loadTransactions = () => {
    const saved = localStorage.getItem("invoices");
    if (saved) {
        const data = JSON.parse(saved);
        setTransactions(data.sort(...));
    }
};
```

### 2. Load Barang
**File:** `hooks/useDataBarang.ts` (line 13-16)
```typescript
useEffect(() => {
    const saved = localStorage.getItem("barang");
    if (saved) setData(JSON.parse(saved));
}, []);
```

### 3. Load Jasa
**File:** `hooks/useDataJasa.ts` (line 13-16)
```typescript
useEffect(() => {
    const saved = localStorage.getItem("services");
    if (saved) setData(JSON.parse(saved));
}, []);
```

### 4. Load Mekanik
**File:** `hooks/useDataMekanik.ts` (line 13-16)
```typescript
useEffect(() => {
    const saved = localStorage.getItem("mekanik");
    if (saved) setData(JSON.parse(saved));
}, []);
```

## 🎯 Prioritas Implementasi

### Phase 1: Service Layer
1. Buat `lib/google-sheets.ts` - API wrapper
2. Setup OAuth 2.0 authentication
3. Define sheet structures

### Phase 2: Data Hooks Migration
1. `hooks/useTransaction.ts` - Transaksi (paling penting)
2. `hooks/useDataBarang.ts` - Inventory
3. `hooks/useDataJasa.ts` - Services  
4. `hooks/useDataMekanik.ts` - Mechanics

### Phase 3: UI Updates
1. Update loading states
2. Add error handling
3. Add sync indicators

## 📊 Flow Data Baru

**Flow Saat Ini:** UI → Hook → localStorage → Hook → UI
**Flow Baru:** UI → Hook → Google Sheets API → Hook → UI

## ⚠️ Pertimbangan Penting

1. **Performance:** API calls lebih lambat dari localStorage
2. **Real-time:** Perlu polling atau WebSocket untuk multi-user
3. **Error Handling:** Network failures, quota limits
4. **Offline Mode:** Cache data untuk offline access
5. **Data Migration:** Export existing localStorage ke Sheets