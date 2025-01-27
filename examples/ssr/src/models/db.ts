import db from './db.json';

const products = db.products;
const productMap = new Map(products.map((product) => [product.id, product]));

export { products, productMap };
