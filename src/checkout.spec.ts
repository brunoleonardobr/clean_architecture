import Axios from "axios";
import Checkout from "./checkout";
import ProductRepository from "./ProductRepository";
import CouponRepository from "./CouponRepository";

Axios.defaults.validateStatus = function () {
  return true;
};

let checkout: Checkout;
beforeEach(() => {
  const products: any = {
    1: {
      id: 1,
      description: "A",
      price: 1000,
      width: 100,
      height: 30,
      lenght: 10,
      weight: 3,
    },
    2: {
      id: 2,
      description: "B",
      price: 5000,
      width: 50,
      height: 50,
      lenght: 50,
      weight: 22,
    },
    3: {
      id: 3,
      description: "C",
      price: 30,
      width: 10,
      height: 10,
      lenght: 10,
      weight: 0.9,
    },
    4: {
      id: 1,
      description: "D",
      price: 100,
      width: -100,
      height: 30,
      lenght: 10,
      weight: 3,
    },
    5: {
      id: 1,
      description: "E",
      price: 1000,
      width: 100,
      height: 30,
      lenght: 10,
      weight: -3,
    },
  };
  const productRepository: ProductRepository = {
    async get(id: number): Promise<any> {
      return products[id];
    },
  };

  const coupons: any = {
    VALE10: {
      percentage: 10,
      expire_date: new Date("2024-10-01T10:00:00"),
    },
    VALE20: {
      percentage: 20,
      expire_date: new Date("2023-08-01T10:00:00"),
    },
  };
  const couponRepository: CouponRepository = {
    async get(name: string): Promise<any> {
      return coupons[name];
    },
  };
  checkout = new Checkout(productRepository, couponRepository);
});
describe("Checkout", () => {
  it("Deve criar um pedido com 3 produtos", async () => {
    const cpf = "407.302.170-27";
    const items = [
      { id: 1, quantity: 1 },
      { id: 2, quantity: 1 },
      { id: 3, quantity: 3 },
    ];
    const input = { cpf, items };
    const output = await checkout.execute(input);
    expect(output.total).toBe(6090);
  });

  it("Deve criar um pedido com 3 produtos e email", async () => {
    const cpf = "407.302.170-27";
    const items = [
      { id: 1, quantity: 1 },
      { id: 2, quantity: 1 },
      { id: 3, quantity: 3 },
    ];
    const email = "john.doe@gmail.com";
    const input = { cpf, items, email };
    const output = await checkout.execute(input);
    expect(output.total).toBe(6090);
  });

  it("Deve criar um pedido com 3 produtos, associar um cupom de desconto", async () => {
    const cpf = "407.302.170-27";
    const items = [
      { id: 1, quantity: 1 },
      { id: 2, quantity: 1 },
      { id: 3, quantity: 1 },
    ];
    const coupon = "VALE10";
    const input = { cpf, items, coupon };
    const output = await checkout.execute(input);
    expect(output.total).toBe(5427);
  });

  it("Não deve criar um pedido com cpf inválido (lançar algum tipo de erro)", async () => {
    const items = [
      { id: 1, quantity: 1 },
      { id: 2, quantity: 1 },
      { id: 3, quantity: 1 },
    ];
    const cpf = "999.999.999-99";
    const input = { cpf, items };
    await expect(() => checkout.execute(input)).rejects.toThrow(
      new Error("cpf inválido")
    );
  });

  it("Não deve aplicar cupom de desconto expirado", async () => {
    const cpf = "407.302.170-27";
    const items = [
      { id: 1, quantity: 1 },
      { id: 2, quantity: 1 },
      { id: 3, quantity: 3 },
    ];
    const coupon = "VALE20";
    const input = { cpf, items, coupon };
    const output = await checkout.execute(input);
    expect(output.total).toBe(6090);
  });

  it("Ao fazer um pedido, a quantidade de um item não pode ser negativa", async () => {
    const cpf = "407.302.170-27";
    const items = [{ id: 1, quantity: -1 }];
    const input = { cpf, items };
    await expect(() => checkout.execute(input)).rejects.toThrow(
      new Error("quantidade de itens não por ser negativo")
    );
  });

  it("O peso do item não pode ser negativo", async () => {
    const cpf = "407.302.170-27";
    const items = [{ id: 5, quantity: 1 }];

    const input = { cpf, items };
    await expect(() => checkout.execute(input)).rejects.toThrow(
      new Error("peso do produto não pode ser negativo")
    );
  });

  it("Deve criar um pedido com 3 produtos calculando o do frete", async () => {
    const cpf = "407.302.170-27";
    const items = [
      { id: 1, quantity: 1 },
      { id: 2, quantity: 1 },
    ];

    const input = { cpf, items, from: "88015600", to: "22030060" };
    const output = await checkout.execute(input);
    expect(output.total).toEqual(6250);
    expect(output.subtotal).toEqual(6000);
    expect(output.freight).toEqual(250);
  });

  it("Deve retornar o preço mínimo de frete caso ele seja superior ao valor calculado", async () => {
    const cpf = "407.302.170-27";
    const items = [
      { id: 1, quantity: 1 },
      { id: 2, quantity: 1 },
      { id: 3, quantity: 3 },
    ];
    const input = { cpf, items, from: "88015600", to: "22030060" };
    const output = await checkout.execute(input);
    expect(output.total).toBe(6370);
    expect(output.subtotal).toBe(6090);
    expect(output.freight).toBe(280);
  });

  it("Ao fazer um pedido, o mesmo item não pode ser informado mais de uma vez", async () => {
    const cpf = "407.302.170-27";
    const items = [
      { id: 1, quantity: 1 },
      { id: 1, quantity: 1 },
    ];
    const input = { cpf, items };
    await expect(() => checkout.execute(input)).rejects.toThrow(
      new Error("produto não pode ser duplicado")
    );
  });

  it("Nenhuma dimensão do item pode ser negativa", async () => {
    const cpf = "407.302.170-27";
    const items = [{ id: 4, quantity: 1 }];

    const input = { cpf, items };
    await expect(() => checkout.execute(input)).rejects.toThrow(
      new Error("dimensao do produto não pode ser negativa")
    );
  });
});
