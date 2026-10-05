(() => {
  const apiBaseUrl = 'http://localhost:5159/api/Auth';
  const form = document.querySelector('[data-guest-registration]');
  if (!form) return;

  const countrySelect = form.elements.namedItem('countryId');
  const documentTypeSelect = form.elements.namedItem('documentType');
  const documentNumberField = form.querySelector('[data-document-number-field]');
  const documentNumberInput = form.elements.namedItem('documentNumber');
  const documentNumberLabel = form.querySelector('label[for="guest-document-number"]');
  const feedback = form.querySelector('.auth-feedback');
  const submitButton = form.querySelector('button[type="submit"]');

  const countryCodes = {
    Afghanistan: 'AF', Albania: 'AL', Algeria: 'DZ', Andorra: 'AD', Angola: 'AO',
    'Antigua and Barbuda': 'AG', Argentina: 'AR', Armenia: 'AM', Australia: 'AU',
    Austria: 'AT', Azerbaijan: 'AZ', Bahamas: 'BS', Bahrain: 'BH', Bangladesh: 'BD',
    Barbados: 'BB', Belarus: 'BY', Belgium: 'BE', Belize: 'BZ', Benin: 'BJ',
    Bhutan: 'BT', Bolivia: 'BO', 'Bosnia and Herzegovina': 'BA', Botswana: 'BW',
    Brazil: 'BR', Brunei: 'BN', Bulgaria: 'BG', 'Burkina Faso': 'BF', Burundi: 'BI',
    'Cabo Verde': 'CV', Cambodia: 'KH', Cameroon: 'CM', Canada: 'CA',
    'Central African Republic': 'CF', Chad: 'TD', Chile: 'CL', China: 'CN',
    Colombia: 'CO', Comoros: 'KM', Congo: 'CG', 'Costa Rica': 'CR',
    "Cote d'Ivoire": 'CI', Croatia: 'HR', Cuba: 'CU', Cyprus: 'CY', Czechia: 'CZ',
    'Democratic Republic of the Congo': 'CD', Denmark: 'DK', Djibouti: 'DJ',
    Dominica: 'DM', 'Dominican Republic': 'DO', Ecuador: 'EC', Egypt: 'EG',
    'El Salvador': 'SV', 'Equatorial Guinea': 'GQ', Eritrea: 'ER', Estonia: 'EE',
    Eswatini: 'SZ', Ethiopia: 'ET', Fiji: 'FJ', Finland: 'FI', France: 'FR',
    Gabon: 'GA', Gambia: 'GM', Georgia: 'GE', Germany: 'DE', Ghana: 'GH',
    Greece: 'GR', Grenada: 'GD', Guatemala: 'GT', Guinea: 'GN',
    'Guinea-Bissau': 'GW', Guyana: 'GY', Haiti: 'HT', Honduras: 'HN',
    Hungary: 'HU', Iceland: 'IS', India: 'IN', Indonesia: 'ID', Iran: 'IR',
    Iraq: 'IQ', Ireland: 'IE', Israel: 'IL', Italy: 'IT', Jamaica: 'JM',
    Japan: 'JP', Jordan: 'JO', Kazakhstan: 'KZ', Kenya: 'KE', Kiribati: 'KI',
    Kuwait: 'KW', Kyrgyzstan: 'KG', Laos: 'LA', Latvia: 'LV', Lebanon: 'LB',
    Lesotho: 'LS', Liberia: 'LR', Libya: 'LY', Liechtenstein: 'LI',
    Lithuania: 'LT', Luxembourg: 'LU', Madagascar: 'MG', Malawi: 'MW',
    Malaysia: 'MY', Maldives: 'MV', Mali: 'ML', Malta: 'MT',
    'Marshall Islands': 'MH', Mauritania: 'MR', Mauritius: 'MU', Mexico: 'MX',
    Micronesia: 'FM', Moldova: 'MD', Monaco: 'MC', Mongolia: 'MN',
    Montenegro: 'ME', Morocco: 'MA', Mozambique: 'MZ', Myanmar: 'MM',
    Namibia: 'NA', Nauru: 'NR', Nepal: 'NP', Netherlands: 'NL',
    'New Zealand': 'NZ', Nicaragua: 'NI', Niger: 'NE', Nigeria: 'NG',
    'North Korea': 'KP', 'North Macedonia': 'MK', Norway: 'NO', Oman: 'OM',
    Pakistan: 'PK', Palau: 'PW', Palestine: 'PS', Panama: 'PA',
    'Papua New Guinea': 'PG', Paraguay: 'PY', Peru: 'PE', Philippines: 'PH',
    Poland: 'PL', Portugal: 'PT', Qatar: 'QA', Romania: 'RO', Russia: 'RU',
    Rwanda: 'RW', 'Saint Kitts and Nevis': 'KN', 'Saint Lucia': 'LC',
    'Saint Vincent and the Grenadines': 'VC', Samoa: 'WS', 'San Marino': 'SM',
    'Sao Tome and Principe': 'ST', 'Saudi Arabia': 'SA', Senegal: 'SN',
    Serbia: 'RS', Seychelles: 'SC', 'Sierra Leone': 'SL', Singapore: 'SG',
    Slovakia: 'SK', Slovenia: 'SI', 'Solomon Islands': 'SB', Somalia: 'SO',
    'South Africa': 'ZA', 'South Korea': 'KR', 'South Sudan': 'SS', Spain: 'ES',
    'Sri Lanka': 'LK', Sudan: 'SD', Suriname: 'SR', Sweden: 'SE',
    Switzerland: 'CH', Syria: 'SY', Tajikistan: 'TJ', Tanzania: 'TZ',
    Thailand: 'TH', 'Timor-Leste': 'TL', Togo: 'TG', Tonga: 'TO',
    'Trinidad and Tobago': 'TT', Tunisia: 'TN', Turkiye: 'TR',
    Turkmenistan: 'TM', Tuvalu: 'TV', Uganda: 'UG', Ukraine: 'UA',
    'United Arab Emirates': 'AE', 'United Kingdom': 'GB', 'United States': 'US',
    Uruguay: 'UY', Uzbekistan: 'UZ', Vanuatu: 'VU', 'Vatican City': 'VA',
    Venezuela: 'VE', Vietnam: 'VN', Yemen: 'YE', Zambia: 'ZM', Zimbabwe: 'ZW'
  };

  documentTypeSelect.addEventListener('change', updateDocumentField);
  window.addEventListener('hostel-language-change', updateDocumentField);
  form.addEventListener('reset', () => window.setTimeout(updateDocumentField));
  updateDocumentField();
  loadCountries();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.hidden = true;

    const isSpanish = document.documentElement.lang === 'es';
    const password = form.elements.namedItem('password').value;
    const confirmPassword = form.elements.namedItem('confirmPassword').value;
    const documentNumber = documentNumberInput.value.trim();
    const documentType = documentTypeSelect.value;

    if (password !== confirmPassword) {
      showFeedback(isSpanish ? 'Las contraseñas no coinciden.' : 'Passwords do not match.', 'error');
      return;
    }

    if (!documentType || !documentNumber) {
      showFeedback(isSpanish
        ? 'Selecciona el tipo de documento e introduce su número.'
        : 'Select a document type and enter its number.', 'error');
      return;
    }

    submitButton.disabled = true;
    try {
      const response = await fetch(`${apiBaseUrl}/RegisterGuest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.elements.namedItem('firstName').value.trim(),
          lastName: form.elements.namedItem('lastName').value.trim(),
          email: form.elements.namedItem('email').value.trim(),
          password,
          countryId: Number(countrySelect.value),
          dni: documentType === 'dni' ? documentNumber : null,
          passport: documentType === 'passport' ? documentNumber : null,
          phone: form.elements.namedItem('phone').value.trim() || null
        })
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, isSpanish));
      }

      showFeedback(isSpanish
        ? 'Cuenta creada. Ya puedes iniciar sesión.'
        : 'Account created. You can now sign in.', 'success');
      form.reset();
      countrySelect.value = '';
    } catch (error) {
      showFeedback(error instanceof TypeError
        ? (isSpanish
          ? 'No se pudo conectar con el servidor. Comprueba que la API esté en ejecución.'
          : 'Could not reach the server. Check that the API is running.')
        : error.message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  async function loadCountries() {
    const isSpanish = document.documentElement.lang === 'es';
    try {
      const response = await fetch(`${apiBaseUrl}/Countries`);
      if (!response.ok) throw new Error('Country list request failed.');
      const countries = await response.json();
      countrySelect.replaceChildren(new Option(
        isSpanish ? 'Selecciona tu país' : 'Select your country', ''));
      countries.forEach((country) => {
        const code = countryCodes[country.countryName];
        const flag = code && Array.from(code).map((letter) =>
          String.fromCodePoint(127397 + letter.charCodeAt(0))).join('');
        countrySelect.add(new Option(
          `${flag ? `${flag} ` : ''}${country.countryName}`,
          country.countryId));
      });
    } catch {
      countrySelect.replaceChildren(new Option(
        isSpanish ? 'No se pudieron cargar los países' : 'Could not load countries', ''));
      showFeedback(isSpanish
        ? 'No se pudo cargar la lista de países. Comprueba que la API esté disponible.'
        : 'Could not load the country list. Check that the API is available.', 'error');
    }
  }

  async function readErrorMessage(response, isSpanish) {
    if (response.status >= 500) {
      return isSpanish
        ? 'El servidor no pudo completar el registro.'
        : 'The server could not complete registration.';
    }

    const responseText = await response.text();
    try {
      const body = JSON.parse(responseText);
      return body.message || body.title || (typeof body === 'string' ? body : null)
        || (isSpanish ? 'No se pudo completar el registro.' : 'Registration failed.');
    } catch {
      return responseText || (isSpanish
        ? 'No se pudo completar el registro.'
        : 'Registration failed.');
    }
  }

  function showFeedback(message, state) {
    feedback.textContent = message;
    feedback.dataset.state = state;
    feedback.hidden = false;
  }

  function updateDocumentField() {
    const documentType = documentTypeSelect.value;
    const isSpanish = document.documentElement.lang === 'es';
    const selected = documentType === 'dni' || documentType === 'passport';
    documentNumberField.hidden = !selected;
    documentNumberInput.disabled = !selected;
    documentNumberInput.required = selected;

    if (documentType === 'dni') {
      documentNumberLabel.textContent = isSpanish ? 'DNI' : 'National ID (DNI)';
      documentNumberInput.placeholder = isSpanish ? 'Introduce tu DNI' : 'Enter your national ID';
    } else if (documentType === 'passport') {
      documentNumberLabel.textContent = isSpanish ? 'Pasaporte' : 'Passport';
      documentNumberInput.placeholder = isSpanish ? 'Introduce tu pasaporte' : 'Enter your passport number';
    } else {
      documentNumberInput.value = '';
      documentNumberInput.placeholder = '';
    }
  }
})();