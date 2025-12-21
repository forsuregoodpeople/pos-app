import React from "react";
import { Package, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PurchaseTabsProps {
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    partsCount: number;
}

export function PurchaseTabs({
    isFullscreen,
    onToggleFullscreen,
    partsCount
}: PurchaseTabsProps) {
    return (
        <div className="bg-white border-b">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <h1 className="text-xl font-semibold">Pembelian Barang</h1>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <span>Data Barang:</span>
                        <span className="font-medium text-blue-600">{partsCount}</span>
                        <span>item</span>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onToggleFullscreen}
                        className="hidden md:flex"
                    >
                        {isFullscreen ? (
                            <>
                                <Minimize2 className="w-4 h-4 mr-2" />
                                Keluar Fullscreen
                            </>
                        ) : (
                            <>
                                <Maximize2 className="w-4 h-4 mr-2" />
                                Fullscreen
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}