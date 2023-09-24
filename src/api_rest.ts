import express, { Request, Response } from "express";
import pgp from "pg-promise";
import { validateCpf } from "./validate-cpf";

const app = express();

app.use(express.json());
app.post("/checkout", async function (req: Request, res: Response) {
  const output = { subtotal: 0, total: 0, freight: 0 };
  const connection = pgp()("postgres://postgres:admin@localhost:5432/commerce");
  try {
    if (validateCpf(req.body.cpf)) {
      if (req.body.items) {
        for (const item of req.body.items) {
          if (item.quantity <= 0)
            throw new Error("quantidade de itens não por ser negativo");

          if (req.body.items.filter((i: any) => i.id === item.id).length > 1)
            throw new Error("produto não pode ser duplicado");
          const [productData] = await connection.query(
            "SELECT * FROM public.products where id = $1",
            [item.id]
          );

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
          if (req.body.from && req.body.to) {
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
      if (req.body.coupon) {
        const [couponData] = await connection.query(
          "SELECT * FROM public.coupon where name = $1",
          [req.body.coupon]
        );
        if (
          couponData &&
          couponData.expired_at.getTime() >= new Date().getTime()
        )
          output.total -=
            (output.total * parseFloat(couponData.percentual)) / 100;
      }
      output.total += output.freight;
      res.json(output);
    } else {
      res.json({ message: "cpf inválido" });
    }
  } catch (error: any) {
    res.status(422).json({ message: error.message });
  } finally {
    await connection.$pool.end();
  }
});

app.listen(3000);
