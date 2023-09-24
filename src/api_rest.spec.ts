import Axios from "axios";

Axios.defaults.validateStatus = function () {
  return true;
};

describe("Checkout", () => {
  it("Deve criar um pedido com 3 produtos (com descrição, preço e quantidade) e calcular o valor total", async () => {
    const cpf = "407.302.170-27";
    const items = [
      { id: 1, quantity: 1 },
      { id: 2, quantity: 1 },
      { id: 3, quantity: 3 },
    ];
    const response = await Axios.post("http://localhost:3000/checkout", {
      cpf,
      items,
    });
    const output = response.data;
    expect(output.total).toBe(6090);
  });

  it("Deve criar um pedido com 3 produtos, associar um cupom de desconto e calcular o total (percentual sobre o total do pedido)", async () => {
    const cpf = "407.302.170-27";
    const items = [
      { id: 1, quantity: 1 },
      { id: 2, quantity: 1 },
      { id: 3, quantity: 1 },
    ];
    const coupon = "VALE10";
    const response = await Axios.post("http://localhost:3000/checkout", {
      cpf,
      items,
      coupon,
    });
    const output = response.data;
    expect(output.total).toBe(5427);
  });

  it("Não deve criar um pedido com cpf inválido (lançar algum tipo de erro)", async () => {
    const items = [
      { id: 1, quantity: 1 },
      { id: 2, quantity: 1 },
      { id: 3, quantity: 1 },
    ];
    const cpf = "999.999.999-99";
    const response = await Axios.post("http://localhost:3000/checkout", {
      cpf,
      items,
    });
    expect(response.data).toEqual({ message: "cpf inválido" });
  });

  it("Não deve aplicar cupom de desconto expirado", async () => {
    const cpf = "407.302.170-27";
    const items = [
      { id: 1, quantity: 1 },
      { id: 2, quantity: 1 },
      { id: 3, quantity: 3 },
    ];
    const coupon = "VALE20";
    const response = await Axios.post("http://localhost:3000/checkout", {
      cpf,
      items,
      coupon,
    });
    const output = response.data;
    expect(output.total).toBe(6090);
  });

  it("Ao fazer um pedido, a quantidade de um item não pode ser negativa", async () => {
    const cpf = "407.302.170-27";
    const items = [{ id: 1, quantity: -1 }];
    const input = { cpf, items };
    const response = await Axios.post("http://localhost:3000/checkout", input);
    const output = response.data;
    expect(response.status).toBe(422);
    expect(output.message).toEqual("quantidade de itens não por ser negativo");
  });

  it("O peso do item não pode ser negativo", async () => {
    const cpf = "407.302.170-27";
    const items = [{ id: 5, quantity: 1 }];

    const response = await Axios.post("http://localhost:3000/checkout", {
      cpf,
      items,
    });
    expect(response.data).toEqual({
      message: "peso do produto não pode ser negativo",
    });
  });

  it("Deve criar um pedido com 3 produtos calculando o do frete", async () => {
    const cpf = "407.302.170-27";
    const items = [
      { id: 1, quantity: 1 },
      { id: 2, quantity: 1 },
    ];

    const input = { cpf, items, from: "88015600", to: "22030060" };
    const response = await Axios.post("http://localhost:3000/checkout", input);
    const output = response.data;
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
    const response = await Axios.post("http://localhost:3000/checkout", input);
    const output = response.data;
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
    const response = await Axios.post("http://localhost:3000/checkout", input);
    expect(response.data).toEqual({
      message: "produto não pode ser duplicado",
    });
  });

  it("Nenhuma dimensão do item pode ser negativa", async () => {
    const cpf = "407.302.170-27";
    const items = [{ id: 4, quantity: 1 }];

    const response = await Axios.post("http://localhost:3000/checkout", {
      cpf,
      items,
    });
    expect(response.data).toEqual({
      message: "dimensao do produto não pode ser negativa",
    });
  });
});
