"use client";

import React, { useState, useEffect } from "react";
import { User, Percent, Trash2, Search, Building, Info } from "lucide-react";
import { useDataMekanik } from "@/hooks/useDataMekanik";
import { useMechanicSettings } from "@/hooks/useMechanicSettings";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export interface Mechanic {
    id: string;
    name: string;
    percentage: number;
}

interface MechanicModalProps {
    isOpen: boolean;
    mechanics: Mechanic[];
    onClose: () => void;
    onSave: (mechanics: Mechanic[]) => void;
}

export function MechanicModal({
    isOpen,
    mechanics,
    onClose,
    onSave,
}: MechanicModalProps) {
    const [localMechanics, setLocalMechanics] = useState<Mechanic[]>(mechanics);
    const [searchQuery, setSearchQuery] = useState("");
    const [defaultShopCut, setDefaultShopCut] = useState("50");
    const [mechanicShopCuts, setMechanicShopCuts] = useState<Record<string, number>>({});

    const { items: availableMechanics } = useDataMekanik();
    const { getGlobalSetting, getMechanicSetting } = useMechanicSettings();

    useEffect(() => {
        const loadSettings = async () => {
            const defaultCut = await getGlobalSetting('default_shop_cut_percentage');
            if (defaultCut) setDefaultShopCut(defaultCut);
        };
        loadSettings();
    }, [getGlobalSetting]);

    useEffect(() => {
        const loadMechanicSettings = async () => {
            const settings: Record<string, number> = {};
            for (const mechanic of localMechanics) {
                const setting = await getMechanicSetting(parseInt(mechanic.id));
                if (setting) {
                    settings[mechanic.id] = setting.shop_cut_percentage;
                }
            }
            setMechanicShopCuts(settings);
        };
        loadMechanicSettings();
    }, [localMechanics, getMechanicSetting]);

    const getDefaultPercentages = (count: number): number[] => {
        if (count === 1) return [100];
        if (count === 2) return [70, 30];
        if (count === 3) return [60, 20, 20];
        if (count === 4) return [55, 15, 15, 15];
        if (count === 5) return [52, 12, 12, 12, 12];
        const remaining = 100 - 51;
        const splitPercentage = Math.floor(remaining / (count - 1));
        return [51, ...Array(count - 1).fill(splitPercentage)];
    };

    const selectMechanic = async (mechanic: { id: string; name: string }) => {
        const newCount = localMechanics.length + 1;
        const percentages = getDefaultPercentages(newCount);
        const updatedMechanics = localMechanics.map((existingMechanic, index) => ({
            ...existingMechanic,
            percentage: percentages[index],
        }));
        const newMechanic: Mechanic = {
            id: mechanic.id,
            name: mechanic.name,
            percentage: percentages[newCount - 1],
        };
        setLocalMechanics([...updatedMechanics, newMechanic]);
        setSearchQuery("");

        // Load mechanic setting for new mechanic
        const setting = await getMechanicSetting(parseInt(mechanic.id));
        if (setting) {
            setMechanicShopCuts(prev => ({
                ...prev,
                [mechanic.id]: setting.shop_cut_percentage
            }));
        }
    };

    const updateMechanic = (id: string, field: keyof Mechanic, value: string | number) => {
        setLocalMechanics(localMechanics.map(mechanic =>
            mechanic.id === id ? { ...mechanic, [field]: value } : mechanic
        ));
    };

    const removeMechanic = (id: string) => {
        const newCount = localMechanics.length - 1;
        if (newCount === 0) {
            setLocalMechanics([]);
            return;
        }

        const percentages = getDefaultPercentages(newCount);
        const updatedMechanics = localMechanics
            .filter(mechanic => mechanic.id !== id)
            .map((mechanic, index) => ({
                ...mechanic,
                percentage: percentages[index],
            }));
        setLocalMechanics(updatedMechanics);
    };

    const getTotalPercentage = () => {
        return localMechanics.reduce((total, mechanic) => total + mechanic.percentage, 0);
    };

    const handleSave = () => {
        onSave(localMechanics);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto no-print">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Data Mekanik
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="search-mechanic">Cari dan Pilih Mekanik</Label>
                        <div className="relative mt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="search-mechanic"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ketik nama mekanik..."
                                className="pl-10"
                            />
                        </div>
                        <div className="mt-2 border rounded-lg">
                            <ScrollArea className="h-64">
                                {availableMechanics.length === 0 ? (
                                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                                        Belum ada data mekanik. Tambahkan di menu Data Mekanik terlebih dahulu.
                                    </div>
                                ) : (
                                    availableMechanics
                                        .filter(m =>
                                            m.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                                            !localMechanics.some(lm => lm.name === m.name)
                                        )
                                        .map(mechanic => (
                                            <button
                                                key={mechanic.id}
                                                onClick={() => selectMechanic(mechanic)}
                                                className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                            >
                                                <div className="font-medium text-gray-800">{mechanic.name}</div>
                                            </button>
                                        ))
                                )}
                                {availableMechanics.length > 0 &&
                                    availableMechanics.filter(m =>
                                        m.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                                        !localMechanics.some(lm => lm.name === m.name)
                                    ).length === 0 && (
                                        <div className="px-3 py-4 text-center text-sm text-gray-500">
                                            {searchQuery.trim()
                                                ? "Mekanik tidak ditemukan atau sudah ditambahkan"
                                                : "Semua mekanik sudah ditambahkan"
                                            }
                                        </div>
                                    )}
                            </ScrollArea>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {localMechanics.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 border rounded-lg">
                                <User className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Belum ada mekanik dipilih</p>
                                <p className="text-xs mt-1">Cari dan pilih mekanik dari daftar di atas</p>
                            </div>
                        ) : (
                            localMechanics.map((mechanic, index) => {
                                const shopCutPercentage = mechanicShopCuts[mechanic.id] || parseFloat(defaultShopCut);
                                return (
                                    <div key={mechanic.id} className="border rounded-lg p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {mechanic.name}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => removeMechanic(mechanic.id)}
                                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div>
                                            <Label htmlFor={`mechanic-percentage-${mechanic.id}`}>Persentase Pengerjaan (%)</Label>
                                            <div className="relative mt-2">
                                                <Input
                                                    id={`mechanic-percentage-${mechanic.id}`}
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={mechanic.percentage}
                                                    onChange={(e) => updateMechanic(mechanic.id, "percentage", parseInt(e.target.value) || 0)}
                                                    placeholder="0"
                                                    className="pr-8"
                                                />
                                                <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>

                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {localMechanics.length > 0 && (
                        <div className={`rounded-lg p-3 text-sm ${getTotalPercentage() === 100
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : getTotalPercentage() > 100
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            }`}>
                            <div className="flex items-center justify-between">
                                <span>Total Persentase:</span>
                                <span className="font-bold">{getTotalPercentage()}%</span>
                            </div>
                            {getTotalPercentage() !== 100 && (
                                <p className="text-xs mt-1">
                                    {getTotalPercentage() > 100
                                        ? "Persentase melebihi 100%"
                                        : "Sebaiknya total persentase 100%"}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            className="flex-1"
                        >
                            Simpan
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}