"use client";
/**
 * Contexto Global del Carrito de Compras (N2 — migración Cart local → server).
 *
 * API pública PRESERVADA: `cart`, `totalItems`, `totalPrice`, `addToCart`,
 * `removeFromCart`, `updateQuantity`, `clearCart` y el tipo `CartItem`.
 *
 * Comportamiento N2:
 *  - Anónimo: igual que antes (localStorage['carrito'] + cálculos locales).
 *  - Autenticado: el servidor (`/api/cart`) es la fuente de verdad de
 *    cantidades, precios, ofertas y snapshot. El cliente solo transforma el
 *    `CartResponse` (cart-mapper) al modelo visual; jamás recalcula el precio.
 *  - Login/Register → merge automático guest→server vía UNA llamada a
 *    `POST /api/cart/merge` (mergeLocal). Server-wins.
 *  - `pendingMerge`: si el merge falla (backend caído/offline) se conserva el
 *    carrito local y se reintenta al recuperar la conexión.
 *  - Mutaciones de cantidades serializadas por item (cola A→B→C), con update
 *    optimista y rollback al último CartResponse confirmado.
 *  - Logout: limpia el espejo local (localStorage) conservando el carrito
 *    server-side.
 *  - El JWT/cookie jamás se gestiona desde el cliente.
 */
