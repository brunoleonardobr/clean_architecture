import CouponRepository from "./CouponRepository";
import CouponRepositoryDatabase from "./CouponRepositoryDatabase";
import EmailGateway from "./EmailGateway";
import EmailGatewayConsole from "./EmailGatewayConsole";
import ProductRepository from "./ProductRepository";
import ProductRepositoryDatabase from "./ProductRepositoryDatabase";
import { validateCpf } from "./validate-cpf";

export default class Checkout {
  constructor(
    readonly productRepository: ProductRepository = new ProductRepositoryDatabase(),
    readonly couponRepository: CouponRepository = new CouponRepositoryDatabase(),
    readonly emailGateway: EmailGateway = new EmailGatewayConsole()
  ) {}
  async execute(input: Input): Promise<Output> {
    const output = { subtotal: 0, total: 0, freight: 0 };

    if (validateCpf(input.cpf)) {
      if (input.items) {
        for (const item of input.items) {
          if (item.quantity <= 0)
            throw new Error("quantidade de itens não por ser negativo");

          if (input.items.filter((i: any) => i.id === item.id).length > 1)
            throw new Error("produto não pode ser duplicado");
          const productRepository = new ProductRepositoryDatabase();
          const productData = await productRepository.get(item.id);
          if (
            productData.width <= 0 ||
            productData.height <= 0 ||
            productData.lenght <= 0
          )
            throw new Error("dimensao do produto não pode ser negativa");

          if (productData.weight <= 0)
            throw new Error("peso do produto não pode ser negativo");

          const price = parseFloat(productData.price);
          output.subtotal += item.quantity * price;
          if (input.from && input.to) {
            const volume =
              (productData.width / 100) *
              (productData.height / 100) *
              (productData.lenght / 100);
            const density = parseFloat(productData.weight) / volume;
            let freight = volume * 1000 * (density / 100);
            freight = Math.max(10, freight);
            output.freight += freight * item.quantity;
          }
        }
      }
      output.total = output.subtotal;
      if (input.coupon) {
        const couponRepository = new CouponRepositoryDatabase();
        const couponData = await couponRepository.get(input.coupon);
        if (
          couponData &&
          couponData.expired_at.getTime() >= new Date().getTime()
        )
          output.total -=
            (output.total * parseFloat(couponData.percentual)) / 100;
      }
      output.total += output.freight;
      if (input.email) {
        await this.emailGateway.send(
          "Purchase success",
          "...",
          input.email,
          "commerce@vendas.io"
        );
      }
      return output;
    } else {
      throw new Error(`cpf inválido`);
    }
  }
}

type Input = {
  cpf: string;
  email?: string;
  coupon?: string;
  items: { id: number; quantity: number }[];
  from?: string;
  to?: string;
};

type Output = { subtotal: number; total: number; freight: number };
