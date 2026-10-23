# Trabajo Práctico N.º 3 — Permisos móviles

**Proyecto:** Mantenimiento IPF · **Expo SDK 57**  
Las respuestas se completan junto con la implementación de la app.

## Parte A · ¿Qué es un permiso y por qué existe?

### A1. Conceptos

**a) ¿Qué es un permiso? ¿Qué papel cumplen la app, el sistema operativo y la persona usuaria?**  
Es una autorización para que una app acceda a un recurso o dato sensible del dispositivo. La app declara qué recursos podría necesitar y pide acceso al usarlos. El sistema operativo presenta el diálogo oficial, conserva y hace cumplir la decisión. La persona usuaria acepta, rechaza o concede un acceso parcial, y puede cambiar su decisión en Ajustes.

**b) ¿Qué es la caja de arena (sandbox)? ¿Qué puede hacer una app sin permisos?**  
Es el espacio aislado asignado a cada aplicación: otras apps no pueden leer sus archivos privados ni ella los de las demás. Sin permisos, una app puede mostrar pantallas, trabajar con sus propios datos y conectarse a Internet; no puede acceder por sí sola a la cámara, el micrófono, la ubicación o los contactos.

**c) Cuatro razones por las que existen los permisos.**

- **Privacidad:** la ubicación, las fotos o la voz no se comparten sin autorización.
- **Seguridad:** si una app tiene un problema o es maliciosa, el alcance del daño queda limitado.
- **Transparencia:** el sistema informa y señala cuándo se usan sensores y datos protegidos.
- **Control:** la persona decide, puede limitar el acceso y revocarlo desde Ajustes.

**d) Analogía del portero.**  
La visita es la app, el portero es el sistema operativo y el dueño del departamento es la persona usuaria. Que el portero recuerde la respuesta significa que el sistema persiste la decisión y la hace cumplir en las próximas solicitudes, hasta que la persona la cambie.

### A2. Declarar y solicitar

| Momento | ¿Qué se hace? | ¿Dónde / cómo en Expo? | ¿Qué pasa si se omite? |
|---|---|---|---|
| Declarar al compilar | Se incluye en la app el recurso que podría usar. | Android: `uses-permission` del manifiesto. iOS: clave y texto de propósito de `Info.plist`. Expo: plugins y configuración nativa en `app.json` / `app.config.ts`; Prebuild o EAS generan los archivos. | Android puede denegarlo sin mostrar diálogo. iOS puede fallar al usar la API protegida o rechazar la build en App Store Connect. |
| Solicitar al ejecutar | Se consulta o solicita permiso cuando la persona usa esa función. | Hooks o métodos del módulo correspondiente, por ejemplo `requestForegroundPermissionsAsync()` de `expo-location`. | La app no recibe acceso solo por declarar el permiso; debe respetar el estado devuelto y ofrecer alternativas. |

### A3. Verdadero o falso

| Afirmación | Respuesta | Justificación |
|---|---|---|
| a) El diálogo lo dibuja la app con componentes React Native. | **Falso.** | El diálogo oficial lo presenta el sistema operativo. La app puede mostrar antes una explicación propia. |
| b) En Expo la fuente de verdad es `AndroidManifest.xml`. | **Falso.** | La fuente de verdad es `app.json` / `app.config.ts` y los plugins. El manifiesto es generado. |
| c) Un nuevo permiso del `Info.plist` se publica con una actualización OTA. | **Falso.** | Los cambios nativos requieren una build nueva; OTA no modifica el paquete instalado. |
| d) Si el permiso pedido no está declarado en el manifiesto, Android puede denegarlo sin diálogo. | **Verdadero.** | La declaración nativa debe estar incluida antes de pedir el permiso en ejecución. |
| e) `expo-permissions` es el paquete recomendado en SDK 57. | **Falso.** | El paquete quedó obsoleto/eliminado; cada módulo gestiona sus propios permisos. |
| f) Las notificaciones necesitan una clave de propósito en `Info.plist`. | **Falso.** | No usan una clave de propósito como cámara o ubicación; se solicitan a través de la API de notificaciones. |
| g) Con acceso limitado a fotos, `status` puede ser `granted` y el detalle estar en `accessPrivileges`. | **Verdadero.** | En Expo, `accessPrivileges: 'limited'` informa que solo se compartió una selección. |
| h) Desinstalar y reinstalar es una forma fiable de volver a probar desde «sin decidir». | **Verdadero para el ejercicio.** | Es el método indicado para reiniciar el ciclo de permisos en las dos plataformas; los comandos del simulador también permiten resetear permisos puntuales. |

