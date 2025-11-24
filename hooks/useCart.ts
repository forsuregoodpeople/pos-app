import { useState } from 'react';

export interface CartItem {
    id: string;
    type: "service" | "part";
    name: string;
    price: number;
    qty: number;
}

export function useCart() {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (item: { id: string; name: string; price: number }, type: "service" | "part") => {
        const existingItem = cart.find(c => c.id === item.id);
        if (existingItem) {
            setCart(cart.map(c =>
                c.id === item.id ? { ...c, qty: c.qty + 1 } : c
            ));
        } else {
            setCart([...cart, { ...item, type, qty: 1 }]);
        }
        return item.name;
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(c => c.id !== id));
    };

    const updateQty = (id: string, qty: number) => {
        if (qty < 1) {
            removeFromCart(id);
            return;
        }
        setCart(cart.map(c => c.id === id ? { ...c, qty } : c));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    };

    const clearCart = () => {
        setCart([]);
    };

    return {
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        calculateTotal,
        clearCart,
    };
}
