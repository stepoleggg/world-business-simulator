import generateValue from './Generator.js';

/*

actionExample = {
    apply: function(value) {...},
    cancel: function(value) {...},
}
*/

class Optimizer {
    constructor(actionsList, valueParams, repeatChance = 0.99) {
        this.actionsList = actionsList;
        this.repeatChance = repeatChance;
        this.valueParams = valueParams;
        this.lastValue = null;
        this.lastAction = null;
    }

    optimize(value) {
        let action;
        if (this.lastValue !== null && value > this.lastValue) {
            if (Math.random() < settings.actions.repeatChance) {
                action = this.lastAction;
            } else {
                action = this.generateRandomAction();
            }
        } else {
            if (this.lastAction !== null) {
                this.cancelAction(this.lastAction);
            }
            action = this.generateRandomAction();
        }
        this.applyAction(action);
        this.lastAction = action;
        this.lastValue = value;
    }

    generateRandomAction() {
        const action = {};
        const randomActionIdx = Math.floor(this.actionsList.length * Math.random());
        action.functions = this.actionsList[randomActionIdx];
        action.value = generateValue(this.valueParams, false);
        return action;
    }

    applyAction(action) {
        action.functions.apply(action.value);
    }

    cancelAction(action) {
        action.functions.cancel(action.value);
    }
}