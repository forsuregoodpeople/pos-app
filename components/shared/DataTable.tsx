"use client";

import React, { useState } from "react";
import { Trash2, Plus, Edit2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DataTableProps<T> {
    items: T[];
    loading: boolean;
    onAdd: (item: Omit<T, 'id'>) => void;
    onEdit: (id: string, item: Omit<T, 'id'>) => void;
    onDelete: (id: string) => void;
    columns: Array<{
        key: keyof T;
        label: string;
        type?: 'text' | 'number';
    }>;
    title: string;
}

export function DataTable<T extends { id: string }>({
    items,
    loading,
    onAdd,
    onEdit,
    onDelete,
    columns,
    title,
}: DataTableProps<T>) {
    const [form, setForm] = useState<{ open: boolean; edit?: T }>({ open: false });
    const [formData, setFormData] = useState<Record<string, any>>({});

    const openForm = (item?: T) => {
        setForm({ open: true, edit: item });
        setFormData(item ? columns.reduce((acc, col) => ({ ...acc, [col.key as string]: item[col.key] }), {}) : {});
    };

    const closeForm = () => {
        setForm({ open: false });
        setFormData({});
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = columns.reduce((acc, col) => ({ ...acc, [col.key as string]: formData[col.key as string] }), {});
        
        if (form.edit) {
            onEdit(form.edit.id, data as Omit<T, 'id'>);
        } else {
            onAdd(data as Omit<T, 'id'>);
        }
        closeForm();
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{title}</h1>
                <Button onClick={() => openForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah
                </Button>
            </div>

            {/* Form Modal */}
            <Dialog open={form.open} onOpenChange={closeForm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {form.edit ? 'Edit' : 'Tambah'} {title}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submit} className="space-y-4">
                        {columns.map((col) => (
                            <div key={String(col.key)}>
                                <Label htmlFor={`field-${String(col.key)}`}>{col.label}</Label>
                                <Input
                                    id={`field-${String(col.key)}`}
                                    type={col.type || 'text'}
                                    value={formData[col.key as string] || ''}
                                    onChange={(e) => setFormData({ ...formData, [col.key as string]: e.target.value })}
                                    className="mt-2"
                                    required
                                />
                            </div>
                        ))}

                        <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">
                                Simpan
                            </Button>
                            <Button type="button" onClick={closeForm} variant="outline" className="flex-1">
                                Batal
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Table */}
            {loading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">No.</TableHead>
                                {columns.map((col) => (
                                    <TableHead key={col.key as string}>
                                        {col.label}
                                    </TableHead>
                                ))}
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 2} className="text-center py-8 text-gray-500">
                                        Belum ada data
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        {columns.map((col) => (
                                            <TableCell key={col.key as string}>
                                                {col.type === 'number'
                                                    ? `Rp ${(item[col.key] as number).toLocaleString('id-ID')}`
                                                    : String(item[col.key] || '-')}
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openForm(item)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (confirm('Hapus data ini?')) onDelete(item.id);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