### A4. Estados de un permiso

| Estado conceptual | Expo `status` | `canAskAgain` | ¿Puede aparecer el diálogo? |
|---|---|---:|---|
| Sin decidir | `undetermined` | `true` | Sí, al solicitarlo explícitamente. |
| Concedido | `granted` | Depende del recurso/sistema | No hace falta volver a solicitarlo; se usa y se consulta su estado. |
| Denegado, se puede volver a pedir | `denied` | `true` | Sí. Primero se explica el beneficio y se permite reintentar. |
| Bloqueado | `denied` | `false` | No. Se informa cómo habilitarlo en Ajustes. |

En iOS el diálogo suele mostrarse una sola vez; luego una denegación deja el permiso bloqueado para nuevas solicitudes. Android permite volver a preguntar hasta que el sistema considere que la decisión quedó bloqueada (por ejemplo, tras dos rechazos en Android 11+).

## Parte B · Android: tipos de permisos y manifiesto

### B1. Clasificación de permisos

| Permiso | Tipo | ¿Cómo se obtiene? |
|---|---|---|
| `INTERNET` | Normal / instalación | Se concede automáticamente al instalar. |
| `CAMERA` | Peligroso / ejecución | Se declara y luego se solicita al usar la cámara. |
| `VIBRATE` | Normal / instalación | Se concede automáticamente al instalar. |
| `SYSTEM_ALERT_WINDOW` | Especial | La persona lo habilita en una pantalla de Ajustes; una app común debe evitarlo si no es indispensable. |
| `POST_NOTIFICATIONS` | Peligroso / ejecución desde Android 13 (API 33) | Se declara y se solicita al habilitar avisos. |
| `ACCESS_NETWORK_STATE` | Normal / instalación | Se concede automáticamente al instalar. |
| `READ_CONTACTS` | Peligroso / ejecución | Se solicita al entrar a una función que realmente necesita leer contactos. |
| `SCHEDULE_EXACT_ALARM` | Especial | Requiere habilitación/condiciones especiales del sistema, no el diálogo normal de ejecución. |
| `RECORD_AUDIO` | Peligroso / ejecución | Se solicita solo si se usa el micrófono. |
| `MANAGE_EXTERNAL_STORAGE` | Especial | Acceso amplio que se habilita en Ajustes y requiere una justificación excepcional. |

### B2. Grupos y nombres

**a)** Los permisos del mismo grupo producen una explicación del sistema agrupada. Si se piden `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION`, Android presenta el acceso de ubicación en un mismo flujo; la persona puede elegir una ubicación aproximada. No conviene pedir ubicación precisa si una zona alcanza.  
**b)** El nombre completo de cámara es `android.permission.CAMERA`.  
**c)** Los permisos de firma solo se conceden a apps firmadas con el mismo certificado que la app propietaria del permiso (a menudo el sistema). No son permisos que pueda pedir una app común distribuida al público.

### B3. Leer el manifiesto

**a)** `INTERNET` es normal y no requiere un diálogo. `CAMERA`, `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`, `POST_NOTIFICATIONS` (según versión) y `RECORD_AUDIO` requieren solicitud en tiempo de ejecución cuando corresponda. `READ_EXTERNAL_STORAGE` solo figura con `maxSdkVersion="32"` en el ejemplo y fue reemplazado por permisos/versiones de acceso a medios posteriores.

**b)** `android:maxSdkVersion="32"` limita esa declaración a Android API 32 o anterior. En Android 13/API 33 se usan permisos de medios más específicos; en versiones nuevas conviene usar el selector de fotos del sistema cuando alcanza.

