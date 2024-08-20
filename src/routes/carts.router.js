import express from 'express';
const router = express.Router();
import CartManager from '../dao/db/cart-manager-db.js';
const cartManager = new CartManager();

// Crear un nuevo carrito de compras
router.post('/api/carts', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        console.error('Error al crear un nuevo carrito:', error);
        res.status(500).json({ error: 'Problema al crear el carrito' });
    }
});

// Obtener todos los carritos de compras
router.get('/api/carts', async (req, res) => {
    try {
        const carts = await cartManager.getAllCarts();
        res.status(200).json(carts);
    } catch (error) {
        console.error('Error al obtener los carritos:', error);
        res.status(500).json({ error: 'Problema al obtener los carritos' });
    }
});

// Obtener productos de un carrito específico por ID
router.get('/api/carts/:cid', async (req, res) => {
    const cartId = req.params.cid;
    try {
        const cart = await cartManager.getCartById(cartId);
        res.json(cart.products);
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        if (error.message.includes('No existe un carrito')) {
            res.status(404).json({ error: 'Carrito no encontrado' });
        } else {
            res.status(500).json({ error: 'Problema al obtener el carrito' });
        }
    }
});

// Eliminar todos los productos de un carrito por ID
router.delete('/api/carts/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const updatedCart = await cartManager.emptyCart(cartId);
        res.json({
            status: 'success',
            message: 'Carrito vaciado correctamente',
            updatedCart,
        });
    } catch (error) {
        console.error('Error al vaciar el carrito:', error);
        res.status(500).json({ error: 'Problema al vaciar el carrito' });
    }
});

// Actualizar productos de un carrito por ID
router.put('/api/carts/:cid', async (req, res) => {
    const cartId = req.params.cid;
    const updatedProducts = req.body;

    try {
        const updatedCart = await cartManager.updateCart(cartId, updatedProducts);
        res.json(updatedCart);
    } catch (error) {
        console.error('Error al actualizar el carrito:', error);
        res.status(500).json({ error: 'Problema al actualizar el carrito' });
    }
});

// Agregar un producto al carrito por ID de carrito y producto
router.post('/api/carts/:cid/product/:pid', async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    try {
        const updatedCart = await cartManager.addProductToCart(cartId, productId, quantity);
        res.json({ products: updatedCart.products });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        if (error.message.includes('No existe un carrito')) {
            res.status(404).json({ error: 'Carrito no encontrado' });
        } else {
            res.status(500).json({ error: 'Problema al agregar producto al carrito' });
        }
    }
});

// Eliminar un producto del carrito por ID de carrito y producto
router.delete('/api/carts/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        const updatedCart = await cartManager.removeProductFromCart(cartId, productId);
        res.json({
            status: 'success',
            message: 'Producto eliminado del carrito',
            updatedCart,
        });
    } catch (error) {
        console.error('Error al eliminar el producto del carrito:', error);
        res.status(500).json({ error: 'Problema al eliminar el producto del carrito' });
    }
});

// Actualizar la cantidad de un producto en el carrito por ID de carrito y producto
router.put('/api/carts/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const newQuantity = req.body.quantity;

        const updatedCart = await cartManager.updateProductQuantity(cartId, productId, newQuantity);
        res.json({
            status: 'success',
            message: 'Cantidad del producto actualizada correctamente',
            updatedCart,
        });
    } catch (error) {
        console.error('Error al actualizar la cantidad del producto en el carrito:', error);
        res.status(500).json({ error: 'Problema al actualizar la cantidad del producto' });
    }
});

export default router;
