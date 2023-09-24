import Checkout from "./checkout";

const input: {
  cpf: string;
  coupon?: string;
  items: { id: number; quantity: number }[];
  from?: string;
  to?: string;
} = {
  cpf: "",
  items: [],
};

process.stdin.on("data", async function (data) {
  const command = data.toString().replace(/\n/g, "");
  if (command.startsWith("set-cpf")) {
    input.cpf = command.replace("set-cpf", "");
    console.log(input.cpf);
    return;
  }
  if (command.startsWith("add-item")) {
    const [id, quantity] = command.replace("add-item ", "").split(" ");
    input.items.push({ id: parseInt(id), quantity: parseInt(quantity) });
    console.log(input.items);
    return;
  }
  if (command.startsWith("checkout")) {
    const checkout = new Checkout();
    try {
      const output = await checkout.execute(input);
      console.log(output);
    } catch (error: any) {
      console.log(error.message);
    }
  }
  if (command.startsWith("quit")) {
    process.exit();
  }
  console.log("Invalid command");
});