**c)** La configuración Expo que elimina el permiso heredado `SYSTEM_ALERT_WINDOW` es:

```json
{
  "expo": {
    "android": {
      "blockedPermissions": [
        "android.permission.SYSTEM_ALERT_WINDOW"
      ]
    }
  }
}
```

Para declarar una alarma exacta se agrega `android.permission.SCHEDULE_EXACT_ALARM` a `expo.android.permissions`; solo debe hacerse si una función central realmente la requiere.

**d)** La app de este trabajo no programa alarmas exactas, así que no debe pedir `SCHEDULE_EXACT_ALARM`. Si una app sí lo necesita, debe revisar primero si las alarmas inexactas alcanzan y explicar el beneficio, porque es un acceso especial y puede requerir Ajustes.

**e)** No conviene editar a mano un manifiesto que Expo regenera: el cambio se pierde en Prebuild/EAS. `blockedPermissions` tampoco cambia el manifiesto de Expo Go; solo afecta una build propia.

### B4. Así pregunta Android

**a)** No se puede insertar texto propio en el diálogo del sistema. La app debe explicar, antes de solicitar, qué función se habilita y para qué necesita el dato.

**b)** «Mientras la app está en uso» permite usar la ubicación en primer plano. «Solo esta vez» da acceso temporal y el sistema puede revocarlo al dejar de usar la app. Esta segunda opción aparece para ubicación, cámara y micrófono desde Android 11.

**c)** En Android 11+, tras dos rechazos de un permiso, el sistema puede dejar de mostrar el diálogo y Expo informa `canAskAgain: false`. La app debe abrir Ajustes en lugar de volver a llamar a `request…PermissionsAsync()`.

**d)** Ubicación aproximada sirve para mostrar servicios de una zona, por ejemplo farmacias cercanas. No sirve para dar una ruta precisa hasta una puerta; para eso se necesita ubicación precisa y debe justificarse.

**e)** Si la persona revoca un permiso desde Ajustes con la app abierta, Android puede terminar el proceso. Al volver, la app debe iniciar correctamente y volver a consultar el permiso, sin asumir que el estado anterior sigue vigente.

### B5. Android, versión por versión

| Cambio | Versión / API | Implicación para el código |
|---|---|---|
| Permisos peligrosos en tiempo de ejecución | Android 6 / API 23 | Declarar y solicitar al ejecutar; no asumir que instalar concede acceso. |
| Ubicación en segundo plano separada | Android 10 / API 29; restricciones reforzadas en Android 11 / API 30 | Pedir primero primer plano y, solo si la función lo necesita, hacer un segundo flujo para background que puede llevar a Ajustes. |
| Permiso de notificaciones | Android 13 / API 33 | Crear el canal de notificaciones y solicitar `POST_NOTIFICATIONS` cuando la persona active los avisos. |
| Acceso parcial a fotos y medios | Android 14 / API 34 | Trabajar con fotos seleccionadas; preferir Photo Picker antes que pedir acceso amplio. |
| Permiso de red local | Android 16 / API 36 | Declararlo/solicitarlo solo si se descubren o controlan dispositivos de la red local. |

`targetSdkVersion` es el nivel de API al que la app declara adaptarse; el sistema aplica reglas en función de él. El enunciado indica que Expo SDK 57 apunta a API 36 y que, desde el 31/08/2026, Google Play exige API 36 a apps nuevas y actualizaciones. La fecha y el target deben comprobarse al preparar cada publicación.

## Parte C · iOS: textos de propósito y acceso parcial

### C1. Claves de `Info.plist`

| Recurso | Clave |
|---|---|
| Cámara | `NSCameraUsageDescription` |
| Micrófono | `NSMicrophoneUsageDescription` |
| Ubicación mientras se usa | `NSLocationWhenInUseUsageDescription` |
| Ubicación siempre | `NSLocationAlwaysAndWhenInUseUsageDescription` |
| Fotos para leer | `NSPhotoLibraryUsageDescription` |
| Fotos solo para guardar | `NSPhotoLibraryAddUsageDescription` |
| Contactos | `NSContactsUsageDescription` |
| Face ID | `NSFaceIDUsageDescription` |
| Rastreo entre apps (ATT) | `NSUserTrackingUsageDescription` |
| Notificaciones | No tienen clave de propósito equivalente en `Info.plist`. |

