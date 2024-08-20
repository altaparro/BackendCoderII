import { Router } from 'express';
import ProductManager from "../dao/db/product-manager-db.js";
import CartManager from "../dao/db/cart-manager-db.js";

const productManager = new ProductManager();
const cartManager = new CartManager();
const router = Router();

// Renderizar la página de inicio (home.hbs)
router.get("/", async (req, res) => {
    try {
        res.render('home');
    } catch (error) {
        console.error("Error al renderizar la página de inicio:", error);
        res.status(500).json({ error: "Problema interno al renderizar la página de inicio" });
    }
});

// Renderizar la página de productos en tiempo real (realTimeProducts.hbs)
router.get('/realtimeproducts', async (req, res) => {
    try {
        const productos = await productManager.getProductsTotal();
        const productosModificados = productos.map(producto => {
            const { _id, ...resto } = producto.toObject();
            return { _id, ...resto };
        });
        res.render("realtimeproducts", { productos: productosModificados });
    } catch (error) {
        console.error("Error al obtener productos en tiempo real:", error);
        res.status(500).json({ error: "Problema interno al obtener productos en tiempo real" });
    }
});

// Renderizar la página de productos con paginación, filtrado y ordenamiento (products.hbs)
router.get("/products", async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = 'asc', query } = req.query;
        const productos = await productManager.getProducts({
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sort,
            query: query
        });

        const productosModificados = productos.docs.map(producto => {
            const { _id, ...resto } = producto.toObject();
            return { _id, ...resto };
        });

        res.render("products", {
            productos: productosModificados,
            hasPrevPage: productos.hasPrevPage,
            hasNextPage: productos.hasNextPage,
            prevPage: productos.prevPage,
            nextPage: productos.nextPage,
            currentPage: productos.page,
            totalPages: productos.totalPages
        });

    } catch (error) {
        console.error("Error al obtener la lista de productos:", error);
        res.status(500).json({ error: "Problema interno al obtener la lista de productos" });
    }
});

// Renderizar la página de detalles de un producto específico (productDetails.hbs)
router.get("/products/:pid", async (req, res) => {
    const id = req.params.pid;
    try {
        const producto = await productManager.getProductById(id);
        if (producto) {
            res.render("productDetails", producto.toObject());
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener los detalles del producto:", error);
        res.status(500).json({ error: "Problema interno al obtener los detalles del producto" });
    }
});

// Renderizar la página del carrito de compras (carts.hbs)
router.get("/carts/:cid", async (req, res) => {
    const cartId = req.params.cid;
    try {
        const carrito = await cartManager.getCartById(cartId);
        if (!carrito) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        const productosEnCarrito = carrito.products.map(item => {
            const product = item.product.toObject();
            return {
                ...product,
                quantity: item.quantity,
                total: item.quantity * product.price
            };
        });

        res.render("carts", { productos: productosEnCarrito });
    } catch (error) {
        console.error("Error al obtener el carrito de compras:", error);
        res.status(500).json({ error: "Problema interno al obtener el carrito de compras" });
    }
});

// Mostrar página de registro (register.hbs)
router.get("/api/sessions/register", (req, res) => {
    if (req.session.login) {
        return res.redirect("/profile");
    }
    res.render("register", { isRegisterPage: true });
})

// Mostrar página de inicio de sesión (login.hbs)
router.get("/api/sessions/login", (req, res) => {
    if (req.session.login) {
        return res.redirect("/profile");
    }
    res.render("login", { isRegisterPage: true });
})

// Mostrar perfil del usuario (profile.hbs)
router.get("/api/sessions/profile", (req, res) => {
    if (!req.session.login) {
        return res.redirect("/login");
    }
    res.render("profile", { isRegisterPage: true, user: req.session.user });
})

export default router;
