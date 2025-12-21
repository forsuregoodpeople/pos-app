import { useState } from 'react';

export interface CartItem {
    id: string;
    type: "service" | "part";
    name: string;
    price: number;
    qty: number;
    discount: number;
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
            setCart([...cart, { ...item, type, qty: 1, discount: 0 }]);
        }
        return item.name;
    };

    const addToCartWithQty = (item: { id: string; name: string; price: number; qty?: number; discount?: number }, type: "service" | "part") => {
        const existingItem = cart.find(c => c.id === item.id);
        if (existingItem) {
            setCart(cart.map(c =>
                c.id === item.id ? { ...c, qty: item.qty || 1, discount: item.discount || 0 } : c
            ));
        } else {
            setCart([...cart, { ...item, type, qty: item.qty || 1, discount: item.discount || 0 }]);
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

    const updatePrice = (id: string, newPrice: number) => {
        console.log('updatePrice called:', { id, newPrice, currentCart: cart });
        setCart(prevCart => {
            const newCart = prevCart.map(c => c.id === id ? { ...c, price: newPrice } : c);
            console.log('new cart after price update:', newCart);
            return newCart;
        });
    };

    const updateDiscount = (id: string, discount: number) => {
        console.log('updateDiscount called:', { id, discount, currentCart: cart });
        setCart(prevCart => {
            const newCart = prevCart.map(c => c.id === id ? { ...c, discount } : c);
            console.log('new cart after discount update:', newCart);
            return newCart;
        });
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => {
            const itemTotal = item.price * item.qty;
            return sum + (itemTotal - item.discount);
        }, 0);
    };

    const clearCart = () => {
        setCart([]);
    };

    return {
        cart,
        addToCart,
        addToCartWithQty,
        removeFromCart,
        updateQty,
        updatePrice,
        updateDiscount,
        calculateSubtotal,
        calculateTotal,
        clearCart,
    };
}
