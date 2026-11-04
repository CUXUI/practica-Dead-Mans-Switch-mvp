# Flujos y duplas

Cada dupla trabaja un flujo completo. Los códigos (E, R, S, O) son los del PRD. Completar la tabla de asignación el 4/11.

| # | Flujo | Requerimientos | Carpeta | Dupla | Rama | Estado |
|---|---|---|---|---|---|---|
| 1 | Alta de quien emite | E0 | `/app/alta` | | `feature-alta-*` | Sin asignar |
| 2 | Armar el aviso (rutina/salida, tiempo de gracia) | E3, E4 | `/app/aviso` | | `feature-aviso-*` | Sin asignar |
| 3 | Contactos e invitaciones (ambos lados) | E5, R1 | `/app/contactos`, `/app/invitacion` | | `feature-contactos-*` | Sin asignar |
| 4 | Home y confirmación | E1, E2, E6 | `/app/home` | | `feature-home-*` | Sin asignar |
| 5 | Pantalla de la alerta (quien recibe) | R2–R7 | `/app/alerta` | | `feature-alerta-*` | Sin asignar |
| 6 | Historial y cuenta | E7, E8 | `/app/historial`, `/app/cuenta` | | `feature-historial-*` | Sin asignar |
| 7 | Marca blanca y ajustes | O1, O2 | `/lib/brand` | | `feature-marca-*` | Sin asignar |
| 8 | Motor de alertas (plazos, insistir, escalar, vencer, canales) | S1–S3, S5 | `/app/api/engine`, `/lib/engine` | **Núcleo** | `feature-motor-*` | Núcleo |
| 9 | Modo de prueba | S4 | `/lib/testmode` | **Núcleo** | `feature-prueba-*` | Núcleo |

## Dependencias

- El flujo 8 (motor) lo hace el núcleo porque depende de QStash, Resend y Push, y un error rompe todo el producto.
- Los flujos 3 y 4 dependen de que el aviso (flujo 2) exista; acordar el modelo de datos con el núcleo antes de empezar.
- Los flujos 1 y 2 conviene hacerlos primero.

## Reglas

- No tocar la carpeta de otro flujo.
- Si necesitás una tabla o campo nuevo, pedirlo al núcleo (no crear migraciones).
- Dudas de producto: anotarlas en el PR como "Pregunta abierta".
