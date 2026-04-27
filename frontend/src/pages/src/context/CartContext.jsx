import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // { itemId: qty }
    const [cartItems, setCartItems] = useState({});
    const [isCartOpen, setIsCartOpen] = useState(false);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    const addToCart = (id) => {
        setCartItems(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
        // Auto open for feedback
        setIsCartOpen(true);
    };

    const removeFromCart = (id) => {
        setCartItems(prev => {
            const newQty = (prev[id] || 0) - 1;
            if (newQty <= 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [id]: newQty };
        });
    };

    const updateQuantity = (id, qty) => {
        if (qty <= 0) {
            setCartItems(prev => {
                const { [id]: _, ...rest } = prev;
                return rest;
            });
        } else {
            setCartItems(prev => ({ ...prev, [id]: qty }));
        }
    };

    const clearCart = () => setCartItems({});

    const cartCount = Object.values(cartItems).reduce((a, b) => a + b, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            isCartOpen,
            openCart,
            closeCart,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