### C2. Sin texto, no hay permiso

**a)** Sin el texto requerido, el acceso puede fallar y, para ciertas APIs, la app puede cerrarse. App Store Connect puede rechazar la build con `ITMS-90683`. Una librería puede activar este problema aunque el código de la app no invoque esa API directamente; hay que identificarla y configurar el texto o quitar esa capacidad.

**b)** El diálogo de iOS se presenta una vez por recurso. Si la persona lo rechaza, no se vuelve a mostrar automáticamente; para cambiar la decisión se usan Ajustes.

**c)** El sistema arma el nombre y los controles del diálogo; la app escribe el texto de propósito que explica el uso concreto. En Expo se configura en el plugin del módulo o en las claves de `ios.infoPlist` de `app.json`.

**d)** Si una librería usa una API protegida, aunque la app no la llame, su código nativo puede activar la comprobación de privacidad. Se resuelve agregando el texto de propósito preciso si la dependencia es necesaria o eliminando/configurando la dependencia para que no incluya ese acceso, y luego creando una nueva build.

### C3. Probador de textos de propósito

| Texto propuesto | ¿Aprobable? | Versión mejorada |
|---|---|---|
| «Necesitamos tu ubicación.» | No: no explica para qué. | «Usamos tu ubicación para marcar en el reporte el sector donde encontraste el desperfecto.» |
| «Para mejorar tu experiencia.» | No: es vago y no identifica el dato ni el uso. | «Usamos tu ubicación mientras la app está abierta para ubicar el desperfecto en el reporte.» |
| «Usamos tu ubicación para mostrarte las farmacias de turno más cercanas.» | Sí, si esa es exactamente la función. | No requiere cambio; describe dato y beneficio concreto. |
| «La app no funciona sin ubicación.» | No: es coercitivo y falso si hay alternativa manual. | «Usamos tu ubicación para sugerir el lugar del desperfecto; también podés elegir el sector manualmente.» |
| «Ubicación requerida por el sistema.» | No: explica una exigencia técnica, no el propósito para la persona. | «Usamos tu ubicación en primer plano para señalar dónde está el desperfecto que reportás.» |

### C4. Acceso parcial y gradual

| Caso | iOS | En Expo |
|---|---|---|
| Fotos limitadas («Seleccionar fotos») | iOS 14+ | `accessPrivileges: 'limited'`; usar solo la selección compartida. |
| Ubicación aproximada | iOS 14+ | `ios.accuracy: 'reduced'`; no mostrar un punto exacto. |
| «Permitir una vez» para ubicación | iOS 13+ | El acceso vale durante la sesión; consultar el estado de nuevo más tarde. |
| Ubicación escalonada: al usar → siempre | iOS 13+ | Pedir primero primer plano; solicitar «Siempre» solo como segundo paso si una función real lo necesita. |
| Notificaciones provisionales | iOS 12+ | Puede entregar avisos en silencio; respetar el estado y la preferencia de la persona. |
| Rastreo entre apps (ATT) | iOS 14.5+ | Solo con propósito real; usar `expo-tracking-transparency`. |

Expo SDK 57 requiere iOS 16.4 o posterior. Por eso los controles anteriores a iOS 17 siguen siendo relevantes en los dispositivos soportados; hay que diseñar para acceso limitado y aproximado.

### C5. Android vs. iOS

