import * as PIXI from 'pixi.js';
import Human from './Human.js';
import painter from './Painter.js';

const app = new PIXI.Application();
document.body.appendChild(app.view);
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);
painter.setGraphics(graphics);
painter.setApp(app);

const settings = {
    humans: {
        population: 1000,
        skillsNumber: 15,
        needsNumber: 15,
    },
}

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

const world = init();
console.log(world);

app.ticker.add((delta) => {
    graphics.clear();
    painter.draw(world);
});

window.setInterval(() => {
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

    document.getElementById('stat').innerHTML = `
        averagePrice: ${averagePrice}<br>
        averageSalary: ${averageSalary}<br>
        averageFullSalary: ${averageFullSalary}<br>
        workingPeople: ${workingPeople}<br>
        businesses: ${world.businesses.size}<br>
        averageBusinessMoney: ${averageBusinessMoney}<br>
        averageWorkingMoney: ${averageWorkingMoney}<br>
        averageUnemployedMoney: ${averageUnemployedMoney}<br>
        averageNeed: ${averageNeed}<br>
        averageProducted: ${averageProducted}<br>
        averageBusinessWorkMonthes: ${averageBusinessWorkMonthes}<br>
        maxBusinessWorkMonthes: ${maxBusinessWorkMonthes}<br>
        bestBusinessMoney: ${bestBusiness.owner.money}<br>
        bestBusinessServices: ${bestBusiness.services.size}<br>
    `;
}, 100);