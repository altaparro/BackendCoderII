import express from "express";
const router = express.Router();
import ProductManager from "../dao/db/product-manager-db.js";
const productManager = new ProductManager();

// Obtener un producto específico por ID
router.get("/api/products/:pid", async (req, res) => {
    const id = req.params.pid;
    try {
        const producto = await productManager.getProductById(id);
        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.json(producto);
    } catch (error) {
        console.error("Error al obtener el producto:", error);
        res.status(500).json({ error: "Problema interno al obtener el producto" });
    }
});

// Obtener todos los productos con paginación, filtrado y ordenamiento
router.get("/api/products", async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = 'asc', query } = req.query;
        const productos = await productManager.getProducts({
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sort,
            query: query
        });

        const nuevoArray = productos.docs.map(producto => {
            const { _id, ...rest } = producto.toObject();
            return rest;
        });

        const prevLink = productos.hasPrevPage ? `/api/products?page=${productos.prevPage}&limit=${limit}` : null;
        const nextLink = productos.hasNextPage ? `/api/products?page=${productos.nextPage}&limit=${limit}` : null;

        res.json({
            status: "success",
            payload: nuevoArray,
            totalPages: productos.totalPages,
            prevPage: productos.prevPage,
            nextPage: productos.nextPage,
            hasPrevPage: productos.hasPrevPage,
            hasNextPage: productos.hasNextPage,
            currentPage: productos.page,
            prevLink: prevLink,
            nextLink: nextLink
        });

    } catch (error) {
        console.error("Error al obtener los productos:", error);
        res.status(500).json({ error: "Problema interno al obtener los productos" });
    }
});

// Agregar un nuevo producto
router.post("/api/products", async (req, res) => {
    const nuevoProducto = req.body;
    try {
        await productManager.addProduct(nuevoProducto);
        res.status(201).json({ message: "Producto agregado correctamente" });
    } catch (error) {
        console.error("Error al agregar el producto:", error);
        res.status(500).json({ error: "Problema interno al agregar el producto" });
    }
});

// Actualizar un producto específico por ID
router.put("/api/products/:pid", async (req, res) => {
    const id = req.params.pid;
    const productoActualizado = req.body;
    try {
        const updatedProduct = await productManager.updateProduct(id, productoActualizado);
        if (!updatedProduct) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.json({ message: "Producto actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).json({ error: "Problema interno al actualizar el producto" });
    }
});

// Eliminar un producto específico por ID
router.delete("/api/products/:pid", async (req, res) => {
    const id = req.params.pid;
    try {
        const deletedProduct = await productManager.deleteProduct(id);
        if (!deletedProduct) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).json({ error: "Problema interno al eliminar el producto" });
    }
});

export default router;
