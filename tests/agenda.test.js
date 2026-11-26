const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const path = require('path');
const { pathToFileURL } = require('url');

// para abrir en index.html
const APP_URL = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;

// Pausa (ms) : $env:SLOW=1500; npm test
const SLOW = parseInt(process.env.SLOW || '600', 10);
const HEADLESS = process.env.HEADLESS === 'true';

// Imagen embebida.
const PIC =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';

describe('Agenda - Pruebas CRUD con Selenium WebDriver', function () {
  let driver;

  const pause = () => driver.sleep(SLOW);

  /// Helpers 
  async function fillForm({ name, phone, picture = PIC, type }) {
    for (const [id, value] of [['name', name], ['phone', phone], ['picture', picture]]) {
      const el = await driver.findElement(By.id(id));
      await el.clear();
      await el.sendKeys(value);
    }
    if (type) {
      await driver.findElement(By.css(`#contact-type option[value="${type}"]`)).click();
    }
    await pause();
  }

  async function clickSave() {
    await driver.findElement(By.id('save-button')).click();
    await pause();
  }

  async function addContact(data) {
    await fillForm(data);
    await clickSave();
  }

  async function getCards() {
    return driver.findElements(By.css('#contact-container .card'));
  }

  async function findCardByName(name) {
    const cards = await getCards();
    for (const card of cards) {
      const title = await card.findElement(By.css('.card-title')).getText();
      if (title === name) return card;
    }
    return null;
  }

  async function acceptAlert() {
    const alert = await driver.wait(until.alertIsPresent(), 3000);
    const text = await alert.getText();
    await pause();
    await alert.accept();
    return text;
  }

  //Ciclo de vida 
  before(async function () {
    const options = new chrome.Options();
    options.addArguments('--window-size=1280,900', '--no-sandbox', '--disable-dev-shm-usage');
    if (HEADLESS) options.addArguments('--headless=new');
    if (process.env.CHROME_BIN) options.setChromeBinaryPath(process.env.CHROME_BIN);

    const builder = new Builder().forBrowser('chrome').setChromeOptions(options);
    if (process.env.CHROMEDRIVER_PATH) {
      builder.setChromeService(new chrome.ServiceBuilder(process.env.CHROMEDRIVER_PATH));
    }
    driver = await builder.build();
  });

  beforeEach(async function () {
    await driver.get(APP_URL);
    await driver.wait(until.elementLocated(By.id('name')), 5000);
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  /// Pruebas - aqui viene el mambo.. no se si funciona pero con Dios ahi va.
  describe('Carga inicial', function () {
    it('muestra el titulo, el formulario y la lista vacia', async function () {
      assert.strictEqual(await driver.getTitle(), 'Agenda');
      assert.ok(await driver.findElement(By.id('name')).isDisplayed());
      assert.ok(await driver.findElement(By.id('phone')).isDisplayed());
      assert.ok(await driver.findElement(By.id('picture')).isDisplayed());
      assert.ok(await driver.findElement(By.id('contact-type')).isDisplayed());
      assert.strictEqual((await getCards()).length, 0);
    });
  });

  describe('CREATE - crear contactos', function () {
    it('crea un contacto valido y lo muestra en la lista', async function () {
      await addContact({ name: 'Maria Perez', phone: '809-555-1234', type: 'Office' });

      const cards = await getCards();
      assert.strictEqual(cards.length, 1);

      const card = await findCardByName('Maria Perez');
      assert.ok(card, 'No se encontro la tarjeta de Maria Perez');
      const items = await card.findElements(By.css('.list-group-item'));
      assert.strictEqual(await items[0].getText(), 'phone: 809-555-1234');
      assert.strictEqual(await items[1].getText(), 'contact type: Office');
    });

    it('limpia el formulario despues de guardar', async function () {
      await addContact({ name: 'Juan Diaz', phone: '829-555-0000', type: 'Casual' });

      assert.strictEqual(await driver.findElement(By.id('name')).getAttribute('value'), '');
      assert.strictEqual(await driver.findElement(By.id('phone')).getAttribute('value'), '');
      assert.strictEqual(await driver.findElement(By.id('picture')).getAttribute('value'), '');
      assert.strictEqual(await driver.findElement(By.id('contact-type')).getAttribute('value'), '');
    });

    it('muestra alerta y marca los campos en rojo si el formulario esta vacio', async function () {
      await clickSave();
      const text = await acceptAlert();

      assert.strictEqual(text, 'All fields are required.');
      assert.strictEqual((await getCards()).length, 0);

      const nameClasses = await driver.findElement(By.id('name')).getAttribute('class');
      assert.ok(nameClasses.includes('input-error'), 'El campo name deberia tener input-error');
    });

    it('no crea el contacto si falta el tipo de contacto', async function () {
      await fillForm({ name: 'Sin Tipo', phone: '809-000-0000' });
      await clickSave();
      await acceptAlert();

      assert.strictEqual((await getCards()).length, 0);
      const typeClasses = await driver.findElement(By.id('contact-type')).getAttribute('class');
      assert.ok(typeClasses.includes('input-error'));
    });

    it('marca en verde los campos validos al fallar la validacion', async function () {
      await fillForm({ name: 'Solo Nombre', phone: '' });
      await clickSave();
      await acceptAlert();

      const nameClasses = await driver.findElement(By.id('name')).getAttribute('class');
      const phoneClasses = await driver.findElement(By.id('phone')).getAttribute('class');
      assert.ok(nameClasses.includes('input-success'));
      assert.ok(phoneClasses.includes('input-error'));
    });

    it('el boton Clear vacia el formulario', async function () {
      await fillForm({ name: 'Temporal', phone: '111', type: 'Academy' });
      await driver.findElement(By.id('clear-button')).click();
      await pause();

      assert.strictEqual(await driver.findElement(By.id('name')).getAttribute('value'), '');
      assert.strictEqual(await driver.findElement(By.id('phone')).getAttribute('value'), '');
      assert.strictEqual(await driver.findElement(By.id('contact-type')).getAttribute('value'), '');
    });
  });

  describe('READ - leer / listar contactos', function () {
    it('muestra todos los contactos creados con sus datos', async function () {
      await addContact({ name: 'Ana Lopez', phone: '809-111-1111', type: 'Academy' });
      await addContact({ name: 'Luis Gomez', phone: '809-222-2222', type: 'Casual' });
      await addContact({ name: 'Carla Ruiz', phone: '809-333-3333', type: 'Office' });

      assert.strictEqual((await getCards()).length, 3);

      const luis = await findCardByName('Luis Gomez');
      assert.ok(luis);
      const items = await luis.findElements(By.css('.list-group-item'));
      assert.strictEqual(await items[0].getText(), 'phone: 809-222-2222');
      assert.strictEqual(await items[1].getText(), 'contact type: Casual');
    });

    it('la imagen de la tarjeta usa el nombre como texto alternativo', async function () {
      await addContact({ name: 'Pedro Mena', phone: '809-444-4444', type: 'Casual' });
      const card = await findCardByName('Pedro Mena');
      const img = await card.findElement(By.css('img.card-img-top'));
      assert.strictEqual(await img.getAttribute('alt'), 'Pedro Mena');
    });
  });

  describe('UPDATE - editar contactos', function () {
    it('carga los datos del contacto en el formulario al pulsar Edit', async function () {
      await addContact({ name: 'Rosa Vega', phone: '809-555-9999', type: 'Office' });
      const card = await findCardByName('Rosa Vega');
      await card.findElement(By.css('.edit-button')).click();
      await pause();

      assert.strictEqual(await driver.findElement(By.id('name')).getAttribute('value'), 'Rosa Vega');
      assert.strictEqual(await driver.findElement(By.id('phone')).getAttribute('value'), '809-555-9999');
      assert.strictEqual(await driver.findElement(By.id('contact-type')).getAttribute('value'), 'Office');
      assert.strictEqual(await driver.findElement(By.id('save-button')).getText(), 'Update');
    });

    it('actualiza los datos de la tarjeta sin crear una nueva', async function () {
      await addContact({ name: 'Marcos Cruz', phone: '809-100-2000', type: 'Casual' });
      const card = await findCardByName('Marcos Cruz');
      await card.findElement(By.css('.edit-button')).click();
      await pause();

      await fillForm({ name: 'Marcos Cruz Jr', phone: '809-999-8888', type: 'Academy' });
      await clickSave();

      assert.strictEqual((await getCards()).length, 1, 'No debe crear una tarjeta nueva');
      assert.strictEqual(await findCardByName('Marcos Cruz'), null);

      const updated = await findCardByName('Marcos Cruz Jr');
      assert.ok(updated, 'No se encontro la tarjeta actualizada');
      const items = await updated.findElements(By.css('.list-group-item'));
      assert.strictEqual(await items[0].getText(), 'phone: 809-999-8888');
      assert.strictEqual(await items[1].getText(), 'contact type: Academy');
      assert.strictEqual(await driver.findElement(By.id('save-button')).getText(), 'Save');
    });
  });

  describe('DELETE - eliminar contactos', function () {
    it('elimina el contacto al confirmar', async function () {
      await addContact({ name: 'Borrar Uno', phone: '809-000-1111', type: 'Casual' });
      await addContact({ name: 'Mantener Dos', phone: '809-000-2222', type: 'Office' });

      const card = await findCardByName('Borrar Uno');
      await card.findElement(By.css('.btn-outline-danger')).click();

      const alert = await driver.wait(until.alertIsPresent(), 3000);
      assert.strictEqual(await alert.getText(), 'Are you sure you want to delete this contact?');
      await pause();
      await alert.accept();
      await pause();

      assert.strictEqual((await getCards()).length, 1);
      assert.strictEqual(await findCardByName('Borrar Uno'), null);
      assert.ok(await findCardByName('Mantener Dos'));
    });

    it('conserva el contacto si se cancela la confirmacion', async function () {
      await addContact({ name: 'No Borrar', phone: '809-000-3333', type: 'Academy' });

      const card = await findCardByName('No Borrar');
      await card.findElement(By.css('.btn-outline-danger')).click();

      const alert = await driver.wait(until.alertIsPresent(), 3000);
      await pause();
      await alert.dismiss();
      await pause();

      assert.strictEqual((await getCards()).length, 1);
      assert.ok(await findCardByName('No Borrar'));
    });
  });

  describe('Flujo completo CRUD', function () {
    it('crea, lee, edita y elimina un contacto de principio a fin', async function () {
      // Create
      await addContact({ name: 'Flujo Completo', phone: '809-777-7777', type: 'Casual' });
      let card = await findCardByName('Flujo Completo');
      assert.ok(card, 'Create fallo');

      // Read
      const items = await card.findElements(By.css('.list-group-item'));
      assert.strictEqual(await items[0].getText(), 'phone: 809-777-7777');

      // Update
      await card.findElement(By.css('.edit-button')).click();
      await fillForm({ name: 'Flujo Editado', phone: '809-888-8888', type: 'Office' });
      await clickSave();
      card = await findCardByName('Flujo Editado');
      assert.ok(card, 'Update fallo');

      // Delete
      await card.findElement(By.css('.btn-outline-danger')).click();
      const alert = await driver.wait(until.alertIsPresent(), 3000);
      await alert.accept();
      await pause();
      assert.strictEqual((await getCards()).length, 0, 'Delete fallo');
    });
  });
});
