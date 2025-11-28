"use client";

import { FileText, Clock, Wrench, Package, Users, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
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
        title: "Data Jasa",
        icon: Wrench,
        href: "/data-jasa",
        group: "master",
    },
    {
        title: "Data Barang",
        icon: Package,
        href: "/data-barang",
        group: "master",
    },
    {
        title: "Data Mekanik",
        icon: Users,
        href: "/data-mekanik",
        group: "master",
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const transaksiMenu = menuItems.filter(item => item.group === "transaksi");
    const masterMenu = menuItems.filter(item => item.group === "master");

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border p-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                        SS
                    </div>
                    <div>
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