import { createContext, useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { useSession } from '@/features/auth/SessionContext'
import { localItemsToMergePayload, type CartItemInput } from './cart-mapper'
import { cartReducer, initialCartState } from './cart-reducer'
import { createSerialQueue } from './mutation-queue'
import {
    addItem as serverAddItem,
    clear as serverClear,
    mergeLocal as serverMergeLocal,
    removeItem as serverRemoveItem,
    updateQuantity as serverUpdateQuantity,
    type CartActionResult,
} from './actions'
import type { CartItem, ServerCart } from './cart-types'

export type { CartItem } from './cart-types'

export interface CartContextType {
    cart: CartItem[]
    totalItems: number
    totalPrice: number
    addToCart: (product: CartItemInput) => void
    removeFromCart: (id: string) => void
    updateQuantity: (id: string, delta: number) => void
    clearCart: () => void
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'carrito'

function normalizeStored(items: CartItem[]): CartItem[] {
    return items.map((item) => ({
        ...item,
        // unitLabel ya no es necesario para presentación (usa formatUnitLabel en componentes)
        // aseguramos que unidad y quantity existan para compatibilidad
        unidad: item.unidad || (item.precioTexto ? item.precioTexto.split('/').pop()?.trim() : undefined),
    }))
}

export function CartProvider({ children }: { children: ReactNode }) {
    const { status } = useSession()
    const [state, dispatch] = useReducer(cartReducer, initialCartState)

    const queueRef = useRef(createSerialQueue())
    const serverCartRef = useRef<ServerCart | null>(null)
    const cartRef = useRef<CartItem[]>([])
    const localCartRef = useRef<CartItem[]>([])
    const hydratedRef = useRef(false)
    const prevStatusRef = useRef(status)
    const mergeInFlightRef = useRef(false)
    const doMergeRef = useRef<() => Promise<void>>(async () => {})

    const isServerSource = state.mode === 'authenticated' && !state.pendingMerge && state.serverSynced

    const clearLocalMirror = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch {
            // non-critical
        }
    }, [])

    // 1) Hidratar el carrito local (localStorage) una sola vez al montar.
    useEffect(() => {
        if (hydratedRef.current) return
        hydratedRef.current = true
        let items: CartItem[] = []
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) items = JSON.parse(saved) as CartItem[]
        } catch {
            // silently fail
        }
        dispatch({ type: 'HYDRATE_LOCAL', items: normalizeStored(items) })
    }, [])

    // Reflejo de estado en refs (solo en effects; React 19 evita reads/writes en render).
    useEffect(() => {
        cartRef.current = state.cart
        localCartRef.current = state.localCart
        serverCartRef.current = state.serverCart
    }, [state.cart, state.localCart, state.serverCart])

    // 2) Persistir el espejo local SOLO en modo local (anónimo/pendingMerge).
    useEffect(() => {
        if (state.mode === 'loading') return
        if (isServerSource) return
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart))
        } catch {
            // silently fail
        }
    }, [state.mode, isServerSource, state.cart])

    // 3) Reaccionar a la sesión: loading → anonymous | authenticated; logout.
    useEffect(() => {
        const prev = prevStatusRef.current
        prevStatusRef.current = status
        if (status === 'loading' || status === prev) return

        if (status === 'authenticated') {
            dispatch({ type: 'SESSION_RESOLVED', status: 'authenticated' })
        } else if (prev === 'authenticated') {
            // Logout: el espejo local se limpia, el carrito server permanece.
            dispatch({ type: 'LOGOUT' })
            clearLocalMirror()
        } else {
            dispatch({ type: 'SESSION_RESOLVED', status: 'anonymous' })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status])

    const syncServerCart = useCallback(async () => {
        try {
            const res = await fetch('/api/cart', { cache: 'no-store' })
            const data = (await res.json()) as { user?: boolean; cart?: ServerCart | null }
            if (data.user && data.cart) {
                serverCartRef.current = data.cart
                dispatch({ type: 'SYNC_OK', serverCart: data.cart })
            } else {
                // Autenticado pero backend no disponible → fallback anónimo/local.
                dispatch({ type: 'SESSION_RESOLVED', status: 'anonymous' })
            }
        } catch {
            dispatch({ type: 'SESSION_RESOLVED', status: 'anonymous' })
        }
    }, [])

    const runMerge = useCallback(async () => {
        const payload = localItemsToMergePayload(localCartRef.current)
        const res = await serverMergeLocal(payload)
        if (res.ok) {
            serverCartRef.current = res.cart
            clearLocalMirror()
            dispatch({ type: 'MERGE_OK', serverCart: res.cart })
        } else {
            dispatch({ type: 'MERGE_FAIL' })
        }
    }, [clearLocalMirror])

    useEffect(() => {
        doMergeRef.current = runMerge
    }, [runMerge])

    // 4) Al entrar autenticado: si hay carrito local → merge server-wins; si
    //    no, sincronizar el carrito server. Un solo merge (POST /merge).
    useEffect(() => {
        if (state.mode !== 'authenticated' || state.serverSynced) return
        if (state.pendingMerge || mergeInFlightRef.current) return

        mergeInFlightRef.current = true
        void (async () => {
            try {
                if (localCartRef.current.length > 0) {
                    await runMerge()
                } else {
                    await syncServerCart()
                }
            } finally {
                mergeInFlightRef.current = false
            }
        })()
    }, [state.mode, state.serverSynced, state.pendingMerge, runMerge, syncServerCart])

    // 5) Reintentar un merge pendiente al recuperar la conexión.
    useEffect(() => {
        if (!(state.mode === 'authenticated' && state.pendingMerge)) return
        const onOnline = () => {
            void doMergeRef.current()
        }
        window.addEventListener('online', onOnline)
        return () => window.removeEventListener('online', onOnline)
    }, [state.mode, state.pendingMerge])

    // 6) Ejecutar una mutación autenticada: optimista + cola + reconciliar.
    const enqueueServerOp = useCallback((op: () => Promise<CartActionResult>) => {
        queueRef.current.push(async () => {
            const res = await op()
            if (res.ok) {
                serverCartRef.current = res.cart
                dispatch({ type: 'SYNC_OK', serverCart: res.cart })
            } else {
                dispatch({ type: 'ROLLBACK' })
            }
            return res
        })
    }, [])

    const addToCart = useCallback(
        (product: CartItemInput) => {
            const alreadyInCart = state.cart.some((item) => item.id === product.id)
            if (alreadyInCart) {
                dispatch({ type: 'OPTIMISTIC_UPDATE', id: product.id, delta: 1 })
            } else {
                dispatch({ type: 'OPTIMISTIC_ADD', product })
            }

            if (state.mode === 'anonymous' || state.pendingMerge) return

            enqueueServerOp(async () => {
                const serverItem = serverCartRef.current?.items.find((i) => i.productId === product.id)
                return serverItem
                    ? serverUpdateQuantity(product.id, serverItem.quantity + 1)
                    : serverAddItem(product.id, 1)
            })
        },
        [state.cart, state.mode, state.pendingMerge, enqueueServerOp]
    )

    const updateQuantity = useCallback(
        (id: string, delta: number) => {
            dispatch({ type: 'OPTIMISTIC_UPDATE', id, delta })

            if (state.mode === 'anonymous' || state.pendingMerge) return

            enqueueServerOp(async () => {
                const serverItem = serverCartRef.current?.items.find((i) => i.productId === id)
                const cartItem = cartRef.current.find((i) => i.id === id)
                if (serverItem) {
                    const next = serverItem.quantity + delta
                    return next <= 0 ? serverRemoveItem(id) : serverUpdateQuantity(id, next)
                }
                if (cartItem) {
                    // Item aún no confirmado en server: POST /items incrementa server-side.
                    return serverAddItem(id, Math.max(1, cartItem.cantidad))
                }
                return { ok: false, status: 404 } satisfies CartActionResult
            })
        },
        [state.mode, state.pendingMerge, enqueueServerOp]
    )

    const removeFromCart = useCallback(
        (id: string) => {
            dispatch({ type: 'OPTIMISTIC_REMOVE', id })
            if (state.mode !== 'anonymous' && !state.pendingMerge) {
                enqueueServerOp(() => serverRemoveItem(id))
            }
        },
        [state.mode, state.pendingMerge, enqueueServerOp]
    )

    const clearCart = useCallback(() => {
        dispatch({ type: 'OPTIMISTIC_CLEAR' })
        if (state.mode !== 'anonymous' && !state.pendingMerge) {
            enqueueServerOp(() => serverClear())
        }
    }, [state.mode, state.pendingMerge, enqueueServerOp])

    const totalItems = state.cart.reduce((acc, item) => acc + item.cantidad, 0)
    const totalPrice = state.cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

    const value = useMemo<CartContextType>(
        () => ({
            cart: state.cart,
            totalItems,
            totalPrice,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
        }),
        [state.cart, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart]
    )

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}