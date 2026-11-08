# Requerimientos del MVP · Dead Man's Switch (PRD)

Convertido desde el .docx original. Fuente de verdad de los códigos E/R/S/O.

Requerimientos del MVP · Dead Man's Switch · PRD
Cambios del 28 y 29/10: sale el botón "Ya lo vi": abrir la alerta cuenta como visto (R3, S2, S3, estados, flujo principal, riesgo 4) · un canal que despierte a quien recibe queda como mejora posterior al MVP · nueva sección Negocio con las respuestas de Seba · preguntas abiertas nuevas: 12 y 13.
Cambios del 23/10: WhatsApp sale de la invitación · el aviso puede estar apagado y se edita apagado · se apaga solo si no queda ningún contacto aceptado · baja del contacto con código · la pantalla web de quien recibe también se diseña para computadora · se resuelve la pregunta abierta 9.
Cambios del 22/10: vencer no es cerrar (S5, estados, flujo principal, R7, una decisión nueva).
Cambios del 21/10: sale R8 (quien recibe no cierra la alerta) · nuevo S5 (la alerta vence por tiempo) · E5 suma "hasta 5 contactos" · el flujo principal y los estados de la alerta ya no incluyen el cierre por un contacto · "Alerta" pasa a ser un estado del aviso · contactos y aviso son objetos separados · 4 decisiones nuevas · historial para quien recibe, fuera del MVP · preguntas abiertas nuevas: 9, 10 y 11.
El producto
Una web app (PWA) de marca blanca para que una persona que vive o sale sola avise que está bien. Si deja de avisar, el sistema avisa a sus contactos de confianza.
Es una sola app de marca blanca: cada organización la ofrece con su nombre y sus colores. Las dos primeras versiones son Cerca (para quien vive sola) y Montaña (para quien sale sola). Cambian los textos, la marca y los valores por defecto; los pasos son los mismos.
Palabras que usamos
Códigos: cada requerimiento tiene una letra según quién lo usa. E = quien emite · R = quien recibe · S = lo que hace el sistema solo · O = la organización.
Aviso: lo que arma quien emite: cuándo confirma, su tiempo de gracia y sus contactos. Es una rutina (se repite, por ejemplo todos los días a las 10) o una salida (una vez, con hora de regreso). Hay un aviso activo por vez. Un aviso puede estar apagado, activo o en alerta. Solo se edita apagado y solo se activa si hay al menos un contacto aceptado (decidido el 23/10). Los contactos son de la cuenta: contactos y aviso son dos objetos separados, y el aviso llama a los contactos (decidido el 21/10).
Plazo: la hora límite para confirmar que está bien.
Tiempo de gracia: margen después del plazo en el que el sistema le insiste a quien emite antes de avisar a nadie.
Alerta: lo que reciben los contactos cuando quien emite no confirmó. No es otro objeto: es un estado del aviso, cuando se dispara.
"Ya lo vi" (visto): el sistema registra que el contacto abrió la pantalla de la alerta. No hay botón: abrirla cuenta como visto (decidido el 28/10). Visto no cierra la alerta.
Acción deliberada: mantener presionado el botón 2 s (con lector de pantalla: botón más confirmación). Ningún enlace ejecuta una acción solo.
Cierre de una alerta: no siempre es una buena noticia. Puede terminar porque la persona está bien o porque le pasó algo. El cierre informa y acompaña; nunca celebra.
Flujo principal
Quien emite crea su cuenta, instala la app y activa las notificaciones →arma su aviso (que empieza apagado) e invita al menos a un contacto→ los contactos aceptan desde un enlace, sin instalar nada → cuando acepta el primero, quien emite activa el aviso → quien emite confirma en cada plazo → si no confirma, el sistema le insiste durante el tiempo de gracia → si sigue sin confirmar, avisa a los contactos de a uno → un contacto abre la alerta (cuenta como visto) y actúa → la alerta se cierra cuando quien emite confirma que está bien (o cancela una falsa alarma). Si vence por tiempo, no se cierra: se avisa a todos y queda "sin resolver" en el historial. Quien recibe no cierra la alerta.
Quiénes lo usan
Quien emite: una persona que vive sola o que sale sola (deporte, zonas aisladas). Confirma que está bien.
Quien recibe: contacto de confianza. Puede no instalar nunca la app.
La organización: ofrece el producto con su marca. Los valores se cargan en la configuración de su versión.
Estados
Detalle en el mapa de estados de Gastón.
Home de quien emite: apagado (se puede editar; se activa solo con al menos un contacto aceptado) · faltan contactos (ningún contacto aceptado: el aviso no puede activarse) · activo (muestra el próximo plazo) · tiempo de gracia (pide confirmar ya) · alerta en curso (muestra a quién se avisó y el botón de cancelar).
Alerta, para quien recibe: enviada (nadie la abrió todavía) · alguien la vio (otro contacto ya abrió la alerta) · sin respuesta (nadie respondió en toda la lista) · cerrada (quien emite confirmó que está bien o canceló una falsa alarma) · sin resolver (venció sin que nadie la cerrara; se avisó a todos).
Cómo se mide (métricas del brief)
Alta completada (85 %): sin ayuda, quien emite crea la cuenta, instala la app, activa las notificaciones, arma el aviso e invita al menos a un contacto (E0, E3 a E5). Que los contactos acepten no es parte de la tarea.
Alerta comprendida (80 %): desde una alerta de prueba y sin ayuda, quien recibe explica qué pasó y elige qué hacer (R2 a R6).
Decisiones de producto
| Decisión | Por qué | Fecha | Validar en el test |
| Push principal, correo de respaldo (cambia el brief, que decía correo obligatorio) | En la encuesta nadie eligió el correo; el plan gratis permite 100 correos por día | 5/10 | — |
| WhatsApp solo como enlace (R4) y para compartir la invitación (E5). Cambia el 23/10: la invitación por WhatsApp sale | Enviar WhatsApp desde el sistema exige una API paga | 2/10 | 43 de 45 receptores quieren WhatsApp: ¿alcanza el enlace? |
| Cancelar una alerta pide una acción deliberada | Evitar cancelar por error | 30/9 | 28 de 45 prefieren un toque: ¿cuánta fricción se tolera? |
| Mínimo un contacto aceptado, avisados de a uno; la app recomienda sumar un segundo (cambia la decisión del 30/9, que pedía dos) | El 13 % usaría un solo contacto y pedir dos le cortaría el alta; el 87 % asignaría dos o más igual. Sin un segundo contacto no hay a quién pasar la alerta | 16/10 | — |
| Sin datos de salud; ubicación solo puntual y fuera del test | Privacidad; el brief excluye lo médico | 2/10 | — |
| Las alertas llegan a cualquier hora, sin horario de silencio | Si un contacto pudiera silenciarlas, el aviso dejaría de ser confiable | 7/10 | — |
| "Solo yo puedo confirmar que estoy bien" queda fuera del MVP (resuelve la pregunta abierta 3) | La research no muestra esa necesidad: pide confirmar con menos esfuerzo. Obligaría a abrir la app y desbloquear el teléfono, y eso rompe la confirmación desde la notificación (E2), la opción más elegida (38 %). Mucho esfuerzo para poco impacto | 16/10 | — |
| Quien recibe no instala la app ni crea cuenta: todo le llega por correo y a la página web de la alerta | Libera de construir una app para quien recibe. El límite de 100 correos por día es del plan gratuito de la práctica, no del negocio | 21/10 | — |
| Quien recibe no cierra la alerta (sale R8). Se cierra cuando quien emite confirma; si vence, queda sin resolver (S5) | Lo definió Seba (stakeholder). Resuelve la pregunta abierta 6 | 21/10 | — |
| Los pasos ante una alerta los escribe quien emite | Si los escribiera quien recibe, haría falta una app para quien recibe | 21/10 | — |
| El historial para quien recibe queda fuera del MVP | Lo pidió el 53 % en la research, pero exige cuenta para quien recibe. Queda para la V1 | 21/10 | — |
| Vencer no es cerrar: al vencer se avisa a quien emite y a todos los contactos, y la alerta queda "sin resolver" | En un dead man's switch, que nadie responda puede ser la señal de que pasó algo. Un cierre silencioso dejaría sola a la persona | 22/10 | — |
| WhatsApp sale del MVP como forma de invitar a un contacto (cambia la decisión del 2/10) | Agrega pasos a quien emite (sale de la app y envía a mano) y a quien recibe (hay que pedirle y verificarle el correo). El correo se necesita igual para las alertas. Abre la expectativa de alertas por WhatsApp, que exige una API paga. Es viabilidad (costo), no factibilidad técnica | 23/10 | — |
| El aviso tiene un estado "apagado": se edita apagado y se activa solo con al menos un contacto aceptado. Si se va el último contacto aceptado, se apaga solo y se avisa a quien emite (resuelve la pregunta abierta 9) | Editar un aviso en marcha obligaba a definir qué se puede cambiar y cuándo. Un aviso activo sin nadie a quien avisar deja sola a la persona | 23/10 | — |
| Con un solo contacto, la app muestra una advertencia con ícono de información y "ver más" que recomienda sumar otro (precisa la decisión del 16/10) | El producto se cubre ante el riesgo de quedarse sin contactos, sin dejar afuera a quienes usarían uno solo | 23/10 | — |
| Dejar de ser contacto: desde la landing o desde el pie de cada correo, con un código de confirmación enviado al correo | Quien recibe no tiene cuenta. La fricción es medida a propósito: no es un newsletter y nadie debe darse de baja por error | 23/10 | — |
| La pantalla web de quien recibe se diseña también para computadora | Recibe todo por correo y es probable que lo abra en la computadora | 23/10 | — |
| Sale el botón "Ya lo vi": abrir la alerta cuenta como visto y se lo muestra a quien emite | Quien recibe llama o escribe y sale de la página: casi nunca volvía a tocar el botón, el escalado seguía y asustaba a los demás contactos | 28/10 | ¿Quien emite entiende que "visto" no es "me ocupo"? |

