
// переключение меню
const toggleBtns = document.querySelectorAll('.toggle-menu');
const converter = document.querySelector('.converter');
const currentRate = document.querySelector('.current_rate');

for (let item of toggleBtns) {
    item.addEventListener('click', function () {
        toggleBtns.forEach(i => i.classList.remove('active'));
        this.classList.toggle('active');
        if (this.classList.contains('toggle-menu1')) {
            converter.style.display = "none";
            currentRate.style.display = "block";
        } else if (this.classList.contains("toggle-menu2")) {
            currentRate.style.display = "none";
            converter.style.display = "flex";
        }
    })
};

// переключение аудио
const audioPlay = () => {
    const audio = document.getElementById('audio');
    const player = document.getElementById('player');

    function getCharcodeAudio(e) {
        if (!e.target.checked) {
            player.pause();
        } else if (e.target.checked) {
            player.play();
        }
    }
    audio.addEventListener('change', getCharcodeAudio);
}

audioPlay();

// функция динамической отрисовки карточек и выпадающего списка в конвертере
const renderContent = (result) => {
    let content = document.getElementById('data');
    let formSelect = document.getElementById('select');
    let formSelectIn = document.getElementById('selectIn');
    let colorCourse;
    let cardsFavor = document.querySelector('.cardsFavor');

    // добавление в избранное

    function getCharcodeCard(e) {
        let event = e.target;
        let colorCourse;

        if (!event.matches('input') && event.tagName === 'INPUT' && event.type === 'checkbox') return

        if (event.checked) {

            if (result.Valute[event.id].Value < result.Valute[event.id].Previous) {
                colorCourse = 'bottom';
            } else if (result.Valute[event.id].Value > result.Valute[event.id].Previous) {
                colorCourse = 'top';
            }

            cardsFavor.innerHTML += `
            <div class="cardFavor" id="${result.Valute[event.id].CharCode}">
                <h2>${result.Valute[event.id].CharCode}</h2>
                <h3 class="course ${colorCourse}">${result.Valute[event.id].Value.toFixed(2)}</h3>
            </div>
            `

        } else if (event.checked === false) {
            let removeCard = document.getElementById(`${result.Valute[event.id].CharCode}`);
            removeCard.parentNode.removeChild(removeCard);
        }

        localStorageUtil.putCards(`${result.Valute[event.id].CharCode}`);

    }
    const addCard = document.querySelector('.cards');
    addCard.addEventListener('change', getCharcodeCard);

    Object.values(result.Valute).map((currencyCode) => {

        if (currencyCode.Value < currencyCode.Previous) {
            colorCourse = 'bottom';
        } else if (currencyCode.Value > currencyCode.Previous) {
            colorCourse = 'top';
        }

        content.innerHTML += `
        <div class="card">
            <div class="content">
                <h2>${currencyCode.CharCode}</h2>
                <h3 class="course ${colorCourse}">${currencyCode.Value.toFixed(2)}</h3>
                <div class="descr">
                    <p>${currencyCode.Nominal}</p>
                    <p>${currencyCode.Name}</p>
                </div>
                <div class="heart">
                    <li>
                        <label>
                            <input type="checkbox" class="checkbox" id="${currencyCode.CharCode}">
                            <div class="icon"><i class="fa fa-heart" aria-hidden="true"></i></div>
                        </label>
                    </li>
                </div>
            </div>
        </div>
        `,

            formSelect.innerHTML += `
        <option value="${currencyCode.CharCode}">${currencyCode.Nominal} ${currencyCode.Name}</option>
        `,

        formSelectIn.innerHTML += `
    <option value="${currencyCode.CharCode}">${currencyCode.Nominal} ${currencyCode.Name}</option>
    `
    })

    // сохранение в localStorage
    class LocalStorageUtil {
        constructor() {
            this.keyName = "cards";
        }

        getCards() {
            const cardsLocalStorage = localStorage.getItem(this.keyName);
            if (cardsLocalStorage !== null) {
                return JSON.parse(cardsLocalStorage);
            }
            return [];
        }

        putCards(id) {
            let cards = this.getCards();
            let pushCards = false;
            const index = cards.indexOf(id);

            if (index === -1) {
                cards.push(id);
                pushCards = true;
            } else {
                cards.splice(index, 1);
            }

            localStorage.setItem(this.keyName, JSON.stringify(cards));

            return {
                pushCards: pushCards,
                cards: cards
            }
        }

    }
    const localStorageUtil = new LocalStorageUtil();
    const storageCards = localStorageUtil.getCards();

    storageCards.forEach(card => {
        let checkedCard = document.querySelector(`#${card}`);

        if (result.Valute[card].Value < result.Valute[card].Previous) {
            colorCourse = 'bottom';
        } else if (result.Valute[card].Value > result.Valute[card].Previous) {
            colorCourse = 'top';
        }

        cardsFavor.innerHTML += `
            <div class="cardFavor" id="${card}">
                <h2>${card}</h2>
                <h3 class="course ${colorCourse}">${result.Valute[card].Value.toFixed(2)}</h3>
            </div>
            `

        checkedCard.setAttribute('checked', 'true');
    })
}

getCurrencies();

// setInterval(getCurrencies, 1800000);

// функция получения курса валют и отображения их на странице
async function getCurrencies() {
    const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    const data = await response.json();
    const result = await data;

    renderContent(result);
    convertValue(result);
}

// конвертер валюты
const convertValue = (result) => {
    // слушаем изменения в текстовом поле и в select 
    const inputIn = document.querySelector('#input');
    const inputOut = document.querySelector('#result');
    const selectIn = document.querySelector('#selectIn');
    const select = document.querySelector('#select');

    inputIn.oninput = convert;
    selectIn.oninput = convert;
    select.oninput = convert;

    function convert() {
        if ( select.value == selectIn.value ) { 
            inputOut.value = inputIn.value;
        } else if ( selectIn.value == "RUB") {
            inputOut.value = (parseFloat(inputIn.value) / result.Valute[select.value].Value).toFixed(2);
        } else if ( select.value == "RUB") {
            inputOut.value = (parseFloat(inputIn.value) * result.Valute[selectIn.value].Value / 1).toFixed(2);
        } else {
            inputOut.value = (parseFloat(inputIn.value) * result.Valute[selectIn.value].Value / result.Valute[select.value].Value).toFixed(2);
        }
        
    }
}

    // анимация карточек
    VanillaTilt.init(document.querySelectorAll(".cardFavor"), {
        max: 10,
        speed: 400,
        glare: true,
        "max-glare": 1
    });
    VanillaTilt.init(document.querySelectorAll(".card"), {
        max: 25,
        speed: 100,
        glare: true,
        "max-glare": 1
    });
    VanillaTilt.init(document.querySelectorAll(".cards__h2"), {
        max: 7,
        speed: 400
    });
    VanillaTilt.init(document.querySelectorAll(".toggle-menu"), {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 1
    });
    // VanillaTilt.init(document.querySelectorAll(".converter"), {
    //     max: 10,
    //     speed: 400,
    //     glare: true,
    //     "max-glare": 1,
    //     perspective: 2000
    // });
