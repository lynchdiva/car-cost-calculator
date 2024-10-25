'use strict';

const form = document.forms.calculator;

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const hasError = validateFields();

  if (hasError) return;

  const totalPrice = calculatePrice();

  showTotalPrice(totalPrice);

  hideError('submit');
});

const brandSelector = form.elements.brand;
const modelSelector = form.elements.model;
const modelOptions = modelSelector.querySelectorAll('option');

brandSelector.addEventListener('change', makeModelsAvailable);

function makeModelsAvailable() {
  //способ для обхода бага в Safari для скрытие option без использования hidden и display: none;
  const brandSelector = form.elements.brand;
  const brand = brandSelector.value;

  modelSelector.disabled = !brand;

  modelSelector.innerHTML =
    '<option value="" selected disabled hidden>Выбрать модель</option>';

  modelOptions.forEach(option => {
    if (option.className === brand) {
      modelSelector.append(option);
    }
  });

  modelSelector.value = '';
}

const fuelCheckboxes = form.elements['fuel-types'].querySelectorAll('input');
const paymentsCheckboxes = form.elements.payments.querySelectorAll('input');

changeCheckboxesBehavior(fuelCheckboxes);
changeCheckboxesBehavior(paymentsCheckboxes);

const stateRadioButtons = form.querySelectorAll('[name="state"]');

stateRadioButtons.forEach(button =>
  button.addEventListener('change', showAdditionalControls)
);

stateRadioButtons.forEach(button =>
  button.addEventListener('change', editError)
);

const resetButton = form.querySelector('.form__reset');

resetButton.addEventListener('click', function () {
  const paragraph = document.querySelector('.total-price');
  const span = document.getElementById('total');
  const ownersContainer = form.querySelector('.form__owner-container');

  paragraph.classList.remove('total-price_visible');
  ownersContainer.hidden = true;
  span.textContent = '';

  hideError('reset');

  form.reset();
});

const runInput = form.elements.run;
runInput.addEventListener('input', function () {
  if (runInput.value.length > 6) {
    runInput.value = runInput.value.slice(0, 6);
  }
});

function calculatePrice() {
  const modelPrice = +form.elements.model.value;

  if (!modelPrice) return;

  let totalPrice = modelPrice;

  const getValue = list => Array.from(list).find(item => item.checked)?.value;

  const fuelCheckboxes = form.elements['fuel-types'].querySelectorAll('input');
  const ownersRadioButtons = form.querySelectorAll('[name="owners"]');

  const engineVolume = +form.elements.engine.value;
  const fuelFactor = +getValue(fuelCheckboxes);
  const carState = getValue(stateRadioButtons);

  if (fuelFactor) {
    totalPrice = totalPrice + totalPrice * (fuelFactor / 100);
  }

  if (engineVolume >= 2.5) {
    totalPrice = totalPrice + totalPrice * 0.05;
  }

  if (carState === 'used') {
    const run = +form.elements.run.value;
    const ownersFactor = getValue(ownersRadioButtons);

    if (run > 50000 && run < 200000) {
      totalPrice = totalPrice - totalPrice * 0.1;
    } else if (run >= 200000 && run < 500000) {
      totalPrice = totalPrice - totalPrice * 0.15;
    } else if (run >= 500000) {
      totalPrice = totalPrice - totalPrice * 0.2;
    }

    totalPrice = totalPrice - totalPrice * (ownersFactor / 100);
  }

  return totalPrice;
}

function showTotalPrice(totalPrice) {
  const totalPriceFormatted = totalPrice.toLocaleString('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  const paragraph = document.querySelector('.total-price');
  const span = document.getElementById('total');

  span.textContent = totalPriceFormatted;

  paragraph.classList.add('total-price_visible');

  paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function changeCheckboxesBehavior(checkboxes) {
  const makeChoosingSingleCheckbox = checkboxes => {
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        for (let cb of checkboxes) {
          if (cb !== checkbox) {
            cb.checked = false;
          }
        }
      });
    });
  };
  const preventFlagUncheckedByClick = checkboxes => {
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('click', e => {
        if (!checkbox.checked) {
          e.preventDefault();
        }
      });
    });
  };

  makeChoosingSingleCheckbox(checkboxes);
  preventFlagUncheckedByClick(checkboxes);
}

function showAdditionalControls() {
  const ownersContainer = form.querySelector('.form__owner-container');

  ownersContainer.hidden = !(this.value === 'used');
}

function validateFields() {
  const errorSymbol = '&#10071; ';

  const brand = form.elements.brand.value;
  const model = form.elements.model.value;
  const engineVolume = form.elements.engine.value;

  const normalizedEngineVolume = engineVolume.replace(',', '.');
  const engineVolumeRegex = /^(1(?:[.][1-9])?|2(?:[.]\d)?|3(?:[.][0-5])?)$/;

  const paymentsCheckboxes = Array.from(
    form.elements.payments.querySelectorAll('input')
  );
  const usedRAdio = form.querySelector('[value="used"]');
  const run = form.elements.run.value;

  let hasError = false;
  let errorMessage = '';

  const addTextToErrorMessage = text => {
    errorMessage += `${errorSymbol} ${text} <br>`;
  };

  if (!brand) {
    addTextToErrorMessage('Необходимо указать марку');
    hasError = true;
  }

  if (!model) {
    addTextToErrorMessage('Необходимо указать модель');
    hasError = true;
  }

  if (engineVolume === '') {
    addTextToErrorMessage('Необходимо указать объем двигателя');
    hasError = true;
  } else if (!engineVolumeRegex.test(normalizedEngineVolume)) {
    addTextToErrorMessage(
      'Объем двигателя должен быть в формате числа от 1,1 до 3,5 включительно'
    );
    hasError = true;
  }

  if (!paymentsCheckboxes.find(checkbox => checkbox.checked)) {
    addTextToErrorMessage('Выберите способ оплаты');
    hasError = true;
  }

  if (usedRAdio.checked && run === '') {
    addTextToErrorMessage('Необходимо указать пробег');
    hasError = true;
  } else if (usedRAdio.checked && run < 1) {
    addTextToErrorMessage('Пробег должен быть от 1км');
    hasError = true;
  }

  showError(errorMessage);

  return hasError;
}

function showError(errorMessage) {
  const paragraph = document.querySelector('.form__note');
  paragraph.innerHTML = errorMessage;

  paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideError(event) {
  const paragraph = document.querySelector('.form__note');

  if (event === 'reset') {
    paragraph.innerHTML =
      '<strong>Для получения оценки, пожалуйста, заполните все поля</strong>';
  } else if (event === 'submit') {
    paragraph.innerHTML = '';
  }
}

function editError() {
  //если выбрана radio кнопка со значением "Новый" обновлять текст ошибки, чтобы убрать ошибку о пробеге авто
  const paragraph = document.querySelector('.form__note');

  if (
    this.value === 'new' &&
    this.checked &&
    paragraph.textContent.trim() !==
      'Для получения оценки, пожалуйста, заполните все поля'
  ) {
    validateFields();
  }
}