Requerimientos
Todos son imprescindibles. Los deseables están al final, en "Fuera del MVP". Las letras de los códigos están en "Palabras que usamos".
Quien emite
| Código | Qué | Terminado cuando… |
| E0 | Crear la cuenta e instalar la app | Se registra con su correo y carga nombre y teléfono; confirma que es mayor de 18 y ve que el producto no reemplaza a emergencias. En iPhone ve la guía para agregar la app a inicio; en Android, el botón de instalar. Si niega las notificaciones, la app explica para qué sirven y deja seguir, avisando que solo recibirá correo |
| E1 | Confirmar que estoy bien con un toque | El botón está en la primera pantalla. Un toque registra la confirmación en el servidor y muestra la hora y el próximo plazo. Sin conexión, avisa que no se registró y reintenta: nunca muestra "confirmado" si el servidor no lo recibió. Con una alerta en curso, confirmar es cancelar (E6) |
| E2 | Confirmar desde la notificación | Android: un botón "Estoy bien" en la notificación confirma sin abrir la app. iPhone: la notificación abre la app con la confirmación a un toque |
| E3 | Armar una rutina o una salida | Rutina: una vez por día a la hora que elija. Salida: hora límite de regreso; termina cuando confirma con el mismo botón. Puede confirmar antes del plazo. El aviso nuevo empieza apagado. Para cambiarlo, quien emite lo apaga primero; solo se activa si hay al menos un contacto aceptado |
| E4 | Elegir el tiempo de gracia | 15 min, 30 min, 1 h u "otro" (hasta 24 h). Cada versión trae su valor por defecto (propuesta: Cerca 30 min, Montaña 2 h) |
| E5 | Invitar contactos y ordenarlos | Invita por correo, hasta 5 contactos. Ve si cada contacto está pendiente, aceptó o rechazó; puede reenviar, reemplazar y cambiar el orden. Si no queda ningún contacto aceptado (por ejemplo, por una baja), el aviso se apaga solo y la app se lo avisa para que sume otro. Con un solo contacto aceptado, la app le recomienda, con un ícono de información y "ver más", sumar un segundo para que la alerta pueda pasar a otra persona. |
| E6 | Cancelar una falsa alarma | Con una alerta en curso, el botón dice "Estoy bien, cancelar alerta" y pide una acción deliberada |
| E7 | Ver el historial | Por fecha: cada confirmación con su hora, y cada alerta con a quién se avisó, por qué canal, quién marcó "Ya lo vi" y cómo terminó |
| E8 | Borrar mi cuenta | Con una acción deliberada, borra la cuenta y sus datos; sus contactos reciben un aviso y no reciben más alertas |

