# Guía corta para las duplas

Leé primero [AGENTS.md](../AGENTS.md) y [FLUJOS.md](FLUJOS.md). El modelo completo está en [ESQUEMA.md](ESQUEMA.md) y los requerimientos en [PRD.md](PRD.md).

## Qué tablas existen

| Tabla | Para qué sirve | Quién la ve |
|---|---|---|
| `profiles` | Datos de quien emite (nombre, teléfono, usuario) | Solo su dueño |
| `notices` | El aviso: rutina o salida, hora, tiempo de gracia, estado (`off`, `active`, `alert`) | Solo su dueño |
| `contacts` | Quién recibe, hasta 5 por persona, con estado (`pending`, `accepted`, `rejected`, `removed`) | Solo su dueño |
| `notice_contacts` | Qué contactos llama cada aviso, y en qué orden | Solo su dueño |
| `confirmations` | Cada "estoy bien" de quien emite | Solo su dueño |
| `alerts` | Cada alerta disparada, con su vencimiento (`expires_at`) y resultado | Solo su dueño |
| `alert_recipients` | A quién se avisó en cada alerta | Solo su dueño |
| `alert_views` | Cada apertura del link (`link_opened`) o toque en "Ya lo vi" (`button_tap`) | Solo su dueño |
| `delivery_attempts` | Cada intento de push o correo, con su resultado | Solo su dueño |
| `push_subscriptions` | Dispositivos de quien emite para notificaciones | Solo su dueño |
| `contact_removals` | Códigos de baja de un contacto | Nadie desde la app (solo servidor) |

Vistas para consultar sin armar SQL complejo:
- `v_my_notice`: tu aviso actual.
- `v_my_history`: tus confirmaciones y alertas (E7).

## Qué pueden consultar

Desde la app, con el cliente de `/lib/supabase`, solo ven **sus propios datos**: la base aplica RLS, así que una consulta siempre devuelve solo lo que pertenece a la persona logueada.

Ejemplo (en un componente o ruta del flujo de ustedes):

```ts
const supabase = createClient(); // de /lib/supabase
const { data } = await supabase.from("v_my_history").select("*").order("happened_at", { ascending: false });
```

Para probar una consulta nueva, usen el SQL Editor del proyecto con una cuenta de prueba, nunca con la clave `service_role`.

## Qué pueden hacer sin pedir nada

- Consultar sus datos y las vistas.
- Crear y editar sus propios registros en las tablas donde tienen política de escritura (por ejemplo `contacts`, `notices`).
- Armar componentes, páginas y rutas dentro de su carpeta de flujo (`/app/<flujo>/`, `/components/<flujo>/`).

## Qué piden al núcleo

Pedilo en el PR como "Pregunta abierta" o por el canal del núcleo. Hace falta para:

- **Tablas o columnas nuevas, o cambios de esquema.** Solo el núcleo crea migraciones en `/supabase/migrations`.
- **Cambios en `/lib`** (clientes de Supabase, email, QStash, push, marca).
- **Paquetes nuevos.** No se instalan sin autorización (AGENTS.md, sección 2).
- **Lógica del motor de alertas** (plazos, escalado, vencimiento): la hace el núcleo porque depende de QStash y Resend.
- **Acceso de quien recibe** (aceptar, ver la alerta, darse de baja): se hace con funciones del núcleo que validan el token. No consulten tablas directamente desde la página pública.

## Reglas que no se rompen

- No tocar la carpeta de otro flujo.
- No escribir claves, tokens ni URLs privadas en el código. Solo `NEXT_PUBLIC_*` puede llegar al navegador.
- No usar `SUPABASE_SERVICE_ROLE_KEY` en componentes ni en código que vaya al navegador.
- Textos en español, tuteo neutro, sin las palabras "emergencia", "peligro" ni "muerte".
- Cada PR incluye una prueba manual en el celular.
