# Esquema de base de datos (propuesta)

Borrador para revisión. Nada de esto está aplicado todavía. Las migraciones se crean en `supabase/migrations/` una vez aprobado. Fuente: [PRD.md](PRD.md) y [AGENTS.md](../AGENTS.md).

Reglas generales:
- RLS activado en todas las tablas.
- Quien emite accede solo a lo suyo (`auth.uid() = issuer_id`).
- Quien recibe **no tiene cuenta**: accede por token firmado en la página web de la alerta, nunca con acceso abierto a tablas.
- Los plazos y el escalado corren en el servidor (QStash), no en el navegador.

## Tablas

### `profiles` (existe)
Datos de quien emite. Ya creada: `id`, `full_name`, `phone`, `is_adult`, `username`.

### `contacts` (nueva)
Quien recibe, de cuenta de quien emite. Máximo 5 por persona (E5).
- `id`, `issuer_id` → `profiles`
- `name`, `email`, `position` (orden, 1 a 5)
- `status`: `pending` · `accepted` · `rejected` · `removed` (E5, R1)
- `invite_token_hash`: para aceptar desde el enlace sin cuenta (R1)
- `accepted_at`, `removed_at`, `created_at`
- Sin `invite_token` en claro: solo el hash.

### `notices` (existe, hay que ampliar)
Ya tiene: `id`, `issuer_id`, `fire_at`, `recurrence`, `state`, `qstash_message_id`.
Agregar:
- `kind`: `routine` · `trip` (E3)
- `grace_minutes`: 15, 30, 60 o hasta 1440 (E4)
- `deadline`: próximo plazo (ya existe como `fire_at` para rutinas; para salidas es la hora de regreso)
- `state`: `off` · `active` · `alert` (ya existe)
- Regla: un solo aviso `active` o `alert` por persona (ya hay índice parcial para `active`; ampliar a `alert`).

### `notice_contacts` (nueva)
Qué contactos llama cada aviso y en qué orden. Separa contactos y aviso (AGENTS.md, decisión del 21/10).
- `notice_id`, `contact_id`, `position`
- PK compuesta (`notice_id`, `contact_id`)

### `confirmations` (nueva)
Cada "estoy bien" de quien emite (E1, E2, E3). Se registra en el servidor; nunca se muestra "confirmado" si no llegó.
- `id`, `issuer_id`, `notice_id`, `confirmed_at`, `source`: `app` · `notification` (E1, E2)

### `alerts` (nueva)
Una alerta es un estado del aviso cuando se dispara (glosario). Esta tabla guarda cada disparo.
- `id`, `notice_id`, `issuer_id`
- `started_at`, `closed_at`, `expires_at` (S5)
- `outcome`: `open` · `closed` (E6) · `unresolved` (S5)
- `last_stage`: en qué contacto va el escalado (S2)
- Estados visibles para quien recibe (`sent`, `seen`, `no_answer`, `closed`, `unresolved`) se calculan desde esta tabla y `alert_views`.

### `alert_recipients` (nueva)
Quién recibió cada alerta y cuándo (S2).
- `alert_id`, `contact_id`, `notified_at`, `token_hash` (página de la alerta sin cuenta)
- PK compuesta (`alert_id`, `contact_id`)

### `alert_views` (nueva)
Cada vez que alguien abre el link de la alerta o toca "Ya lo vi" (R3).
- `id`, `alert_id`, `contact_id`, `viewed_at`, `user_agent_hash`
- `event`: `link_opened` (abrió el link del correo) · `button_tap` (tocó "Ya lo vi" en la página)
- Plan A (MVP): solo se usa el link; se cuenta como visto el evento `link_opened`.
- Plan B (si los escáneres causan problemas): solo cuenta como visto `button_tap`. La tabla ya guarda ambos eventos, así que el cambio es solo de lógica, sin migración.
- Los escáneres de correo pueden generar `link_opened` sin intención de la persona (pregunta abierta 12).

### `delivery_attempts` (nueva)
Cada intento de aviso, con canal y resultado (S3, AGENTS.md).
- `id`, `alert_id`, `contact_id`, `channel`: `push` · `email` · `sms`/`wa` (solo enlace, no envío)
- `result`: `sent` · `failed` · `bounced`
- `attempted_at`, `provider_message_id`

### `push_subscriptions` (existe)
Un registro por dispositivo de quien emite.

### `contact_removals` (nueva)
Baja de contacto con código de confirmación (R1, decisión del 23/10).
- `contact_id`, `code_hash`, `expires_at`, `confirmed_at`

## Vistas y funciones para las duplas

Para que cada dupla consulte sin escribir SQL complicado:
- `v_my_notice`: aviso activo de la persona con su próximo plazo.
- `v_my_history`: confirmaciones y alertas de la persona (E7).
- Funciones `security definer` para acciones de quien recibe (aceptar, ver alerta, abrir alerta). Validan el token y no exponen tablas.

## Preguntas abiertas que bloquean el diseño

Del PRD, las que afectan el esquema:
- **Pregunta 4 y 12:** cómo distinguir una apertura real de un escáner de correo para contar "visto".
- **Pregunta 7 (decidida):** fuera de una alerta, quien recibe no ve la última señal. MVP: no se muestra. Después: mostrar solo un nivel de detalle bajo (opción 2). La última confirmación ya queda en `confirmations`, así que no cambia la base.
- **Pregunta 10 (en curso):** cuánto tarda S5 en vencer. Decidido crear el campo `alerts.expires_at` ahora (nullable, sin valor por defecto) y definir las horas después. Se guarda al disparar la alerta, así que cambiar el valor más adelante no afecta alertas ya disparadas.

## Orden de migraciones propuesto

1. `0005_contacts.sql`: `contacts`, `notice_contacts`, `contact_removals`.
2. `0006_notices_ampliar.sql`: columnas nuevas en `notices` y el índice para `alert`.
3. `0007_alerts.sql`: `alerts`, `alert_recipients`, `alert_views`, `delivery_attempts`.
4. `0008_confirmations.sql`: `confirmations`.
5. `0009_views_y_funciones.sql`: vistas para duplas y funciones de quien recibe.
