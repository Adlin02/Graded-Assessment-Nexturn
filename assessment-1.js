const productCatalog = [
    {
        id: 1,
        name: "Samsung Galaxy S-24",
        category: "Electronics",
        price: 10,
        available: true
    },
    {
        id: 2,
        name: "Monkey D Luffy",
        category: "Toys",
        price: 12.9,
        available: true
    },
    {
        id: 3,
        name: "I phone 15",
        category: "Electronics",
        price: 69.9,
        available: false
    }
];


function parseCatalogData(data) {
    return data;
}

const parsedProducts = parseCatalogData(productCatalog);


function addNewProduct(catalog, product) {
    return [...catalog, product];
}

const additionalProduct = {
    id: 4,
    name: "Six of Crows",
    category: "Books",
    price: 19.5,
    available: true
};

const catalogWithNewProduct = addNewProduct(parsedProducts, additionalProduct);

function updateProductPriceById(catalog, productId, updatedPrice) {
    return catalog.map((product) =>
        product.id === productId ? { ...product, price: updatedPrice } : product
    );
}

const catalogWithUpdatedPrice = updateProductPriceById(catalogWithNewProduct, 2, 34.9);

function getAvailableProducts(catalog) {
    return catalog.filter((product) => product.available);
}

const availableProductList = getAvailableProducts(catalogWithUpdatedPrice);

function filterCatalogByCategory(catalog, category) {
    return catalog.filter((product) => product.category === category);
}

const electronicsCatalog = filterCatalogByCategory(catalogWithUpdatedPrice, "Electronics");

console.log("Parsed Products:", parsedProducts);
console.log("All Products including new Product (ID 4):", catalogWithNewProduct);
console.log("All Products with updated Price for Product ID 2:", catalogWithUpdatedPrice);
console.log("Available Products:", availableProductList);
console.log("Electronics Products:", electronicsCatalog);