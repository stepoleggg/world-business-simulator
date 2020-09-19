import * as PIXI from 'pixi.js';
import { Human, settings as humanSettings } from './Human.js';
import { settings as businessSettings } from './Business.js';
import Setting from './Setting.js';
import painter from './Painter.js';
import './styles/index.css';

const app = new PIXI.Application();
document.body.appendChild(app.view);
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);
painter.setGraphics(graphics);
painter.setApp(app);

let currentPaintFunction = null;
let currentLiveFunction = null;

let world = null;
const settings = {
    humans: {
        population: 1000,
        skillsNumber: 15,
        needsNumber: 15,
    },
    monthTimeMs: 100, 
};

const inputsToReload = [];
inputsToReload.push(new Setting('Кол-во людей', parseInt, (value) => { settings.humans.population = value }, () => settings.humans.population));
inputsToReload.push(new Setting('Кол-во скиллов', parseInt, (value) => { settings.humans.skillsNumber = value }, () => settings.humans.skillsNumber));
inputsToReload.push(new Setting('Кол-во потребностей', parseInt, (value) => { settings.humans.needsNumber = value }, () => settings.humans.needsNumber));
inputsToReload.push(new Setting('Длительность месяца в мс', parseInt, (value) => { settings.monthTimeMs = value }, () => settings.monthTimeMs));
inputsToReload.push(new Setting('Деньги. Среднее', parseInt, (value) => { humanSettings.MONEY.average = value }, () => humanSettings.MONEY.average));
inputsToReload.push(new Setting('Деньги. Максимальное отклонение', parseInt, (value) => { humanSettings.MONEY.delta = value }, () => humanSettings.MONEY.delta));
inputsToReload.push(new Setting('Скиллы. Минимум', parseFloat, (value) => { humanSettings.SKILL.min = value }, () => humanSettings.SKILL.min));
inputsToReload.push(new Setting('Скиллы. Максимум', parseFloat, (value) => { humanSettings.SKILL.max = value }, () => humanSettings.SKILL.max));
inputsToReload.push(new Setting('Потребности. Минимум', parseFloat, (value) => { humanSettings.NEED.min = value }, () => humanSettings.NEED.min));
inputsToReload.push(new Setting('Потребности. Максимум', parseFloat, (value) => { humanSettings.NEED.max = value }, () => humanSettings.NEED.max));
inputsToReload.push(new Setting('Авантюризм. Минимум', parseFloat, (value) => { humanSettings.AVANTURISM.min = value }, () => humanSettings.AVANTURISM.min));
inputsToReload.push(new Setting('Авантюризм. Максимум', parseFloat, (value) => { humanSettings.AVANTURISM.max = value }, () => humanSettings.AVANTURISM.max));
inputsToReload.push(new Setting('Координаты. Минимум', parseFloat, (value) => { humanSettings.POSITION.min = value }, () => humanSettings.POSITION.min));
inputsToReload.push(new Setting('Координаты. Максимум', parseFloat, (value) => { humanSettings.POSITION.max = value }, () => humanSettings.POSITION.max));
inputsToReload.push(new Setting('Свободное время, ч', parseFloat, (value) => { humanSettings.freetime = value }, () => humanSettings.freetime));
inputsToReload.push(new Setting('Скорость, пикс/ч', parseFloat, (value) => { humanSettings.speedPixelsPerHour = value }, () => humanSettings.speedPixelsPerHour));

const inputsRealtime = [];

inputsRealtime.push(new Setting('Удача открыть бизнес', parseFloat, (value) => { humanSettings.businessLuck = value }, () => humanSettings.businessLuck));
inputsRealtime.push(new Setting('Усиление вероятности смены работы', parseFloat, (value) => { humanSettings.leavingLuck = value }, () => humanSettings.leavingLuck));
inputsRealtime.push(new Setting('Стартовая цена товара. Минимум', parseFloat, (value) => { businessSettings.startPrice.min = value }, () => businessSettings.startPrice.min));
inputsRealtime.push(new Setting('Стартовая цена товара. Максимум', parseFloat, (value) => { businessSettings.startPrice.max = value }, () => businessSettings.startPrice.max));
inputsRealtime.push(new Setting('Стартовая доля оплаты рабочего. Минимум', parseFloat, (value) => { businessSettings.startSalaryK.min = value }, () => businessSettings.startSalaryK.min));
inputsRealtime.push(new Setting('Стартовая доля оплаты рабочего. Максимум', parseFloat, (value) => { businessSettings.startSalaryK.max = value }, () => businessSettings.startSalaryK.max));
inputsRealtime.push(new Setting('Изменение цены или зп. Среднее', parseFloat, (value) => { businessSettings.actions.value.average = value }, () => businessSettings.actions.value.average));
inputsRealtime.push(new Setting('Изменение цены или зп. Максимальное отклонение', parseFloat, (value) => { businessSettings.actions.value.delta = value }, () => businessSettings.actions.value.delta));
inputsRealtime.push(new Setting('Вероятность повтора успешного действия бизнесмена', parseFloat, (value) => { businessSettings.actions.repeatChance = value }, () => businessSettings.actions.repeatChance));

