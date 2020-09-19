import generateValue from './Generator.js';

/*
actionExample = {
    apply: function(value) {...},
    cancel: function(value) {...},
}
*/

class Optimizer {
    constructor(optimizingObject, actionsList, valueParams, repeatChance = 0.99) {
        this.optimizingObject = optimizingObject;
        this.actionsList = actionsList;
        this.repeatChance = repeatChance;
        this.valueParams = valueParams;
        this.lastValue = null;
        this.lastAction = null;
    }

    optimize(optimizingValue) {
        let action;
        if (this.lastValue !== null && optimizingValue > this.lastValue) {
            if (Math.random() < this.repeatChance) {
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
        this.lastValue = optimizingValue;
    }

    generateRandomAction() {
        const action = {};
        const randomActionIdx = Math.floor(this.actionsList.length * Math.random());
        action.functions = this.actionsList[randomActionIdx];
        action.value = generateValue(this.valueParams, false);
        return action;
    }

    applyAction(action) {
        action.functions.apply(this.optimizingObject, action.value);
    }

    cancelAction(action) {
        action.functions.cancel(this.optimizingObject, action.value);
    }
}

export default Optimizer;
