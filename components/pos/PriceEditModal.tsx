"use client";
import React, { useState, useEffect } from "react";
import { Save, Calculator } from "lucide-react";
import { CartItem } from "@/hooks/useCart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PriceEditModalProps {
  isOpen: boolean;
  item: CartItem | null;
  onClose: () => void;
  onSave: (itemId: string, newPrice: number, newDiscount: number) => void;
}

export function PriceEditModal({ isOpen, item, onClose, onSave }: PriceEditModalProps) {
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (item) {
      setPrice(item.price);
      setDiscount(item.discount);
    }
  }, [item]);

  const handleSave = () => {
    if (!item) return;
    onSave(item.id, price, discount);
    onClose();
  };

  const finalPrice = Math.max(0, price - discount);

  const fCur = (v: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(v);

  const fNum = (v: number) => v.toLocaleString("id-ID");

  const qDisc = [0, 5000, 10000, 15000, 20000];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Calculator className="w-4 h-4" />
            Edit Harga
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Info */}
          <div className="border rounded-md p-3 bg-muted/30">
            <div className="font-medium text-sm">{item?.name}</div>
            <div className="text-xs text-muted-foreground">
              {item?.type === "service" ? "Jasa" : "Barang"} • Qty: {item?.qty}
            </div>
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label htmlFor="price">Harga Satuan</Label>
            <div className="relative">
              <Input
                id="price"
                type="text"
                value={fNum(price)}
                onChange={(e) => setPrice(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
                className="text-right pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
            </div>
          </div>

          {/* Discount */}
          <div className="space-y-1.5">
            <Label htmlFor="discount">Diskon</Label>
            <div className="relative">
              <Input
                id="discount"
                type="text"
                value={fNum(discount)}
                onChange={(e) => setDiscount(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
                className="text-right pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
            </div>

            {/* Quick Discount */}
            <div className="grid grid-cols-5 gap-1">
              {qDisc.map((amount) => (
                <Button
                  key={amount}
                  variant={discount === amount ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDiscount(amount)}
                  className="h-7 text-xs"
                >
                  {amount === 0 ? "0" : `${amount / 1000}K`}
                </Button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border rounded-md p-3 bg-muted/20 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{fCur(price)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diskon</span>
                <span className="text-destructive">-{fCur(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{fCur(finalPrice)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-3 h-3 mr-1" /> Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
