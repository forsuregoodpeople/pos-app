import { useState } from "react";

export interface PurchaseCartItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    discount: number;
    subtotal: number;
}

export function usePurchaseCart() {
    const [cart, setCart] = useState<PurchaseCartItem[]>([]);

    const addToCart = (item: { id: string; name: string; price: number }) => {
        setCart(prevCart => {
            const existing = prevCart.find(c => c.id === item.id);
            if (existing) {
                return prevCart.map(c =>
                    c.id === item.id
                        ? { ...c, qty: c.qty + 1, subtotal: (c.qty + 1) * c.price * (1 - c.discount / 100) }
                        : c
                );
            }
            return [...prevCart, {
                id: item.id,
                name: item.name,
                price: item.price,
                qty: 1,
                discount: 0,
                subtotal: item.price
            }];
        });
        return item.name;
    };

    const removeFromCart = (id: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== id));
    };

    const updateQty = (id: string, qty: number) => {
        if (qty <= 0) {
            removeFromCart(id);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === id
                    ? { ...item, qty, subtotal: qty * item.price * (1 - item.discount / 100) }
                    : item
            )
        );
    };

    const updatePrice = (id: string, price: number) => {
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === id
                    ? { ...item, price, subtotal: item.qty * price * (1 - item.discount / 100) }
                    : item
            )
        );
    };

    const updateDiscount = (id: string, discount: number) => {
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === id
                    ? { ...item, discount, subtotal: item.qty * item.price * (1 - discount / 100) }
                    : item
            )
        );
    };

    const calculateSubtotal = () => {
        return cart.reduce((total, item) => total + item.subtotal, 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal();
    };

    const clearCart = () => {
        setCart([]);
    };

    return {
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        updatePrice,
        updateDiscount,
        calculateSubtotal,
        calculateTotal,
        clearCart
    };
}