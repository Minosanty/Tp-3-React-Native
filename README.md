# Mantenimiento IPF

Aplicación móvil para reportar desperfectos del edificio del Instituto Politécnico Formosa. Está implementada con React Native, Expo SDK 58, TypeScript y Expo Router. La app aplica mínimo privilegio: solicita cada permiso cuando se inicia la función que lo necesita, muestra una explicación propia antes del diálogo del sistema y conserva alternativas si la persona lo deniega.

## Requisitos

- Node.js LTS compatible con Expo SDK 58 y npm.
- Android Studio y un emulador/dispositivo Android para probar cámara, ubicación y notificaciones.
- Para compilar iOS, macOS con Xcode o un servicio de build remoto.

## Instalar y ejecutar

```sh
npm ci
npm run android
```

La app usa módulos nativos de SDK 58 para cámara, ubicación y notificaciones, así que en Android hay que instalar primero la development build con `npm run android`. Este comando compila e instala la app y puede dejar Metro iniciado; requiere Android Studio, un dispositivo o emulador y un JDK configurado. Para iniciar Metro después, ejecutá `npm start` y abrí la app Mantenimiento IPF instalada, no Expo Go. Si cambia una dependencia nativa o un plugin, volvé a compilar e instalar la build.

Expo Go no contiene necesariamente todos los módulos nativos que requiere esta versión de la app y puede mostrar errores como `Cannot find native module 'ExpoTopicSubscriptionModule'`. La build propia incluye esos módulos y conserva los textos y permisos configurados para la app.

En iOS, ejecutá `npx expo run:ios` y compilá con Xcode en macOS. Después de cambiar un plugin o los textos de propósito hay que crear una build nueva: una actualización OTA no modifica el manifiesto Android ni el `Info.plist`.

Comandos disponibles:

- `npm run start`: inicia Metro y Expo.
- `npm run android` / `npm run ios`: inicia y abre la plataforma local.
- `npm run web`: inicia la versión web para revisar las pantallas que no dependen de sensores.
- `npm run typecheck`: valida TypeScript.
- `npm run prebuild:android`: genera el proyecto Android nativo.

## Árbol de carpetas

```text
src/
  app/
    _layout.tsx                 Providers, canal Android y rutas Expo Router
    index.tsx                   Inicio y lista de reportes
    avisos.tsx                  Bandeja de avisos dentro de la app
    ajustes-app.tsx             Preferencia de avisos locales
    permisos/
      index.tsx                 Estado actual de permisos
      [recurso].tsx             Explicación previa y solicitud
    reporte/
      nuevo.tsx                 Formulario del reporte
      escanear.tsx              QR o ingreso manual del aula
      foto.tsx                  Captura o selector del sistema
      ubicacion.tsx             Ubicación en primer plano o sector manual
      [id].tsx                  Detalle y cambios de estado
  components/
    PermissionPrompt.tsx        Pantalla previa común
    ui.tsx                      Componentes y estilos compartidos
  context/
    AppContext.tsx               Reportes, borrador, avisos y preferencias locales
  hooks/
    usePermiso.ts                Consulta, solicitud y actualización al volver de Ajustes
  lib/
    notifications.ts             Canal Android previo a solicitar notificaciones
  types/
    report.ts                    Tipos de reportes y estados
RESPUESTAS.md                    Resolución de las Partes A a F
app.json                         Plugins, textos de propósito y permisos mínimos
```

## Flujo de permisos

1. La app consulta el estado actual; `null` se presenta como carga.
2. Antes de solicitar, muestra `/permisos/[recurso]` con el beneficio y el botón **Continuar**.
3. Usa el recurso solo con `granted`. Si hay denegación recuperable ofrece volver a intentar; si `canAskAgain` es `false`, deriva a Ajustes.
4. `usePermiso` vuelve a consultar al pasar de segundo plano a primer plano, por si la persona cambió el permiso en Ajustes.
5. La cámara no pide micrófono ni graba audio. La ubicación se solicita solo en primer plano y se etiqueta como aproximada. Para elegir una foto, se usa el selector del sistema y no se pide acceso amplio a la galería.
6. La preferencia de notificaciones no se activa hasta que la persona la habilita; los avisos también quedan en la bandeja interna.

## Verificación en dispositivos

- Probar en Expo Go que el formulario permite ingresar aula y sector sin habilitar cámara ni ubicación.
- En una development build Android, probar concesión, primera denegación, denegación repetida y cambio desde Ajustes. La revocación desde Ajustes puede reiniciar el proceso; al volver se debe consultar el estado otra vez.
- En iOS, probar ubicación aproximada y «Permitir una vez»; al reabrir, volver a consultar el estado.
- Probar la selección de una foto sin aceptar permisos generales de fotos.
- Activar notificaciones, simular una resolución y comprobar la bandeja interna y el aviso local programado para 10 segundos después.
- Revisar el manifiesto fusionado final: no debe conceder `SYSTEM_ALERT_WINDOW`, `RECORD_AUDIO` ni permisos amplios de lectura de fotos. El manifiesto generado puede mostrar reglas `tools:node="remove"` para garantizar esa exclusión.
- Para la defensa, grabar un recorrido corto con escaneo en sus estados, ubicación concedida/denegada, selección de foto, aviso y panel antes/después de Ajustes. Adjuntar además una captura del diálogo de cámara o ubicación de una development build con el texto de propósito propio. Esas evidencias requieren un dispositivo/emulador y no se simulan en Expo Go.

La aplicación guarda reportes y preferencias en el almacenamiento local del dispositivo; no se conecta a un backend.
