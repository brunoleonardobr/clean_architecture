import pgp from "pg-promise";

export default class CouponRepositoryDatabase {
  async get(name: string) {
    const connection = pgp()(
      "postgres://postgres:admin@localhost:5432/commerce"
    );
    const [couponData] = await connection.query(
      "SELECT * FROM public.coupon where name = $1",
      [name]
    );
    return couponData;
  }
}