| Tema | Android | iOS |
|---|---|---|
| Dónde se declara | `uses-permission` en el manifiesto | Clave de propósito en `Info.plist` para cada API protegida |
| Texto dentro del diálogo | Lo redacta el sistema | El sistema incluye el texto de propósito que escribe la app |
| Permisos sin diálogo | Sí, permisos normales como `INTERNET` | Los recursos protegidos preguntan; Internet no requiere permiso |
| Reintentos | Puede volver a preguntar; Android 11+ puede bloquear tras rechazos repetidos | El diálogo se ofrece una sola vez; cambiar después requiere Ajustes |
| «Solo esta vez» | Ubicación, cámara y micrófono desde Android 11 | Ubicación desde iOS 13 |
| Fotos parciales | Android 14+ | iOS 14+ |
| Ubicación aproximada | Android 12+ | iOS 14+ |
| Notificaciones | `POST_NOTIFICATIONS` desde Android 13 | Solicitud de autorización del sistema; no hay clave de propósito en `Info.plist` |
| Ubicación en segundo plano | Permiso separado; desde Android 11 el flujo puede ir a Ajustes | Segundo pedido para «Siempre» tras el acceso en uso |
| Declaración ausente | Se deniega, a menudo sin diálogo | Puede fallar/cerrarse la app y la tienda puede rechazar la build |
| Revocación | Ajustes; también se pueden restablecer permisos de apps inactivas | Ajustes de la app o del sistema |

## Parte D · Expo: una API, dos plataformas

### D1. Módulos y funciones

| Necesidad | Módulo | Hook o función |
|---|---|---|
| Escanear un QR con cámara | `expo-camera` | `useCameraPermissions()` / solicitud de cámara |
| Grabar video con sonido | `expo-camera` | `useMicrophonePermissions()` además del permiso de cámara |
| Mostrar farmacias cercanas | `expo-location` | `useForegroundPermissions()`; ubicación en primer plano |
| Seguir un envío con la app en segundo plano | `expo-location` | `useBackgroundPermissions()`, luego de conceder primer plano y con justificación |
| Galería propia que necesita leer toda la biblioteca | `expo-image-picker` | `useMediaLibraryPermissions()`; pedir solo al entrar en esa función |
| Elegir una foto puntual | `expo-image-picker` | `launchImageLibraryAsync()` abre el selector del sistema; no pedir permiso general |
| Publicidad personalizada entre apps | `expo-tracking-transparency` | `useTrackingPermissions()` solo si se realiza rastreo |

Un tutorial que usa `import * as Permissions from 'expo-permissions'` está desactualizado: el permiso se solicita a través del módulo de la capacidad concreta.

### D2. Consultar, pedir y el hook

**a)** `getPermissionsAsync()` consulta el estado y no muestra diálogo. `requestPermissionsAsync()` pide autorización y puede mostrarlo si el sistema permite preguntar. Si `canAskAgain` es `false`, una nueva llamada no abre el diálogo y la app debe explicar cómo ir a Ajustes. Llamar a `request…` desde el render o en un bucle pediría repetidamente y causaría una experiencia intrusiva.

**b)** `useForegroundPermissions()` devuelve tres elementos: la respuesta actual (o `null` mientras consulta), una función para solicitar y una función para consultar el estado otra vez. Mientras la respuesta sea `null`, se muestra carga y no se usa el recurso.

**c)** Con `canAskAgain === false`, llamar a `request…` no soluciona el bloqueo ni abre el sistema. Si se llama desde un bucle se repiten llamadas inútiles; se debe ofrecer `Linking.openSettings()` y dejar de insistir.

### D3. Leer la respuesta

| Respuesta | Qué debe hacer la app |
|---|---|
| `null` | Mostrar indicador de carga; todavía no habilitar la función. |
| `{ status: 'granted', granted: true }` | Continuar con el recurso. |
| `{ status: 'undetermined', canAskAgain: true }` | Explicar el beneficio y pedir después de que la persona toque «Continuar». |
| `{ status: 'denied', canAskAgain: true }` | Mantener alternativa, explicar y permitir un nuevo intento cuando la persona lo elija. |
| `{ status: 'denied', canAskAgain: false }` | Mostrar cómo habilitarlo y ofrecer Ajustes. |
| `{ status: 'granted', accessPrivileges: 'limited' }` | Trabajar con los elementos seleccionados; permitir ampliar la selección solo si la persona elige esa función. |

### D4. Simulación del ciclo de vida

En Android 14, app recién instalada y ubicación en primer plano:

