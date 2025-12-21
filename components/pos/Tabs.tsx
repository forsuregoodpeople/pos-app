"use client";

import React from "react";
import { Maximize2, Minimize2, History } from "lucide-react";

interface TabsProps {
    activeTab: "services" | "parts";
    servicesCount: number;
    partsCount: number;
    onTabChange: (tab: "services" | "parts") => void;
    onToggleFullscreen?: () => void;
    isFullscreen?: boolean;
    onEditTransaction?: () => void;
}

export function TabsComponent({ activeTab, servicesCount, partsCount, onTabChange, onToggleFullscreen, isFullscreen = false, onEditTransaction }: TabsProps) {
    return (
        <div className="bg-white border-b shrink-0">
            <div className="flex justify-center items-center">
                <button
                    onClick={() => onTabChange("services")}
                    className={`flex-1 py-3 px-4 font-semibold transition-colors text-sm sm:text-base ${
                        activeTab === "services"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                    Jasa ({servicesCount})
                </button>
                <button
                    onClick={() => onTabChange("parts")}
                    className={`flex-1 py-3 px-4 font-semibold transition-colors text-sm sm:text-base ${
                        activeTab === "parts"
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                    Barang ({partsCount})
                </button>
                {onEditTransaction && (
                    <button
                        onClick={onEditTransaction}
                        className="p-3 text-orange-600 hover:bg-orange-50 transition-colors"
                        title="Edit Transaksi"
                    >
                        <History className="w-5 h-5" />
                    </button>
                )}
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
