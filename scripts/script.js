'use strict';

const dataBase = JSON.parse(localStorage.getItem('awito')) || [];
let counter = dataBase.length;
const modalAdd = document.querySelector('.modal__add'), //первое модальное окно
    addAd = document.querySelector('.add__ad'), //кнопка "Подать объявление"
    modalBtnSubmit = document.querySelector('.modal__btn-submit'),// кнопка "Отправить "
    modalSubmit = document.querySelector('.modal__submit'), //Форма для заполнения
    catalog = document.querySelector('.catalog'), //Весь каталог товаров - изначально 9 карточек
    modalItem = document.querySelector('.modal__item'), //второе модальное окно самой тестовой карточки
    modalBtnWarning = document.querySelector('.modal__btn-warning'), //Функционал "Заполните все поля"
    modalFileInput = document.querySelector('.modal__file-input'), // Область влаживания фото в карточку товара
    modalFileBtn = document.querySelector('.modal__file-btn'), // Кнопка "Добавить фото" (Бутафория кнопки - спанчик)
    modalImageAdd = document.querySelector('.modal__image-add'); // Область для влаживания файла фото в первом модальном окне
/////////////////second modal window
const modalImageItem = document.querySelector('.modal__image-item'), //Область хранения фото во втором модальном окне (не див, в который оно влаживается)
    modalHeaderItem = document.querySelector('.modal__header-item'), // Название во второй модалке
    modalStatusItem = document.querySelector('.modal__status-item'), //Статус     
    modalDescriptionItem = document.querySelector('.modal__description-item'), //Описание     
    modalCostItem = document.querySelector('.modal__cost-item'); // Стоимость      

const searchInput = document.querySelector('.search__input'), // поле поиска
    menuContainer = document.querySelector('.menu__container'); //Область меню

const textFileBtn = modalFileBtn.textContent;
const srcModalImage = modalImageAdd.src;

const elementsModalSubmit = [...modalSubmit.elements]
    .filter(elem => elem.tagName !== 'BUTTON' && elem.type !== 'submit');

const infoPhoto = {};

const saveDB = () => localStorage.setItem('awito', JSON.stringify(dataBase)); 

const checkForm = () => {
    const validForm = elementsModalSubmit.every(elem => elem.value);
    modalBtnSubmit.disabled = !validForm;
    modalBtnWarning.style.display = validForm ? 'none' : '';
};

const closeModal = event => { 
    const target = event.target;

    if (target.closest('.modal__close') || 
    target.classList.contains('modal') || 
    event.code === 'Escape') {
        modalAdd.classList.add('hide');
        modalItem.classList.add('hide');
        document.removeEventListener('keydown', closeModal);
        modalSubmit.reset();
        modalImageAdd.src = srcModalImage;
        modalFileBtn.textContent = textFileBtn;
        checkForm();
    }
    
};

const renderCard = (DB = dataBase) => {
    catalog.textContent = '';
    
    DB.forEach(item => {
        catalog.insertAdjacentHTML('beforeend', `
        <li class="card" data-id="${item.id}">
        <img class="card__image" src="data:image/jpeg;base64, ${item.image}" alt="test">
            <div class="card__description">
                <h3 class="card__header">${item.nameItem}</h3>
                <div class="card__price">${item.costItem} ₽</div>
            </div>
        </li>
        `);
    });
};

searchInput.addEventListener('input', ( ) => {
    const searchValue = searchInput.value.trim().toLowerCase();

    if (searchValue.length > 2) {
        const result = dataBase.filter(item => item.nameItem
            .toLowerCase().includes(searchValue) || 
            item.descriptionItem
            .toLowerCase().includes(searchValue))
            renderCard(result);
    }        

});

modalFileInput.addEventListener('change', event => {
    const target = event.target;
    const reader = new FileReader();
    const file = target.files[0];

    infoPhoto.filename = file.name;
    infoPhoto.size = file.size;

    reader.readAsBinaryString(file);

    reader.addEventListener('load', event => {
        if(infoPhoto.size < 200000) {
            modalFileBtn.textContent = infoPhoto.filename;
        infoPhoto.base64 = btoa(event.target.result); // конвертируем картинку в строку
        modalImageAdd.src = `data:image/jpeg;base64,${infoPhoto.base64}`;
        } else { 
            modalFileBtn.textContent = 'Только для фото размером до 200 кб'
            modalFileInput.value = '';
            checkForm();
        }
    });
});

modalSubmit.addEventListener('input', checkForm);

modalSubmit.addEventListener('submit', event => {
    event.preventDefault();
    const itemObj = {};
    
    for (const elem of elementsModalSubmit) {
        itemObj[elem.name] = elem.value;
        
    }
    itemObj.id = counter++;
    itemObj.image = infoPhoto.base64;
    dataBase.push(itemObj);
    closeModal({target: modalAdd});
    saveDB();
    renderCard();
});

addAd.addEventListener('click', () => { // навешиваем на кнопку открытие модального окна по событию(клик)
    modalAdd.classList.remove('hide');
    modalBtnSubmit.disabled = true;
    document.addEventListener('keydown', closeModal);
});

catalog.addEventListener('click', event => {
    const target = event.target;
    const card = target.closest('.card');

    if (card) {
        const item = dataBase.find(obj => obj.id === +card.dataset.id);

        modalImageItem.src = `data:image/jpeg;base64,${item.image}`;
        modalHeaderItem.textContent = item.nameItem;
        modalStatusItem.textContent = item.status === 'new' ? 'Новый' : 'Б/У';
        modalDescriptionItem.textContent = item.descriptionItem;
        modalCostItem.textContent = item.costItem;

        modalItem.classList.remove('hide');
        document.addEventListener('keydown', closeModal);
    }
});

menuContainer.addEventListener('click', event => {
    const target = event.target;

    if (target.tagName === 'A') {
        const result = dataBase.filter(item => item.category === target.dataset.category);
        renderCard(result);
    }
});

modalAdd.addEventListener('click', closeModal);
modalItem.addEventListener('click', closeModal);

renderCard();


