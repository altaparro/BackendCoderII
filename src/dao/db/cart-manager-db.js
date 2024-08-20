import cartModel from "../models/cart.model.js";
import mongoose from "mongoose";

class CartManager {
    async createCart() {
        try {
            const newCart = await cartModel.create({ products: [] });
            return newCart;
        } catch (error) {
            console.error("Error: No se pudo crear el carrito", error);
            throw error;
        }
    }

    async getCartById(cartId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error(`El ID del carrito no es válido: ${cartId}`);
            }
            const cart = await cartModel.findById(cartId).populate("products.product");
            if (!cart) {
                throw new Error(`No se encontró el carrito con ID: ${cartId}`);
            }
            return cart;
        } catch (error) {
            console.error("Error: Falló la obtención del carrito por ID", error);
            throw error;
        }
    }

    async getAllCarts() {
        try {
            const carts = await cartModel.find().populate("products.product");
            return carts;
        } catch (error) {
            console.error("Error: No se pudieron obtener los carritos", error);
            throw error;
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("ID de carrito o producto no válido");
            }
            const cart = await cartModel.findById(cartId);
            if (!cart) {
                throw new Error(`No se encontró el carrito con ID: ${cartId}`);
            }
            const existsProduct = cart.products.find(item => item.product.toString() === productId);
            if (existsProduct) {
                existsProduct.quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }
            await cart.save();
            return cart;
        } catch (error) {
            console.error("Error: No se pudo agregar el producto al carrito", error);
            throw error;
        }
    }

    async emptyCart(cartId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error(`El ID del carrito no es válido: ${cartId}`);
            }
            const cart = await cartModel.findByIdAndUpdate(cartId, { products: [] }, { new: true });
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }
            return cart;
        } catch (error) {
            console.error("Error: No se pudo vaciar el carrito", error);
            throw error;
        }
    }

    async updateCart(cartId, updatedProducts) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error(`El ID del carrito no es válido: ${cartId}`);
            }
            const cart = await cartModel.findById(cartId);
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }
            cart.products = updatedProducts;
            await cart.save();
            return cart;
        } catch (error) {
            console.error("Error: No se pudo actualizar el carrito", error);
            throw error;
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("ID de carrito o producto no válido");
            }
            const cart = await cartModel.findById(cartId);
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }
            cart.products = cart.products.filter(item => item.product.toString() !== productId);
            await cart.save();
            return cart;
        } catch (error) {
            console.error("Error: No se pudo eliminar el producto del carrito", error);
            throw error;
        }
    }

    async updateProductQuantity(cartId, productId, newQuantity) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("ID de carrito o producto no válido");
            }
            const cart = await cartModel.findById(cartId);
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }
            const productIndex = cart.products.findIndex(item => item.product.toString() === productId);
            if (productIndex === -1) {
                throw new Error("Producto no encontrado en el carrito");
            }
            cart.products[productIndex].quantity = newQuantity;
            await cart.save();
            return cart;
        } catch (error) {
            console.error("Error: No se pudo actualizar la cantidad del producto en el carrito", error);
            throw error;
        }
    }
}

export default CartManager;
