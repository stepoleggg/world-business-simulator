const generateValue = (valueObj, floored = true) => {
    let value;
    if (valueObj.max !== undefined && valueObj.min !== undefined) {
        value = Math.random() * (valueObj.max - valueObj.min) + valueObj.min;
    } else {
        value = Math.random() * valueObj.delta * 2 + valueObj.average - valueObj.delta
    }
    if (floored) {
        return Math.floor(value);
    } else {
        return value
    }
}

export default generateValue;