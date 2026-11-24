# Design system

El design system del producto tiene cuatro eslabones, cada uno con un solo lugar:

| Eslabón | Dónde vive | Qué es |
|---|---|---|
| Diseño | Figma, «Diseño base (DS - marca blanca)» | Variables con modos por marca y la Biblioteca de componentes (secciones 00 a 10) |
| Tokens | `tokens/tokens.json` | Las mismas variables de Figma, con el mismo nombre |
| Componentes | `components/ds/` | Construidos solo con tokens |
| Documentación | `/design-system` (dentro de la app) | Ejemplos que funcionan, uso, accesibilidad y mapa Figma ↔ código |

## Uso diario

```bash
npm run tokens     # después de cambiar tokens/tokens.json: genera app/tokens.css y lib/ds/tokens.ts
npm run dev        # http://localhost:3000/design-system
```

- Un botón: `import { Boton } from "@/components/ds/Boton"`.
- Solo las clases (para un `<Link>` o un `<button>` propio): `import { boton } from "@/components/ds/estilos"` y `className={boton.principal}`.
- Íconos: `import Icono from "@/components/ds/Icono"` y `<Icono nombre="check" />`. Son los de Figma.

## Temas de marca

El único token que cambia entre marcas es `accion/principal`.

| Tema | Valor | Cómo se activa |
|---|---|---|
| `base` (por defecto) | `#262626` | sin variable |
| `cerca` | `#b2102e` | `NEXT_PUBLIC_TEMA=cerca` |
| `montana` | `#1c7c70` | `NEXT_PUBLIC_TEMA=montana` |

Para una demo sin desplegar: `?tema=montana` en cualquier pantalla (se recuerda en ese navegador) y `?tema=reset` para volver. El selector de `/design-system` hace lo mismo.

Sumar una marca: agregar el modo en Figma, agregar el tema y su `accion/principal` en `tokens/tokens.json`, correr `npm run tokens`.

## Qué cambió en el producto al aplicar el sistema

- El color por defecto pasó del rojo de Cerca a la base en grises. El rojo sigue disponible como tema `cerca`.
- Los botones, campos, tarjetas, badges, la barra de navegación, el encabezado, el stepper y el toast de todos los flujos salen de `components/ds`. Los archivos `components/emisor/ui.tsx`, `components/cuenta/estilos.ts`, `components/invitacion/ui.tsx`, `components/baja/ui.tsx` y `components/landing/ui.tsx` conservan sus nombres y ahora reexportan el sistema.
- Tipografía Inter, servida desde el propio dominio.
- Foco de teclado con el token `foco/anillo` (3 px, separado 2 px).
- No cambió ninguna regla de negocio, ruta, texto ni llamada al servidor.

## Supernova

El export de Supernova del 14/11 (`tailwind.css`, `tailwind.base.css`, `tailwind.color-cerca.css`) solo traía el modo Cerca; los archivos siguen en el repositorio y ya no se importan. `tokens/tokens.json` genera las mismas variables CSS con los mismos nombres, más los tres temas. Cuando el export de Supernova esté completo puede reemplazar ese paso sin tocar componentes.

## Pendientes

Están en `/design-system/estado`, sección «Pendientes para alinear».
