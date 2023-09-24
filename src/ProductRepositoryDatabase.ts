import pgp from "pg-promise";

export default class ProductRepositoryDatabase {
  async get(id: number) {
    const connection = pgp()(
      "postgres://postgres:admin@localhost:5432/commerce"
    );
    const [productData] = await connection.query(
      "SELECT * FROM public.products where id = $1",
      [id]
    );
    return productData;
  }
}