for (let input of inputsToReload) {
    document.getElementById('restart-settings').innerHTML += input.getBody();
}

for (let input of inputsRealtime) {
    document.getElementById('realtime-settings').innerHTML += input.getBody();
}

document.getElementById('apply-restart').onclick = () => {
    for (let input of inputsRealtime) {
        input.apply();
    }
    for (let input of inputsToReload) {
        input.apply();
    }
    stop();
    start();
};

document.getElementById('apply').onclick = () => {
    for (let input of inputsRealtime) {
        input.apply();
    }
};

const init = () => {
    const world = {};
    const humans = new Set();
    for (let i = 0; i < settings.humans.population; i++) {
        humans.add(new Human(settings.humans.skillsNumber, 
            settings.humans.needsNumber, world));
    }
    world.needs = {};
    world.humans = humans;
    world.businesses = new Set();
    return world;
};

const live = () => {
    let sumSalary = 0;
    let sumFullSalary = 0;
    let workingPeople = 0;
    let sumPrice = 0;
    let businessMoney = 0;
    let workingMoney = 0;
    let unemployedMoney = 0;
    let sumNeeds = 0;
    let sumProducted = 0;
    let sumBusinessWorkMonthes = 0;
    let maxBusinessWorkMonthes = 0;
    let bestBusiness = null;

    for (let human of world.humans) {
        for (let need of human.needs) {
            sumNeeds += need;
        }
        if (human.work !== null) {
            workingPeople++;
            sumFullSalary += human.salary;
            workingMoney += human.money;
        } else if (human.business !== null) {
            businessMoney += human.money;
        } else {
            unemployedMoney += human.money;
        }
        human.live();
    }
    for (let business of world.businesses) {
        business.live();
        sumPrice += business.price;
        sumSalary += business.salary;
        sumProducted += business.producted;
        sumBusinessWorkMonthes += business.workMonthes;
        if (business.workMonthes > maxBusinessWorkMonthes) {
            maxBusinessWorkMonthes = business.workMonthes;
        }
        if (bestBusiness === null || business.owner.money > bestBusiness.owner.money) {
            bestBusiness = business;
        }
    }

    const averagePrice = sumPrice / world.businesses.size;
    const averageSalary = sumSalary /  world.businesses.size;
    const averageFullSalary = sumFullSalary / workingPeople;

    const averageBusinessMoney = businessMoney / world.businesses.size;
    const averageWorkingMoney = workingMoney / workingPeople;
    const averageUnemployedMoney = unemployedMoney / (settings.humans.population - workingPeople - world.businesses.size);
    const averageNeed = sumNeeds / settings.humans.population / settings.humans.needsNumber;
    const averageProducted = sumProducted / world.businesses.size;
    const averageBusinessWorkMonthes = sumBusinessWorkMonthes / world.businesses.size;
    let bestBusinessMoney = null;
    let bestBusinessServices = null;
    if (bestBusiness !== null) {
        bestBusinessMoney = bestBusiness.owner.money;
        bestBusinessServices = bestBusiness.services.size;
    }

    document.getElementById('stat').innerHTML = `
        Средняя цена: ${averagePrice}<br>
        Средняя ЗП в час: ${averageSalary}<br>
        Средняя ЗП в месяц: ${averageFullSalary}<br>
        Кол-во безработных: ${settings.humans.population - workingPeople - world.businesses.size}<br>
        Кол-во рабочих: ${workingPeople}<br>
        Кол-во бизнесов: ${world.businesses.size}<br>
        Среднее кол-во денег у бизнесмена: ${averageBusinessMoney}<br>
        Среднее кол-во денег у рабочего: ${averageWorkingMoney}<br>
        Среднее кол-во денег у безработного: ${averageUnemployedMoney}<br>
        Среднее удовлетворение потребностей: ${averageNeed}<br>
        Средний остаток продукции: ${averageProducted}<br>
        Средний возраст бизнеса в месяцах: ${averageBusinessWorkMonthes}<br>
        Возраст старейшего бизнеса в месяцах: ${maxBusinessWorkMonthes}<br>
        Кол-во денег у богатейщего бизнесмена: ${bestBusinessMoney}<br>
        Кол-во потребностей, закрываемых товаром богатейщего бизнеса: ${bestBusinessServices}<br>
    `;
    // console.log(world);
};

const stop = () => {
    if (currentPaintFunction !== null) {
        app.ticker.remove(currentPaintFunction);
    }
    if (currentLiveFunction !== null) {
        window.clearInterval(currentLiveFunction);
    }
}

const start = () => {
    currentPaintFunction = (delta) => {
        graphics.clear();
        painter.draw(world);
    };
    world = init();
    app.ticker.add(currentPaintFunction);
    currentLiveFunction = window.setInterval(live, settings.monthTimeMs);
}