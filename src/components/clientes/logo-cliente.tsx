import type { Cliente } from "@/db/schema";

/** Client logo, or its initial on the client's color. */
export function LogoCliente({
  cliente,
  tamano = 40,
}: {
  cliente: Pick<Cliente, "nombre" | "color" | "logoUrl">;
  tamano?: number;
}) {
  if (cliente.logoUrl) {
    return (
      // Arbitrary external logo URLs: next/image would need every host whitelisted.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cliente.logoUrl}
        alt=""
        width={tamano}
        height={tamano}
        className="shrink-0 rounded-lg bg-white object-contain"
        style={{ width: tamano, height: tamano }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-lg font-semibold text-white"
      style={{ width: tamano, height: tamano, backgroundColor: cliente.color }}
    >
      {cliente.nombre.charAt(0).toUpperCase()}
    </span>
  );
}
