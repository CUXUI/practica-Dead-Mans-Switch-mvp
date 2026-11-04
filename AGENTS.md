# AGENTS.md — Dead Man's Switch (MVP)

> Leé este archivo completo ANTES de escribir código. Si una instrucción del usuario contradice este archivo, avisale y preguntá antes de seguir.

## 1. Qué es el producto

Web app (PWA) de **marca blanca** para que una persona que vive o sale sola avise que está bien. Si deja de avisar, el sistema avisa a sus contactos de confianza.

- Es **una sola app**. Cada organización la ofrece con su nombre y colores. Primeras versiones: **Cerca** (vive sola) y **Montaña** (sale sola). Cambian textos, marca y valores por defecto; **los pasos son los mismos**.
- Fuente de verdad de requerimientos: el PRD "Requerimientos del MVP · Dead Man's Switch" (en `/docs/PRD.md` cuando se cargue). Los códigos E/R/S/O de abajo vienen de ahí.

## 2. Stack (cerrado)

| Capa | Herramienta |
|---|---|
| Framework | Next.js (App Router) + React + TypeScript (strict) |
| Estilos | Tailwind CSS con los tokens de la sección 5 |
| Base de datos y auth | Supabase (PostgreSQL + Auth) |
| Correo | Resend |
| Tareas programadas (plazos, tiempo de gracia, escalado) | Upstash QStash |
| Hosting | Vercel |
| Push | Web Push (VAPID) vía service worker |

**Versiones exactas:** las que figuren en `package.json` (se fijan al crear el núcleo, sin `^` ni `~`). No actualizar versiones sin pedirlo.

**Prohibido instalar paquetes que no estén en `package.json`.** Si creés que hace falta uno, frená y pedile autorización a la persona encargada del núcleo. No usar Inngest (se eligió QStash).

## 3. Estructura de carpetas

```
/app            Páginas y rutas (App Router). /app/api = endpoints
/components     Componentes de UI reutilizables
/lib            Utilidades, clientes (supabase, resend, qstash), tipos de dominio
/supabase/migrations   Cambios de esquema (solo los hace el núcleo)
/public         Iconos PWA, manifest, service worker
/docs           PRD, FLUJOS.md
```

- Cada flujo trabaja en su carpeta: `/app/<flujo>/` y `/components/<flujo>/`. **No tocar carpetas de otro flujo.**
- Lo compartido (`/lib`, `/supabase`, `AGENTS.md`, tokens de diseño) lo modifica solo el núcleo, vía Pull Request revisado.

## 4. Glosario (usar estos nombres, sin variantes)

| Término del PRD | En pantalla (es) | En código / tablas (en) |
|---|---|---|
| Quien emite | quien emite / tú | `issuer` (fila de `profiles`) |
| Quien recibe | contacto de confianza | `contact` |
| Aviso | aviso | `notice` (tipo `routine` o `trip`) |
| Rutina / Salida | rutina / salida | `routine` / `trip` |
| Estado del aviso | apagado, activo, en alerta | `off`, `active`, `alert` |
| Plazo | plazo | `deadline` |
| Tiempo de gracia | tiempo de gracia | `grace_period` |
| Alerta | alerta | `alert` (**es un estado del aviso**, no un objeto aparte del flujo) |
| Visto ("Ya lo vi") | visto | `seen_at` (se registra al abrir la pantalla; **no hay botón**) |
| Confirmación | confirmación | `checkin` |
| Intento de aviso | — | `delivery_attempt` (canal, resultado) |
| Acción deliberada | mantener 2 s | componente `HoldButton` |