| Paso | Acción | Respuesta esperada | `canAskAgain` | ¿Diálogo? |
|---:|---|---|---:|---|
| 1 | `getForegroundPermissionsAsync()` | `undetermined` | `true` | No |
| 2 | Primera solicitud y «No permitir» | `denied` | `true` | Sí |
| 3 | Segunda solicitud y «No permitir» | `denied` | normalmente `false` tras el segundo rechazo | Sí |
| 4 | Solicitar de nuevo después del bloqueo | `denied` | `false` | No |
| 5 | `Linking.openSettings()`, habilitar y volver | `granted` después de refrescar | — | No |
| 6 | No refrescar al volver de Ajustes | La app conserva una respuesta anterior obsoleta | — | No |

La secuencia exacta de `canAskAgain` puede variar con versión y estado previo; el código debe leer la respuesta, no asumirla. En iOS, rechazar la primera vez generalmente bloquea otra presentación del diálogo; «Permitir una vez» da acceso temporal y el estado debe consultarse otra vez cuando la app vuelva a primer plano o se inicie de nuevo.

### D5. Configuración de `app.json`

Configuración principal implementada en este repositorio:

```json
{
  "expo": {
    "android": {
      "permissions": ["android.permission.POST_NOTIFICATIONS"],
      "blockedPermissions": [
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.RECORD_AUDIO",
        "android.permission.READ_MEDIA_IMAGES"
      ]
    },
    "plugins": [
      ["expo-camera", {
        "cameraPermission": "Usamos la cámara para leer el QR del aula o fotografiar un desperfecto.",
        "microphonePermission": false,
        "recordAudioAndroid": false
      }],
      ["expo-location", {
        "locationWhenInUsePermission": "Usamos tu ubicación mientras la app está abierta para marcar dónde está el desperfecto."
      }],
      ["expo-image-picker", {
        "photosPermission": false
      }],
      "expo-notifications"
    ]
  }
}
```

`expo-camera` agrega `RECORD_AUDIO` por defecto porque también puede grabar video con sonido. Esta app no graba audio; desactiva `recordAudioAndroid` y el texto de micrófono para iOS. La selección de galería se hace con el selector del sistema, así que no se declara lectura general de fotos. `blockedPermissions` quita permisos heredados que no se necesitan.

### D6. Expo Go no es tu app

**a)** Expo Go tiene su propio manifiesto y `Info.plist`; por eso los textos y permisos de `app.json` no se aplican al diálogo de Expo Go.  
**b)** Expo Go sirve para probar navegación, estados, solicitudes y alternativas cuando el permiso ya existe en Expo Go. Se necesita una development build propia para validar los textos, la lista real de permisos, capacidades nativas y comportamiento final. Notificaciones push en Android no funcionan en Expo Go desde SDK 53; este proyecto usa notificaciones locales.  
**c)** Para Android se genera el proyecto con `npx expo prebuild --platform android` y se compila con `npx expo run:android` (requiere Android Studio/SDK). Para iOS se usa `npx expo prebuild --platform ios` y Xcode en macOS.  
**d)** En Android, desinstalar y reinstalar es el método sencillo; para revocar ubicación con ADB: `adb shell pm revoke ar.edu.ipf.mantenimiento android.permission.ACCESS_FINE_LOCATION`. En simulador iOS: `xcrun simctl privacy booted reset location ar.edu.ipf.mantenimiento`.

## Parte E · Recetas: leer y corregir código

### E1. Encontrá los errores (cámara)

Problemas: `permiso` puede ser `null` durante la consulta inicial; el permiso no se debe pedir antes de una explicación; falta distinguir denegación recuperable de bloqueo; el diseño no ofrece una alternativa manual; la interfaz del ejemplo no contempla error de cámara. Una versión correcta del flujo:

```tsx
import { ActivityIndicator, Button, Linking, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const [permission, requestPermission] = useCameraPermissions();

if (!permission) return <ActivityIndicator />;

if (permission.granted) {
  return <CameraView style={{ flex: 1 }} facing="back" />;
}

const blocked = !permission.canAskAgain;

return (
  <View>
    <Text>Usamos la cámara para leer el QR del aula.</Text>
    <Button
      title={blocked ? 'Abrir Ajustes' : 'Continuar'}
      onPress={async () => {
        if (blocked) {
          await Linking.openSettings();
          return;
        }
        await requestPermission();
      }}
    />
    <Button title="Escribir el aula" onPress={abrirIngresoManual} />
  </View>
);
```

