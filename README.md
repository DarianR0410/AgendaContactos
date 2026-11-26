# Agenda + Pruebas automatizadas con Selenium WebDriver

Aplicación web de agenda de contactos (HTML + Bootstrap + JavaScript) con pruebas
automatizadas escritas en **JavaScript** usando **Selenium WebDriver**
(`selenium-webdriver`) y **Mocha**. No se usa Selenium IDE.

## La aplicación

Formulario para gestionar contactos (nombre, teléfono, URL de foto y tipo de contacto):

| Operación | Cómo se hace en la app |
|-----------|------------------------|
| **Create** | Llenar el formulario y pulsar **Save** |
| **Read**   | Los contactos se muestran como tarjetas en la lista |
| **Update** | Botón **Edit** en la tarjeta: carga los datos en el formulario; el botón pasa a **Update** |
| **Delete** | Botón **Delete** en la tarjeta (pide confirmación) |

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- Google Chrome instalado (Selenium Manager descarga el ChromeDriver compatible automáticamente)

## Instalación

```bash
npm install
```

## Ejecutar las pruebas

```bash
npm test                 # con el navegador visible (ideal para el video)
SLOW=1200 npm test       # pausas más largas entre acciones (milisegundos)
npm run test:headless    # sin abrir ventana
```

En Windows (PowerShell):

```powershell
$env:SLOW=1200; npm test
```

Las pruebas abren `index.html` directamente, no hace falta levantar un servidor.

## Casos de prueba (`tests/agenda.test.js`)

| Grupo | Caso |
|-------|------|
| Carga inicial | Muestra título, formulario y lista vacía |
| CREATE | Crea un contacto válido y aparece en la lista |
| CREATE | El formulario se limpia después de guardar |
| CREATE | Formulario vacío: alerta `All fields are required.` y campos en rojo |
| CREATE | No crea el contacto si falta el tipo de contacto |
| CREATE | Campos válidos se marcan en verde y los vacíos en rojo |
| CREATE | El botón **Clear** vacía el formulario |
| READ | Muestra varios contactos con teléfono y tipo correctos |
| READ | La imagen usa el nombre como texto alternativo |
| UPDATE | **Edit** carga los datos en el formulario |
| UPDATE | Actualiza la tarjeta existente sin crear una nueva |
| DELETE | Elimina el contacto al confirmar |
| DELETE | Conserva el contacto si se cancela la confirmación |
| Flujo completo | Crear → leer → editar → eliminar en una sola prueba |

## Estructura

```
.
├── index.html
├── assets/              # Bootstrap, CSS y JS de la app
├── tests/
│   └── agenda.test.js   # Pruebas Selenium
├── package.json
└── README.md
```

## Notas técnicas

- Los elementos se localizan por `id` (`name`, `phone`, `picture`, `contact-type`,
  `save-button`, `clear-button`) y por clase (`.card`, `.card-title`, `.edit-button`,
  `.btn-outline-danger`).
- Las alertas y confirmaciones del navegador se manejan con la API de
  `driver.switchTo().alert()` / `until.alertIsPresent()`.
- Variables opcionales: `SLOW` (pausa entre acciones), `HEADLESS=true`.
# AgendaContactos 
