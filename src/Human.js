import Business from './Business.js';
import generateValue from './Generator.js';

const MONEY = {
    average: 1000000,
    delta: 500000,
};

const SKILL = {
    min: 0,
    max: 1,
};

const NEED = {
    min: 1,
    max: 10,
}

const AVANTURISM = {
    min: 0,
    max: 1,
};

const POSITION = {
    min: -10000,
    max: 10000,
}

const settings = {
    freetime: 320,
    speedPixelsPerHour: 10,
    businessLuck: 0.01,
    leavingLuck: 1,
};

class Human {
    constructor(skillsNumber, needsNumber, world) {
        this.salary = 0;
        this.worktime = 1;
        this.mood = 0;
        this.world = world;
        this.freetime = settings.freetime;
        this.shoppingtime = 0;
        this.speed = settings.speedPixelsPerHour;
        this.work = null;
        this.business = null;
        this.color = 0xFFFFFF;

        this.generateSkills(skillsNumber);
        this.generateNeeds(needsNumber);
        this.money = generateValue(MONEY);
        this.avanturism = generateValue(AVANTURISM, false);
        this.position = {
            x: generateValue(POSITION),
            y: generateValue(POSITION),
        };
    }

    live() {
        this.use();
        this.spend();
        this.earn();
    }

    use() {
        for (let needIdx in this.needs) {
            this.needs[needIdx]--;
            if (this.needs[needIdx] < 1) {
                this.needs[needIdx] = 1;
            }
        }
    }

    earn() {
        if (this.work === null && this.business === null) {
            this.findWork();
        }
        if (this.business === null && this.money > 0) {
            if (Math.random() < this.avanturism) {
                if (Math.random() < settings.businessLuck) {
                    if (this.work !== null) {
                        this.work.fireWorker(this);
                    }
                    this.makeBusiness();
                }
            }
        }
        if (this.business === null && this.work !== null) {
            if (Math.random() < this.avanturism) {
                if (Math.random() > (1 / (this.workMonthes + 1)) ** settings.leavingLuck) {
                    this.work.fireWorker(this);
                }
            }
        }
    }

    spend() {
        let worstNeedIdx = null;
        let worstNeedValue = null;
        let needstr = '';
        for (let needIdx in this.needs) {
            needstr += needIdx + ' ';
            if ((worstNeedValue === null || this.needs[needIdx] < worstNeedValue) 
                && this.world.needs[needIdx] !== undefined) {
                worstNeedValue = this.needs[needIdx];
                worstNeedIdx = needIdx;
            }
        }
        
        if (worstNeedIdx === null) {
            return;
        }

        let bestBusiness = null;
        let bestPrice = null;
        
        for(let business of this.world.needs[worstNeedIdx]) {
            if (!business.haveProducts() || business.price > this.money) {
                continue;
            }
            const roadTime = business.calcRoadTime(this);
            if (roadTime < this.freetime) {
                const price = roadTime * (this.salary / this.worktime) + business.price;
                let importanceSum = 0;
                for (let needIdx of business.services) {
                    const importance = 1 / (this.needs[needIdx] - worstNeedValue + 1);
                    importanceSum += importance;
                }
                const eqPrice = price / importanceSum;
                if (bestPrice === null || eqPrice < bestPrice) {
                    bestPrice = eqPrice;
                    bestBusiness = business;
                }
            }
        }
        if (bestBusiness !== null) {
            bestBusiness.sell(this);
        }
    }

    findWork() {
        let bestWork;
        let bestSalary = 0;
        for (let business of this.world.businesses) {
            const salary = business.calcWorkSalary(this);
            if (salary > bestSalary) {
                bestSalary = salary;
                bestWork = business;
            }
        }
        if (bestSalary > 0) {
            bestWork.joinWorker(this);
        }
    }

    makeBusiness() {
        const allSkillsNumber = this.skills.length;
        const allNeedsNumber = this.needs.length;
        let skillsAndServicesNumber = 
            Math.floor(-Math.log2(Math.random())) + 1;
        if (skillsAndServicesNumber > allSkillsNumber) {
            skillsAndServicesNumber = allSkillsNumber;
        }
        const requiredSkills = new Set();
        const services = new Set();
        for (let i = 0; i < skillsAndServicesNumber; i++) {
            let idx;
            do {
                idx = Math.floor(Math.random() * allSkillsNumber);
            } while (requiredSkills.has(idx));
            requiredSkills.add(idx);

            do {
                idx = Math.floor(Math.random() * allNeedsNumber);
            } while (services.has(idx));
            services.add(idx);
        }
        this.business = new Business(this, this.position, requiredSkills, services);
        this.world.businesses.add(this.business);
        for (let service of services) {
            if (this.world.needs[service] === undefined) {
                this.world.needs[service] = new Set();
            }
            this.world.needs[service].add(this.business);
        }
    }

    generateSkills(skillsNumber) {
        this.skills = [];
        for (let i = 0; i < skillsNumber; i++) {
            this.skills.push(generateValue(SKILL, false));
        }
    }

    generateNeeds(needsNumber) {
        this.needs = [];
        for (let i = 0; i < needsNumber; i++) {
            this.needs.push(generateValue(NEED));
        }
    }
}

export default Human;