La build propia no debe pedir micrófono si no graba sonido: `microphonePermission: false` y `recordAudioAndroid: false`.

### E2. El orden importa (ubicación)

**a)** La función solicita ubicación en segundo plano antes de primer plano y luego pide primer plano de todos modos. Android 11+ restringe el flujo de background y puede enviarlo a Ajustes; en iOS el acceso «Siempre» es gradual.  
**b)** Primero solicitar solo `requestForegroundPermissionsAsync()`, después verificar `granted`; pedir background únicamente si una función explícita realmente necesita funcionar cuando la app no está visible.  
**c)** Un helper no debe lanzar una excepción ni romper el reporte si se deniega:

```ts
async function obtenerUbicacion() {
  const permiso = await Location.getForegroundPermissionsAsync();
  if (!permiso.granted) return null;

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      approximate: true,
    };
  } catch (error) {
    console.error('No se pudo obtener la ubicación:', error);
    return null;
  }
}
```

La pantalla muestra «ubicación aproximada» o el sector, no coordenadas exactas cuando la precisión es reducida.

**d)** Sí, si se solicita segundo plano para «farmacias cercanas» está de más: basta una consulta foreground al abrir esa función. Google Play exige justificar el uso de ubicación en segundo plano y puede requerir declaración/revisión; la función central debe necesitarla de verdad.

### E3. Notificaciones mudas

En Android 8+ hay que crear primero un canal de notificaciones (por ejemplo, `reportes`) y luego, cuando la persona active el interruptor, pedir `POST_NOTIFICATIONS` si corresponde. También se consulta el estado actual antes de programar. Si se deniega, el reporte y la bandeja interna siguen funcionando; no se vuelve a pedir en cada pantalla.

### E4. Fotos sin pedir permiso general

| Necesidad | Herramienta | Permiso |
|---|---|---|
| Elegir una foto de perfil | Selector del sistema / `ImagePicker.launchImageLibraryAsync()` | Ningún permiso amplio de galería; el sistema comparte la foto seleccionada. |
| Sacar una foto en el momento | `expo-camera` | Cámara al iniciar la captura; no micrófono si no se graba audio. |
| Editor que explora toda la galería | API de biblioteca de medios del módulo | Permiso de lectura solo al abrir esa función; aceptar selección limitada cuando exista. |
| Adjuntar la foto de un comprobante | Photo Picker / selector del sistema | No pedir `READ_MEDIA_IMAGES` para una única imagen. |

Google Play restringe `READ_MEDIA_IMAGES` y `READ_MEDIA_VIDEO` a funciones principales que necesiten acceso frecuente y amplio; una selección puntual debe usar el Photo Picker. El «mejor permiso» es no solicitar ninguno cuando un selector del sistema resuelve la tarea.

### E5. Volver de Ajustes

La consulta de permisos de Expo no se actualiza por sí sola porque la persona cambie un ajuste fuera de la app. El hook registra `AppState` y, al pasar de `background`/`inactive` a `active`, vuelve a consultar el estado. Una función puede reutilizar este hook para refrescar su interfaz sin guardar un valor global obsoleto.

```tsx
useEffect(() => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') void consultarPermiso();
  });
  return () => subscription.remove();
}, [consultarPermiso]);
```

## Parte F · Buenas prácticas y tiendas

### F1. Pedir en contexto

| App y permiso | ¿Cuándo pedirlo? | Alternativa si se deniega |
|---|---|---|
| Red social · contactos | Cuando la persona toca «Buscar amistades en contactos». | Buscar por nombre/usuario o invitar compartiendo un enlace. |
| Mensajería · micrófono | Al tocar «Grabar audio» por primera vez, con explicación previa. | Enviar texto o adjuntar un audio ya existente mediante selector. |
| Turnos médicos · notificaciones | Al activar «Avisarme de mis turnos», no al abrir la app. | Mostrar los turnos en la pantalla y en la bandeja interna. |
| Editor de fotos · biblioteca completa | Al abrir explícitamente «Explorar toda la galería», si el selector puntual no alcanza. | Elegir fotos individuales con el Photo Picker. |

