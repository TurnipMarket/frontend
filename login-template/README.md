# Plantilla de Login — Contactos Verificados

Página de login en React (Vite), **sin backend**. Arma el JSON que se enviaría
en el login y lo muestra en pantalla, para que puedas probar toda la UI y
después enchufar el backend real cambiando una sola variable.

## Correr en local

```bash
npm install
npm run dev
```

Abrí `http://localhost:5173`.

## Exponerlo con ngrok (uso público temporal)

1. Corré el servidor de desarrollo (`npm run dev`) — ya está configurado
   para escuchar en todas las interfaces (`host: true` en `vite.config.js`),
   que es lo que ngrok necesita.
2. En otra terminal:
   ```bash
   ngrok http 5173
   ```
3. Ngrok te va a dar una URL tipo `https://xxxx.ngrok-free.app`. Abrila y
   la página va a andar igual que en local.

> Nota técnica: Vite por defecto rechaza requests que llegan con un `Host`
> desconocido (protección anti-DNS-rebinding). Ya está resuelto en este
> proyecto con `allowedHosts: true` en `vite.config.js`. Si preferís
> restringirlo a un dominio fijo, reemplazá `true` por el array con tu
> dominio de ngrok.

## Cómo está armado (para editarlo fácil)

```
src/
├─ config.js              ← Configuración central: URL del backend,
│                            modo mock on/off, lista de botones de login social.
│                            Es lo primero que vas a tocar.
├─ lib/
│  └─ authClient.js        ← Arma el JSON del login. Si MOCK_MODE=true, simula
│                            la respuesta. Si es false, hace fetch real al
│                            backend. No hace falta tocar la UI para el cambio.
├─ components/
│  └─ SealMark.jsx         ← El logo/sello SVG de la marca.
├─ pages/
│  ├─ LoginPage.jsx         ← El formulario y toda la lógica de estado.
│  └─ LoginPage.css         ← Estilos de esta página.
└─ styles/
   └─ tokens.css            ← Paleta de colores, tipografías y variables
                              globales (CSS variables). Cambiá esto para
                              re-tematizar toda la página desde un solo lugar.
```

## Conectar el backend real (cuando lo tengas)

1. Copiá `.env.example` a `.env.local`.
2. Completá:
   ```
   VITE_API_BASE_URL=https://tu-backend.com
   VITE_MOCK_MODE=false
   ```
3. Reiniciá `npm run dev`. El formulario ahora va a hacer
   `POST {VITE_API_BASE_URL}/api/auth/login` con el mismo JSON que ya
   estabas viendo en el panel de debug. Podés cambiar el endpoint en
   `src/config.js` (`LOGIN_ENDPOINT`).

El JSON que se envía tiene esta forma:

```json
{
  "identifier": "usuario@ejemplo.com",
  "password": "********",
  "remember": false,
  "client": {
    "origin": "http://localhost:5173",
    "timestamp": "2026-08-14T20:00:00.000Z"
  }
}
```

## Qué NO incluye esta plantilla (a propósito)

- No hay conexión real a base de datos ni backend.
- No hay pasarela de pago ni nada relacionado — eso nunca va a vivir en
  el frontend, según el alcance del proyecto (ver `PROYECTO.md`).
- Los botones de "Discord" / "SMS" son placeholders visuales: solo
  muestran un mensaje, no ejecutan OAuth ni envían SMS todavía.

## Editar el tema visual

Todo el color y tipografía sale de `src/styles/tokens.css`. Por ejemplo,
para cambiar el color de acento dorado por otro:

```css
:root {
  --gold: #c9a227; /* cambiá este valor */
}
```

No hace falta tocar ningún componente.