Quien recibe
| Código | Qué | Terminado cuando… |
| R1 | Aceptar ser contacto | La invitación dice quién la manda y qué implica, en una pantalla. Acepta o rechaza desde el enlace, sin instalar ni crear cuenta. Al aceptar se le ofrece activar notificaciones. En iPhone, sin instalar la app no hay push: se le explica que le llegará por correo. Puede dejar de ser contacto en cualquier momento, desde un enlace al pie de cada correo o desde la landing: escribe su correo, recibe un código y lo ingresa para confirmar. Quien emite se entera |
| R2 | Recibir la alerta sin instalar la app | Llega por push si lo activó y, si no, por correo; los dos abren la pantalla web de la alerta, que se ve bien también en computadora. El texto dice "sin respuesta confirmada", nombra causas posibles (señal, batería, silencio) y no usa "emergencia", "peligro" ni "muerte" |
| R3 | Avisar "Ya lo vi" | Cuando quien recibe abre la pantalla web de la alerta, el sistema lo registra, frena el paso al siguiente contacto y se lo muestra a quien emite (como el doble tilde de WhatsApp); los demás contactos avisados ven que alguien ya la vio. Un programa de seguridad del correo que abra el enlace solo no debe contar como visto (pregunta abierta 12). Visto no cierra la alerta (decidido el 28/10; antes era un botón) |
| R4 | Llamar o escribir con un toque | Un botón abre la llamada al teléfono de quien emite y otro abre WhatsApp con un mensaje ya escrito. El sistema no llama ni envía nada |
| R5 | Ver la última señal | Dentro de la alerta, se ve la última confirmación y hace cuánto (fuera de una alerta: pregunta abierta 7) |
| R6 | Ver qué hacer | Los pasos que dejó quien emite más un texto fijo de la organización (si no dejó pasos, solo el texto fijo) |
| R7 | Saber cómo terminó | Recibe un aviso cuando la alerta se cierra (E6) o vence sin resolver (S5), con un tono que informa y acompaña |

