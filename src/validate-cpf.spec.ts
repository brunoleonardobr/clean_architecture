import { validateCpf } from "./validate-cpf";

describe("validate", () => {
  it.each(["407.302.170-27", "684.053.160-00", "746.971.314-01"])(
    "Deve testar um cpf válido",
    (cpf: string) => {
      const isValid = validateCpf(cpf);
      expect(isValid).toBeTruthy();
    }
  );

  it.each(["407.302.170-26", "407.302.170", "407.302"])(
    "Deve testar um cpf inválido",
    (cpf: string) => {
      const isValid = validateCpf(cpf);
      expect(isValid).toBeFalsy();
    }
  );

  it.each(["111.111.111-11", "222.222.222-22", "333.333.333-33"])(
    "Deve testar um cpf inválido",
    (cpf: string) => {
      const isValid = validateCpf(cpf);
      expect(isValid).toBeFalsy();
    }
  );

  it.each([""])("Deve testar um cpf inválido", (cpf: string) => {
    const isValid = validateCpf(cpf);
    expect(isValid).toBeFalsy();
  });
});
