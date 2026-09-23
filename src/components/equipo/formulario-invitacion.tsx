"use client";

import { useActionState } from "react";

import { invitarMiembroAccion } from "@/app/(app)/acciones";
import { Aviso, BotonEnviar, claseCampo, claseEtiqueta } from "@/components/formulario";
import { AREAS, ETIQUETA_AREA, ETIQUETA_ROL, ROLES } from "@/lib/dominio";

export function FormularioInvitacion() {
  const [estado, accion] = useActionState(invitarMiembroAccion, null);
  return (
    <form
      action={accion}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_8rem_10rem_auto] lg:items-end"
    >
      <div>
        <label htmlFor="inv-nombre" className={claseEtiqueta}>
          Nombre
        </label>
        <input id="inv-nombre" name="nombre" required className={claseCampo} />
      </div>
      <div>
        <label htmlFor="inv-email" className={claseEtiqueta}>
          Email
        </label>
        <input id="inv-email" name="email" type="email" required className={claseCampo} />
      </div>
      <div>
        <label htmlFor="inv-rol" className={claseEtiqueta}>
          Rol
        </label>
        <select id="inv-rol" name="rol" defaultValue="equipo" className={claseCampo}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ETIQUETA_ROL[r]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="inv-area" className={claseEtiqueta}>
          Área principal
        </label>
        <select id="inv-area" name="areaPrincipal" defaultValue="" className={claseCampo}>
          <option value="">Ninguna</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {ETIQUETA_AREA[a]}
            </option>
          ))}
        </select>
      </div>
      <BotonEnviar>Enviar invitación</BotonEnviar>
      <div className="sm:col-span-2 lg:col-span-5">
        <Aviso
          error={estado && !estado.ok ? estado.error : undefined}
          mensaje={
            estado?.ok
              ? "Invitación enviada. La persona recibirá un email para crear su contraseña."
              : undefined
          }
        />
      </div>
    </form>
  );
}