Pedir los cuatro permisos al iniciar entrena a aceptar sin entender y genera rechazos; además, cada permiso debe tener un motivo funcional en ese momento.

### F2. La pantalla previa

**a)** Debe incluir: beneficio concreto para la persona; qué recurso/dato se usará y cuándo; una acción clara **«Continuar»** que recién entonces invoca la solicitud del sistema.  
**b)** «Continuar» confirma que quiere abrir el diálogo; no suplanta a «Permitir». Si cancela o rechaza, se respeta la respuesta y se mantiene alternativa.  
**c)** La pauta de Apple 5.1.1 exige un texto informativo completo y claro, no «Ahora no», presión o un diálogo propio que imite al sistema.  
**d)** Si el permiso ya está bloqueado, no se ofrece otra solicitud inútil: se explica la configuración en Ajustes y se mantiene la alternativa.

### F3. Mínimo privilegio

**a)** Ubicación **aproximada y en primer plano** para puntos de reciclaje del barrio: alcanza con conocer la zona.  
**b)** Para registrar una carrera con el teléfono en el bolsillo y la app no visible, el requisito podría necesitar background; primero se prueba foreground y solo se solicita «siempre» en una segunda etapa claramente explicada. Si la app registra solo mientras está abierta, usar «en uso».  
**c)** Selector del sistema / Photo Picker para elegir la foto del DNI; acceso limitado a ese elemento, nunca permiso amplio para leer toda la galería.  
**d)** `expo-camera` con el micrófono deshabilitado para escanear un QR: escaneo no necesita grabación de audio.

### F4. Tiendas

**a)** Google Play: cumplir la política de permisos/acceso a fotos y video, pedir solo permisos necesarios y completar divulgaciones/seguridad de datos. App Store: entregar textos de propósito veraces y completos para APIs protegidas y declaraciones de privacidad requeridas. En ambas tiendas se debe probar una build propia y explicar el uso.  
**b)** `PrivacyInfo.xcprivacy` es el manifiesto de privacidad de Apple: declara prácticas de privacidad, dominios/uso de datos y uso de APIs que requieren motivo. En Expo se configura en `ios.privacyManifests` de `app.json`/`app.config.ts` y se revisan los manifiestos que generan los SDKs/plugins.  
**c)** Android 17 incorpora una experiencia de selector de contactos de acceso puntual para compartir contactos sin conceder la agenda completa. La política citada por el enunciado exige, desde el 27/01/2027, justificar el uso de `READ_CONTACTS` ante Google Play: conservar el permiso amplio solo si el acceso a toda la agenda es una función principal; de lo contrario migrar al selector y a la selección explícita.

### F5. Errores comunes

**a) Xcode: “This app has crashed because it attempted to access privacy-sensitive data without a usage description.”**  
Falta la clave de propósito correspondiente en `Info.plist`. Configurar un texto concreto en el plugin o `ios.infoPlist`, comprobar dependencias que usen la API, y generar una build nueva.

**b) “En Expo Go anda, en la build no.”**  
Expo Go tiene permisos y textos propios, mientras la build propia se genera desde `app.json`. Crear/reinstalar una development build y probar allí los diálogos, capacidades y textos reales.

**c) “Android deniega el permiso sin mostrar diálogo.”**  
El permiso no está declarado en el manifiesto generado o está bloqueado por `blockedPermissions`. Corregir la configuración/plugin en `app.json`, regenerar y compilar; no parchear a mano el archivo generado.

## Fuentes y criterios de implementación

- Presentación de clase `index (1).html`: sandbox, ciclo de permisos, mínimo privilegio, Android/iOS y patrones Expo.
- Aplicación: consultar [README.md](./README.md) para estructura y pruebas manuales.
- La actividad G (rutas, requisitos funcionales y técnicos) se implementa en `src/app`, `src/hooks/usePermiso.ts`, `app.json` y `src/context/AppContext.tsx`.
