import { useState, useEffect } from 'react';

export interface Service {
    id: string;
    name: string;
    price: number;
}

export interface Part {
    id: string;
    name: string;
    price: number;
}

export function useProducts() {
    const [services, setServices] = useState<Service[]>([]);
    const [parts, setParts] = useState<Part[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        // Load services
        const savedServices = localStorage.getItem("services");
        if (savedServices) {
            setServices(JSON.parse(savedServices));
        } else {
            const defaultServices = [
                { id: "s1", name: "Ganti Oli Mesin", price: 150000 },
                { id: "s2", name: "Tune Up", price: 300000 },
                { id: "s3", name: "Cuci Mobil", price: 50000 },
                { id: "s4", name: "Ganti Kampas Rem", price: 200000 },
                { id: "s5", name: "Balancing", price: 80000 },
                { id: "s6", name: "Spooring", price: 100000 },
                { id: "s7", name: "Servis AC", price: 250000 },
                { id: "s8", name: "Ganti Aki", price: 400000 },
            ];
            setServices(defaultServices);
            localStorage.setItem("services", JSON.stringify(defaultServices));
        }

        // Load parts from barang localStorage
        const savedBarang = localStorage.getItem("barang");
        if (savedBarang) {
            const barangData = JSON.parse(savedBarang);
            setParts(barangData);
        } else {
            const defaultParts = [
                { id: "p1", name: "Oli Mesin 1L", price: 75000 },
                { id: "p2", name: "Filter Oli", price: 35000 },
                { id: "p3", name: "Kampas Rem Depan", price: 180000 },
                { id: "p4", name: "Aki 45Ah", price: 650000 },
                { id: "p5", name: "Busi", price: 45000 },
                { id: "p6", name: "Air Filter", price: 55000 },
                { id: "p7", name: "Ban 185/70R14", price: 550000 },
                { id: "p8", name: "Wiper Blade", price: 85000 },
            ];
            setParts(defaultParts);
            localStorage.setItem("barang", JSON.stringify(defaultParts));
        }
    };

    // Refresh data when window gains focus
    useEffect(() => {
        const handleFocus = () => {
            loadData();
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    // Sync parts with barang data
    const syncPartsFromBarang = () => {
        const savedBarang = localStorage.getItem("barang");
        if (savedBarang) {
            setParts(JSON.parse(savedBarang));
        }
    };

    // Listen for storage changes
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "barang") {
                syncPartsFromBarang();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return {
        services,
        parts,
        loadData,
        syncPartsFromBarang,
    };
}