Reglas del dominio que no se rompen:
- **Contactos y aviso son objetos separados.** El aviso llama a los contactos. Los contactos son de la cuenta.
- **Hay un solo aviso activo por vez.**
- **El aviso solo se edita apagado** y **solo se activa con al menos 1 contacto aceptado**. Hasta 5 contactos. Si se va el último aceptado, el aviso se apaga solo y se avisa a quien emite.
- **Visto no cierra la alerta.** Frena el paso al siguiente contacto y se le muestra a quien emite.
- **Quien recibe NO cierra la alerta.** Se cierra cuando quien emite confirma o cancela (E6). Si vence por tiempo, **no se cierra**: se avisa a todos y queda `sin resolver`.
- **Quien recibe no tiene cuenta ni instala nada.** Todo le llega por correo/push y a una página web pública con token.
- **Los plazos corren en el servidor** (QStash), nunca en el navegador.
- **Nunca mostrar "confirmado" si el servidor no lo recibió** (E1).
- **Ningún enlace ejecuta una acción solo.** Las acciones destructivas o de cancelación piden acción deliberada (mantener presionado 2 s; con lector de pantalla, botón + confirmación).
- El sistema **no llama ni envía WhatsApp**: solo abre enlaces `tel:` y `wa.me` en el dispositivo de quien recibe.
- **Sin datos de salud.** Ubicación solo puntual y fuera del test.

Estados de la alerta para quien recibe: `enviada` · `alguien la vio` · `sin respuesta` · `cerrada` · `sin resolver`. No cambian de nombre ni de color entre marcas.

## 5. Design system

> Completar con los tokens reales del equipo de diseño. Hasta entonces, no inventar colores nuevos: usar solo los tokens definidos en `tailwind.config`.

- Colores por **nombre semántico** (`brand-primary`, `brand-onPrimary`, `surface`, `text`, `danger`, `success`), nunca hex sueltos en componentes.
- La marca (nombre, ícono, colores) se carga por versión (Cerca / Montaña). Si un color de marca no cumple contraste, se usa el del núcleo.
- **Accesibilidad obligatoria:** contraste mínimo **4,5:1** en texto y **3:1** en controles; áreas táctiles de al menos 44×44 px; todo operable con lector de pantalla.
- **Tono de los textos:** informa y acompaña. **Nunca** usar "emergencia", "peligro" ni "muerte". Se dice "sin respuesta confirmada" y se nombran causas posibles (señal, batería, silencio). El cierre de una alerta nunca celebra.
- Textos de interfaz en español, tuteo neutro. Los textos viven en un archivo por versión (no escribirlos fijos dentro de los componentes).

## 6. Reglas de código

- TypeScript estricto; sin `any` salvo justificado en comentario.
- Acceso a datos solo con el cliente de Supabase de `/lib`. **RLS activado en todas las tablas.** Quien recibe accede por token firmado, nunca con acceso abierto a tablas.
- Cambios de esquema = archivo nuevo en `/supabase/migrations`. No editar migraciones ya existentes. Solo el núcleo las crea.
- Límites de los planes gratuitos (diseñar con esto en mente): **100 correos/día** en Resend (se reparten entre invitaciones, insistencias, alertas y pruebas), **500 peticiones/día** en QStash. Evitar envíos innecesarios.
- Push es el canal principal; el correo es respaldo. Si el push falla o no existe, correo inmediato. Cada intento se registra.
- Cada PR debe incluir una prueba manual en el celular (ver plantilla de PR).

## 7. Secretos

El repositorio es **público**. **Nunca** escribir claves, contraseñas, tokens ni URLs privadas en el código, comentarios, capturas ni commits.

- Local: `.env.local` (ignorado por git). Los nombres de las variables están en `.env.example`.
- Producción: Environment Variables en Vercel.
- Solo `NEXT_PUBLIC_*` puede llegar al navegador. Las claves de Resend, QStash y la `service_role` de Supabase **solo en servidor**.

## 8. Flujo de trabajo con Git

1. Nadie trabaja sobre `main`.
2. Una rama por tarea: `feature-<flujo>-<detalle>` (ej. `feature-contactos-invitar`).
3. Al terminar un tramo, subir la rama y abrir un Pull Request con la plantilla.
4. Vercel genera un link de vista previa: probarlo en el celular antes de pedir revisión.
5. Solo el núcleo hace Merge.

## 9. Qué hacer cuando dudás

Si falta información (copy, comportamiento, caso borde), **no la inventes**: buscá en el PRD; si no está, anotá la duda en el PR como "Pregunta abierta" y seguí con lo que sí está definido.

## 10. Fuera del MVP (no construir)

Historial para quien recibe · app o cuenta para quien recibe · alertas por WhatsApp desde el sistema · horario de silencio para contactos · "solo yo puedo confirmar" · canal que despierte a quien recibe · datos de salud.
