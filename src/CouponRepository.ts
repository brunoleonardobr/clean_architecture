export default interface CouponRepository {
  get(name: string): Promise<any>;
}
