-- 0011: mensaje de invitación del contacto (hasta 300 caracteres).
-- Vacío (null o texto vacío) significa mensaje "General". La app guarda null cuando no hay mensaje propio.

alter table public.contact_details
  add column if not exists invite_message text
  check (invite_message is null or char_length(invite_message) <= 300);
