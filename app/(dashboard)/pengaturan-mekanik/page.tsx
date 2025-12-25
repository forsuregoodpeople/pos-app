"use client";

import React, { useState, useEffect } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Settings, Users, Building, Percent, Save, Edit2, Trash2, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useMechanicSettings } from "@/hooks/useMechanicSettings";
import { useDataMekanik } from "@/hooks/useDataMekanik";
import { toast } from "sonner";

export default function PengaturanMekanikPage() {
    const { 
        mechanicSettings, 
        globalSettings, 
        loading, 
        saveMechanicSetting, 
        updateMechanicSetting, 
        deleteMechanicSetting, 
        updateGlobalSetting,
        getGlobalSetting 
    } = useMechanicSettings();
    
    const { items: mechanics } = useDataMekanik();
    
    const [isClient, setIsClient] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSetting, setEditingSetting] = useState<any>(null);
    const [selectedMechanic, setSelectedMechanic] = useState<number | null>(null);
    const [shopCutPercentage, setShopCutPercentage] = useState("50");
    const [defaultShopCut, setDefaultShopCut] = useState("50");
    const [enableCustomSettings, setEnableCustomSettings] = useState(true);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const loadSettings = async () => {
            const defaultCut = await getGlobalSetting('default_shop_cut_percentage');
            const customEnabled = await getGlobalSetting('enable_custom_mechanic_settings');
            
            if (defaultCut) setDefaultShopCut(defaultCut);
            if (customEnabled) setEnableCustomSettings(customEnabled === 'true');
        };
        
        loadSettings();
    }, [getGlobalSetting]);

    const handleAddSetting = async () => {
        if (!selectedMechanic) {
            toast.error("Pilih mekanik terlebih dahulu");
            return;
        }

        try {
            const mechanicName = mechanics?.find(m => m.id === selectedMechanic.toString())?.name;
            await saveMechanicSetting({
                mechanic_id: selectedMechanic,
                shop_cut_percentage: parseFloat(shopCutPercentage),
                is_active: true
            }, mechanicName);
            
            toast.success("Pengaturan mekanik berhasil ditambahkan");
            setShowAddModal(false);
            setSelectedMechanic(null);
            setShopCutPercentage("50");
        } catch (error) {
            toast.error("Gagal menambah pengaturan mekanik");
        }
    };

    const handleEditSetting = async () => {
        if (!editingSetting) return;

        try {
            await updateMechanicSetting(editingSetting.id, {
                shop_cut_percentage: parseFloat(editingSetting.shop_cut_percentage)
            });
            
            toast.success("Pengaturan mekanik berhasil diupdate");
            setEditingSetting(null);
        } catch (error) {
            toast.error("Gagal mengupdate pengaturan mekanik");
        }
    };

    const handleDeleteSetting = async (id: number) => {
        try {
            await deleteMechanicSetting(id);
            toast.success("Pengaturan mekanik berhasil dihapus");
        } catch (error) {
            toast.error("Gagal menghapus pengaturan mekanik");
        }
    };

    const handleUpdateGlobalSetting = async (key: string, value: string) => {
        try {
            await updateGlobalSetting(key, value);
            
            if (key === 'default_shop_cut_percentage') {
                setDefaultShopCut(value);
            } else if (key === 'enable_custom_mechanic_settings') {
                setEnableCustomSettings(value === 'true');
            }
            
            toast.success("Pengaturan global berhasil diupdate");
        } catch (error) {
            toast.error("Gagal mengupdate pengaturan global");
        }
    };

    const getAvailableMechanics = () => {
        const configuredMechanicIds = mechanicSettings.map(s => s.mechanic_id.toString());
        return mechanics?.filter(m => !configuredMechanicIds.includes(m.id.toString())) || [];
    };

    if (!isClient) {
        return (
            <SidebarInset className="font-sans">
                <div className="flex items-center justify-center h-screen">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </SidebarInset>
        );
    }

    return (
        <SidebarInset className="font-sans">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold">Pengaturan Mekanik</h1>
            </header>

            <div className="p-4 md:p-6 space-y-6">
                {/* Global Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="w-5 h-5" />
                            Pengaturan Global
                        </CardTitle>
                        <CardDescription>
                            Pengaturan yang berlaku untuk semua mekanik
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="default-shop-cut">Default Potongan Toko (%)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="default-shop-cut"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={defaultShopCut}
                                        onChange={(e) => setDefaultShopCut(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={() => handleUpdateGlobalSetting('default_shop_cut_percentage', defaultShopCut)}
                                        size="sm"
                                        disabled={loading}
                                    >
                                        <Save className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="enable-custom">Aktifkan Pengaturan Per Mekanik</Label>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="enable-custom"
                                        checked={enableCustomSettings}
                                        onCheckedChange={(checked) => 
                                            handleUpdateGlobalSetting('enable_custom_mechanic_settings', checked.toString())
                                        }
                                        disabled={loading}
                                    />
                                    <span className="text-sm text-gray-600">
                                        {enableCustomSettings ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Individual Mechanic Settings */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Pengaturan Per Mekanik
                            </CardTitle>
                            <CardDescription>
                                Potongan toko khusus untuk setiap mekanik
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => setShowAddModal(true)}
                            disabled={!enableCustomSettings || loading}
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {!enableCustomSettings ? (
                            <div className="text-center py-8 text-gray-500">
                                <Settings className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">Pengaturan per mekanik dinonaktifkan</p>
                                <p className="text-xs mt-1">Aktifkan di pengaturan global untuk menggunakan fitur ini</p>
                            </div>
                        ) : mechanicSettings.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">Belum ada pengaturan mekanik</p>
                                <p className="text-xs mt-1">Tambah pengaturan untuk mekanik tertentu</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {mechanicSettings.map((setting) => (
                                    <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium">{setting.mechanic_name}</div>
                                            <div className="text-sm text-gray-600">
                                                Potongan Toko: {setting.shop_cut_percentage}%
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={setting.is_active ? "default" : "secondary"}>
                                                {setting.is_active ? "Aktif" : "Nonaktif"}
                                            </Badge>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setEditingSetting(setting)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteSetting(setting.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add Setting Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Pengaturan Mekanik</DialogTitle>
                        <DialogDescription>
                            Tambahkan potongan toko khusus untuk mekanik
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="mechanic">Mekanik</Label>
                            <select
                                id="mechanic"
                                value={selectedMechanic || ""}
                                onChange={(e) => setSelectedMechanic(e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="">Pilih Mekanik</option>
                                {getAvailableMechanics().map((mechanic) => (
                                    <option key={mechanic.id} value={mechanic.id}>
                                        {mechanic.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shop-cut">Potongan Toko (%)</Label>
                            <Input
                                id="shop-cut"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={shopCutPercentage}
                                onChange={(e) => setShopCutPercentage(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleAddSetting} disabled={loading}>
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Setting Modal */}
            <Dialog open={!!editingSetting} onOpenChange={() => setEditingSetting(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Pengaturan Mekanik</DialogTitle>
                        <DialogDescription>
                            Ubah potongan toko untuk mekanik
                        </DialogDescription>
                    </DialogHeader>
                    {editingSetting && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Mekanik</Label>
                                <Input value={editingSetting.mechanic_name} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-shop-cut">Potongan Toko (%)</Label>
                                <Input
                                    id="edit-shop-cut"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={editingSetting.shop_cut_percentage}
                                    onChange={(e) => setEditingSetting({
                                        ...editingSetting,
                                        shop_cut_percentage: e.target.value
                                    })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingSetting(null)}>
                            Batal
                        </Button>
                        <Button onClick={handleEditSetting} disabled={loading}>
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarInset>
    );
}