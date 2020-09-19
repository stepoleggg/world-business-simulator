import generateValue from './Generator.js';
import Optimizer from './Optimizer.js';

const settings = {
    startPrice: {
        min: 1,
        max: 1000,
    },
    startSalaryK: {
        min: 0.001,
        max: 1,
    },
    actions: {
        list: [
            {
                name: '+PRICE',
                apply: (business, value) => { business.price *= value },
                cancel: (business, value) => { business.price /= value },
            },
            {
                name: '-PRICE',
                apply: (business, value) => { business.price /= value },
                cancel: (business, value) => { business.price *= value },
            },
            {
                name: '-SALARY',
                apply: (business, value) => { business.salary /= value },
                cancel: (business, value) => { business.salary *= value },
            },
            {
                name: '+SALARY',
                apply: (business, value) => { business.salary *= value },
                cancel: (business, value) => { business.salary /= value },
            },
            {
                name: 'NOTHING',
                apply: (business, value) => {},
                cancel: (business, value) => {},
            }
        ],
        value: {
            average: 1.1,
            delta: 0.05,
        },
        repeatChance: 0.99,
    }
};

class Business {
    constructor(owner, position, requiredSkills, services) {
        this.requiredSkills = requiredSkills;
        this.services = services;
        this.owner = owner;
        this.workers = new Set();
        this.producted = 0;
        this.price = generateValue(settings.startPrice, false);
        this.salary = this.price * generateValue(settings.startSalaryK, false);
        this.position = { ...position };
        this.earnings = 0;
        this.sellings = 0;
        this.workMonthes = 0;
        this.optimizer = new Optimizer(this, settings.actions.list, settings.actions.value, settings.actions.repeatChance);
    }

    live() {
        const isPayed = this.paySalary();
        if (!isPayed) {
            this.close();
            return;
        }
        this.optimize();
        this.workMonthes += 1;
    }

    paySalary() {
        this.payings = 0;
        this.productions = 0;
        for (let worker of this.workers) {
            const { salary, power, worktime } = this.calcWorkSalaryAndPower(worker);
            if (salary > this.owner.money) {
                return false;
            }
            this.producted += power;
            worker.money += salary;
            worker.salary = salary;
            worker.worktime = worktime;
            worker.workMonthes++;
            this.owner.money -= salary;
            this.payings += salary;
            this.productions += power;
        }
        return true;
    }

    close() {
        this.owner.world.businesses.delete(this);
        this.owner.business = null;
        for (let service of this.services) {
            this.owner.world.needs[service].delete(this);
        }
        this.workers.forEach((worker) => {
            this.fireWorker(worker);
        });
    }

    optimize() {
        const moneyProfit = this.earnings - this.payings;
        const productProfit = this.productions - this.sellings;
        this.optimizer.optimize(moneyProfit);
        this.earnings = 0;
        this.sellings = 0;
    }

    haveProducts() {
        return this.producted >= 1;
    }

    sell(human) {
        this.producted -= 1;
        this.earnings += this.price;
        this.sellings += 1;
        this.owner.money += this.price;
        human.money -= this.price;
        for(let serviceIdx of this.services) {
            human.needs[serviceIdx]++;
        }
    }

    calcRoadTime(worker) {
        const dx = worker.position.x - this.position.x;
        const dy = worker.position.y - this.position.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        const roadTimeHours = distance / worker.speed;
        return roadTimeHours;
    }

    calcWorkTime(worker) {
        return worker.freetime - this.calcRoadTime(worker);
    }

    calcWorkPower(worker) {
       let sum = 0;
       for (let skillIndex of this.requiredSkills) {
           sum += worker.skills[skillIndex] ** 2;
       }
       return sum ** 0.5 / this.requiredSkills.size ** 0.5;
    }

    calcWorkSalary(worker) {
        const worktime = this.calcWorkTime(worker);
        const workpower = this.calcWorkPower(worker);
        return this.salary * worktime * workpower;
    }

    calcWorkSalaryAndPower(worker) {
        const worktime = this.calcWorkTime(worker);
        const workpower = this.calcWorkPower(worker);
        return {
            salary: this.salary * worktime * workpower,
            power: workpower * worktime,
            worktime,
        };
    }

    joinWorker(worker) {
        worker.work = this;
        worker.workMonthes = 0;
        this.workers.add(worker);
    }

    fireWorker(worker) {
        worker.work = null;
        this.workers.delete(worker);
        worker.salary = 0;
        worker.worktime = 1;
    }
}

export default Business;
