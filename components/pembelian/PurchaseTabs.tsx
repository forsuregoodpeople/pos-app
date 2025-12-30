"use client";

import React from "react";
import { Maximize2, Minimize2 } from "lucide-react";

interface PurchaseTabsProps {
    partsCount: number;
    onToggleFullscreen?: () => void;
    isFullscreen?: boolean;
}

export function PurchaseTabs({ partsCount, onToggleFullscreen, isFullscreen = false }: PurchaseTabsProps) {
    return (
        <div className="bg-white border-b shrink-0">
            <div className="flex justify-center items-center">
                <button
                    className="flex-1 py-3 px-4 font-semibold transition-colors text-sm sm:text-base bg-green-600 text-white"
                >
                    Barang ({partsCount})
                </button>
                {onToggleFullscreen && (
                    <button
                        onClick={onToggleFullscreen}
                        className="p-3 text-gray-600 hover:bg-gray-100 transition-colors"
                        title={isFullscreen ? "Keluar Full Screen" : "Full Screen"}
                    >
                        {isFullscreen ? (
                            <Minimize2 className="w-5 h-5" />
                        ) : (
                            <Maximize2 className="w-5 h-5" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}