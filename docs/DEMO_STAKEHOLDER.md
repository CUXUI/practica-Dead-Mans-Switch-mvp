# Demo para el stakeholder (15 minutos)

Objetivo: mostrar el flujo completo de quien emite y de quien recibe, y dejar claro qué está listo y qué falta.

## Antes de la demo (lista de chequeo)

**Un día antes**
- [ ] Todas las ramas de la demo están en `main` con commit y el deploy de Vercel está en verde.
- [ ] `NEXT_PUBLIC_APP_URL` en Vercel apunta a `https://practica-dead-mans-switch-mvp.vercel.app` (o al dominio nuevo, si ya está listo). Hacer Redeploy después de cambiarla.
- [ ] Los correos de la demo llegan: enviar un correo de prueba a cada cuenta que vaya a recibir. Revisar la carpeta de spam.
- [ ] En Resend, revisar la advertencia de *"link URLs match sending domain"*. Si sigue, desactivar el *click tracking* del dominio.
- [ ] Grabar un video del flujo completo (plan B por si falla la red o el correo se demora).

**Una hora antes**
- [ ] Celular Android con la app instalada y las notificaciones activadas. Cuenta de emisor lista (por ejemplo `demo-emisor`).
- [ ] Segundo dispositivo o pestaña de incógnito para el contacto (sin sesión).
- [ ] Correo del contacto de demo abierto en otra pestaña (es un correo del equipo).
- [ ] Aviso de demo cargado con: un contacto aceptado y pasos cargados.
- [ ] Hora del disparo: se programa el aviso para que se dispare **a la hora exacta de la demo más la gracia**. La gracia mínima es de 15 minutos, así que programar el plazo al menos 20 minutos antes del paso 6.
- [ ] Revisar que la base de datos esté en `mzplr...` y que no haya alertas abiertas de pruebas anteriores (si hay, cerrarlas o sacarlas antes).

**Al empezar**
- [ ] Wifi estable en la sala. Hotspot del celular listo como respaldo.
- [ ] Cerrar notificaciones y modo No molestar en el celular de la demo.

## Guion

| Min | Qué pasa | Qué mostrar | Qué decir |
|---|---|---|---|
| 0:00–1:00 | Problema | Pantalla de inicio de la landing (`/landing`) | "Es una app para avisar que estás bien. Si dejás de confirmar, tus contactos reciben una alerta." |
| 1:00–4:00 | Alta en el celular | Registro con usuario, correo y la confirmación de mayor de 18. Guía para instalar la app | "Crear la cuenta lleva unos segundos. Instalarla en el celular es lo que permite las notificaciones." |
| 4:00–6:00 | Invitar contacto | Agregar un contacto con el correo del equipo. Mostrar el correo que llega | "El contacto no necesita cuenta: acepta desde el correo." |
| 6:00–7:30 | Aceptar desde el enlace | En la pestaña de incógnito, abrir el enlace de la invitación y aceptar | "Quien recibe solo usa el enlace. Así se queda como contacto." |
| 7:30–9:00 | Encender el aviso | Configurar hora y gracia. Encender el aviso. Mostrar el próximo plazo en Inicio | "Cuando el aviso está encendido, el sistema sabe cuándo tiene que confirmar." |
| 9:00–10:00 | Confirmar | Tocar "Estoy bien" (mantener 2 s). Mostrar la confirmación y el historial | "Confirmar guarda en el servidor. Si no llega, la app no muestra 'confirmado'." |
| 10:00–13:00 | La alerta | Se dispara el aviso (ya programado). Abrir el correo del contacto y el enlace. Ver la pantalla de la alerta: estado, pasos y mensaje | "Quien recibe ve la alerta sin cuenta: estado, pasos y cómo llamar o escribir." |
| 13:00–14:00 | Cerrar la alerta | Desde el emisor, cancelar la alerta (mantener 2 s). Mostrar cómo queda en el historial | "Cancelar es confirmar que estás bien. Queda registrado." |
| 14:00–15:00 | Lo que falta | Diapositiva o nota con la lista de pendientes | "Esto es lo que todavía no está: push a contactos, botón en la notificación de Android, recordatorio durante la gracia y el texto fijo de cada organización." |

## Si algo falla

- **El correo no llega:** mostrar el video grabado de ese paso y decir que el correo se está revisando.
- **Red caída:** usar el hotspot. Si no alcanza, mostrar el video completo.
- **El aviso no se disparó a tiempo:** no esperar. Mostrar el paso con el video y explicar que el disparo depende del tiempo de gracia.
- **La pantalla de la alerta da 404:** revisar que el enlace use el dominio correcto y que `NEXT_PUBLIC_APP_URL` esté bien.

## Qué no prometer

- Que el contacto reciba la alerta por push: hoy solo llega por correo.
- Que el botón "Estoy bien" funcione desde la notificación de Android: no está.
- Que la baja por enlace esté probada de punta a punta.
- Que los correos no caigan en spam hasta resolver la advertencia de Resend.
