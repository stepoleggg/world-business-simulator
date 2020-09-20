const settings = {
    taxes: {
        business: {
            selling: 0.15,
        },
    },
    privileges: {
        unemployed: {
            monthly: 0,
        },
        worker: {
            monthly: 0,
        },
    },
    budget: 0,
};

const payBusinessSellingTax = (price) => {
    settings.budget += price * settings.taxes.business.selling;
    return price * (1 - settings.taxes.business.selling);
}

const pay = (money) => {
    if (settings.budget > money) {
        settings.budget -= money;
        return money;
    }
    return 0;
}

const giveBenefit = (human) => {
    if (human.work === null && human.business === null) {
        human.money += pay(settings.privileges.unemployed.monthly);
    }
    if (human.work !== null && human.business === null) {
        human.money += pay(settings.privileges.worker.monthly);
    }
}

export { payBusinessSellingTax, giveBenefit, settings };