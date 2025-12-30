"use client";

import { FileText, Clock, Wrench, Package, Users, LogOut, Shield, Settings, UserCheck, Receipt, BookOpen, Building, ShoppingCart, CreditCard, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const RupiahIcon = ({ className }: { className?: string }) => (
    <div className={`flex items-center justify-center font-bold text-[9px] border-2 border-current rounded-[4px] ${className}`}>
        Rp
    </div>
);
import { useAuth } from "@/contexts/AuthContext";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
    {
        title: "POS",
        icon: FileText,
        href: "/",
        group: "transaksi",
    },
    {
        title: "History",
        icon: Clock,
        href: "/history",
        group: "transaksi",
    },
    {
        title: "Jasa",
        icon: Wrench,
        href: "/data-jasa",
        group: "master",
    },
    {
        title: "Barang",
        icon: Package,
        href: "/data-barang",
        group: "master",
    },
    {
        title: "Mekanik",
        icon: Users,
        href: "/data-mekanik",
        group: "master",
    },
    {
        title: "Setting Mekanik",
        icon: Settings,
        href: "/pengaturan-mekanik",
        group: "master",
    },
    {
        title: "Supplier",
        icon: Building,
        href: "/data-supplier",
        group: "master",
    },
    {
        title: "Tipe Pembayaran",
        icon: RupiahIcon,
        href: "/data-tipe-pembayaran",
        group: "master",
    },
    {
        title: "Pembelian",
        icon: ShoppingCart,
        href: "/pembelian",
        group: "pembelian",
    },
    {
        title: "Retur Pembelian",
        icon: Package,
        href: "/retur-pembelian",
        group: "pembelian",
    },
    {
        title: "Hutang",
        icon: Receipt,
        href: "/hutang-pembelian",
        group: "pembelian",
    },
    {
        title: "Laporan Stok",
        icon: Package,
        href: "/laporan-stok",
        group: "laporan",
    },
    {
        title: "Riwayat Pembelian",
        icon: FileText,
        href: "/laporan-pembelian",
        group: "laporan",
    },
    {
        title: "Keuangan",
        icon: BookOpen,
        href: "/laporan-keuangan",
        group: "laporan",
    },
    {
        title: "Performa Mekanik",
        icon: BarChart3,
        href: "/laporan-performa-mekanik",
        group: "laporan",
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const transaksiMenu = menuItems.filter(item => item.group === "transaksi");
    const masterMenu = menuItems.filter(item => item.group === "master");
    const pembelianMenu = menuItems.filter(item => item.group === "pembelian");
    const laporanMenu = menuItems.filter(item => item.group === "laporan");
    const rbacMenu = menuItems.filter(item => item.group === "rbac");

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="border-b border-sidebar-border p-4">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0">
                        SS
                    </div>
                    <div className="transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0">
                        <h2 className="text-sm font-semibold">Sunda Service</h2>
                        <p className="text-xs text-muted-foreground">Invoice System</p>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Transaksi</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {transaksiMenu.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                                        <Link href={item.href}>
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Data Master</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {masterMenu.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                                        <Link href={item.href}>
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Pembelian</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {pembelianMenu.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                                        <Link href={item.href}>
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Laporan</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {laporanMenu.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                                        <Link href={item.href}>
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border p-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="w-full justify-start"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}
