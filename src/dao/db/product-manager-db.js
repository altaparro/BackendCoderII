import productModel from "../models/product.model.js";

class ProductManager {
    async addProduct({ title, description, price, img, code, stock, category, thumbnails }) {
        try {
            if (!title || !description || !price || !code || !stock || !category) {
                console.error("Error: Todos los campos son obligatorios.");
                return;
            }
            const existingProduct = await productModel.findOne({ code: code });
            if (existingProduct) {
                console.error(`Error: El producto con el código ${code} ya existe.`);
                return;
            }
            const newProduct = new productModel({
                title,
                description,
                price,
                img,
                code,
                stock,
                category,
                status: true,
                thumbnails: thumbnails || []
            });
            await newProduct.save();
            console.log("Producto agregado exitosamente.");
        } catch (error) {
            console.error("Error al agregar el producto:", error.message);
            throw error;
        }
    }

    async getProducts({ limit = 10, page = 1, sort, query } = {}) {
        try {
            const skip = (page - 1) * limit;
            let queryOptions = {};
            if (query) {
                queryOptions = { category: query };
            }
            const sortOptions = {};
            if (sort) {
                sortOptions.price = sort === 'asc' ? 1 : -1;
            }
            const products = await productModel
                .find(queryOptions)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit);
            const totalProducts = await productModel.countDocuments(queryOptions);
            const totalPages = Math.ceil(totalProducts / limit);
            const hasPrevPage = page > 1;
            const hasNextPage = page < totalPages;
            return {
                docs: products,
                totalPages,
                prevPage: hasPrevPage ? page - 1 : null,
                nextPage: hasNextPage ? page + 1 : null,
                page,
                hasPrevPage,
                hasNextPage,
                prevLink: hasPrevPage ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}` : null,
                nextLink: hasNextPage ? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort}&query=${query}` : null,
            };
        } catch (error) {
            console.error("Error al obtener los productos:", error.message);
            throw error;
        }
    }

    async getProductById(id) {
        try {
            const product = await productModel.findById(id);
            if (!product) {
                console.error(`Error: Producto con ID ${id} no encontrado.`);
                return null;
            }
            return product;
        } catch (error) {
            console.error("Error al obtener el producto por ID:", error.message);
            throw error;
        }
    }

    async updateProduct(id, updatedProduct) {
        try {
            const product = await productModel.findByIdAndUpdate(id, updatedProduct, { new: true });
            if (!product) {
                console.error(`Error: Producto con ID ${id} no encontrado para actualizar.`);
                return null;
            }
            console.log("Producto actualizado exitosamente.");
            return product;
        } catch (error) {
            console.error("Error al actualizar el producto:", error.message);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const product = await productModel.findByIdAndDelete(id);
            if (!product) {
                console.error(`Error: Producto con ID ${id} no encontrado para eliminar.`);
                return null;
            }
            console.log("Producto eliminado exitosamente.");
            return product;
        } catch (error) {
            console.error("Error al eliminar el producto:", error.message);
            throw error;
        }
    }

    async getProductsTotal() {
        try {
            const products = await productModel.find();
            return products;
        } catch (error) {
            console.error("Error al obtener todos los productos:", error.message);
            throw error;
        }
    }
}

export default ProductManager;
