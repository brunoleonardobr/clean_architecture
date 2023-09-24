export default interface ProductRepository {
  get(id: number): Promise<any>;
}
