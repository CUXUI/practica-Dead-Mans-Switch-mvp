# Dead Man's Switch · MVP

Web app (PWA) de marca blanca. Lee `AGENTS.md` antes de tocar nada. Los flujos y duplas están en `docs/FLUJOS.md`.

## Puesta en marcha (una vez, por el núcleo)

1. Instalar Node.js LTS (nodejs.org).
2. En esta carpeta: `npm install`. Se crea `package-lock.json`: subilo al repo.
3. Copiar `.env.example` a `.env.local` y completar los valores.
4. En Supabase → SQL Editor, pegar y ejecutar `supabase/migrations/0001_profiles.sql`.
5. En Supabase → Authentication → URL Configuration, agregar `http://localhost:3000/**` y la URL de Vercel.
6. `npm run dev` y abrir http://localhost:3000.

## Verificación del núcleo

- [ ] Registro en `/registro` crea un usuario y un perfil
- [ ] Login en `/login` lleva a `/home`
- [ ] `/home` muestra "Perfil en base de datos: sí"
- [ ] "Enviar correo de prueba" llega a `TEST_EMAIL_TO`
- [ ] Chrome (Android) ofrece instalar la app; en iPhone: Compartir → Agregar a inicio

## Notas

- Sin dominio verificado, Resend solo entrega al correo dueño de la cuenta (`TEST_EMAIL_TO`).
- El service worker del núcleo no cachea nada ni maneja push; el flujo de notificaciones se agrega encima.
- Los íconos de `public/icons` son provisorios: reemplazar con los de cada marca.