El sistema y la organización
| Código | Qué | Terminado cuando… |
| S1 | Insistir antes de avisar | Al vencer el plazo, recuerda a quien emite y repite durante el tiempo de gracia (push, o correo si no tiene push). Nadie más recibe nada antes de que termine. El plazo corre en el servidor: con el teléfono apagado, la alerta sale igual |
| S2 | Avisar de a uno | Avisa al primer contacto; si nadie abre la alerta en el tiempo definido, pasa al siguiente. Si nadie responde al terminar la lista, avisa a todos a la vez y la alerta queda "sin respuesta", abierta hasta E6 o S5. Cuando un contacto abre la alerta, se les avisa a los que ya habían recibido la alerta; si alguien abre un enlace viejo, ve el estado actualizado |
| S3 | Cambiar de canal si un aviso no llega | Si el push falla o el contacto no lo tiene, manda correo en el momento; si el push salió pero nadie abrió la alerta en el tiempo definido, manda también correo. Cada intento queda registrado |
| S5 | Vencer la alerta | Si nadie la cierra, la alerta vence por tiempo. Vencer no es cerrar: el sistema avisa a quien emite y a todos los contactos, y la alerta queda "sin resolver" en el historial. Cuánto tarda y quién lo define: pregunta abierta 10 |
| S4 | Modo de prueba para el equipo, en los tests (lo pide el brief) | Las alertas llegan solo a contactos de prueba, con la etiqueta "Prueba" y tope de correos; permite forzar la falla del push. Se activa en la configuración, no en la app |
| O1 | Ajustes en tres niveles | Una tabla dice, para cada ajuste (frecuencia, tiempo de gracia, tiempo entre contactos, canales, textos, mínimo de contactos), si es fijo, preseteado por la organización o elegido por la persona. En la app, lo fijo se ve pero no se cambia |
| O2 | Textos y marca por versión | Cada versión se instala con su nombre, ícono y colores; mismos pasos, textos propios, sin mencionar la muerte. Contraste mínimo 4,5:1 en texto y 3:1 en controles; si un color de marca no llega, se usa el del núcleo. Los estados de la alerta no cambian de color ni de nombre entre marcas |

Riesgos
En iPhone, quien recibe sin la app instalada depende del correo, que nadie eligió y que puede caer en spam.
Instalar la app en iPhone es el mayor riesgo para el 85 %: el test necesita personas con iPhone y con Android en los dos perfiles.
Los 100 correos por día se reparten entre invitaciones, insistencias, alertas y pruebas.
Abrir la alerta frena el escalado aunque quien la abrió no actúe, y un programa de seguridad del correo puede abrirla solo (preguntas abiertas 4 y 12).
La base de datos gratuita (Supabase) se pausa si pasa 7 días sin uso, y con ella se detiene el reloj de los plazos: hay que vigilarla.
Un contacto puede bloquear los correos desde su proveedor. Un rebote se detecta; un correo que llega a spam, no.
