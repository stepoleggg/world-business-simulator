const system = {
    offset: {
        x: -10000,
        y: -10000,
        max: {
            x: 10000,
            y: 10000,
        },
        min: {
            x: -10000,
            y: -10000,
        },
        speed: 0.1,
    },
    zoom: {
        value: 0.026,
        speed: 1.001,
        max: 10,
        min: 0.01,
    },
    humanSize: 50,
    businessSize: 100,
};

let graphics;
let app;

const setApp = (a) => {
    app = a;
};

const setGraphics = (g) => {
    graphics = g;
    let now = null;

    window.onkeyup = (event) => {
        now = null;
    }

    window.onkeydown = (event) => {
        if (now === null) {
            now = Date.now();
        }
        const delta = Date.now() - now;
        now = Date.now();
        const keyCode = event.keyCode;
        const speed = system.offset.speed;
        const zoom = system.zoom.value;
        if (keyCode === 87) {
            system.offset.y -= speed * delta / zoom;
        }
        if (keyCode === 83) {
            system.offset.y += speed * delta / zoom;
        }
        if (keyCode === 65) {
            system.offset.x -= speed * delta / zoom;
        }
        if (keyCode === 68) {
            system.offset.x += speed * delta / zoom;
        }
        if (keyCode === 81) {
            system.zoom.value *= system.zoom.speed ** delta;
        }
        if (keyCode === 69) {
            system.zoom.value /= system.zoom.speed ** delta;
        }

        if (system.offset.x < system.offset.min.x) {
            system.offset.x = system.offset.min.x;
        }
        if (system.offset.x > system.offset.max.x) {
            system.offset.x = system.offset.max.x;
        }
        if (system.offset.y < system.offset.min.y) {
            system.offset.y = system.offset.min.y;
        }
        if (system.offset.y > system.offset.max.y) {
            system.offset.y = system.offset.max.y;
        }
        if (system.zoom.value > system.zoom.max) {
            system.zoom.value = system.zoom.max;
        }
        if (system.zoom.value < system.zoom.min) {
            system.zoom.value = system.zoom.min;
        }
        document.getElementById('root').innerHTML = `zoom: ${system.zoom.value}`;
    }
};

const drawZoomedRect = (rect, zoomedSize = true) => {
    const x = (rect.x - system.offset.x) * system.zoom.value;
    const y = (rect.y - system.offset.y) * system.zoom.value;
    const width = zoomedSize ? rect.width * system.zoom.value : rect.width;
    const height = zoomedSize ? rect.height * system.zoom.value : rect.height;
    
    graphics.lineStyle(0);
    graphics.beginFill(rect.color);
    graphics.drawRect(x, y, width, height);
    graphics.endFill();
};

const drawZoomedLine = (line) => {
    const x1 = (line.x1 - system.offset.x) * system.zoom.value;
    const y1 = (line.y1 - system.offset.y) * system.zoom.value;
    const x2 = (line.x2 - system.offset.x) * system.zoom.value;
    const y2 = (line.y2 - system.offset.y) * system.zoom.value;

    graphics.beginFill();
    graphics.lineStyle(line.width, line.color);
    graphics.moveTo(x1, y1);
    graphics.lineTo(x2, y2);
    graphics.endFill();
}

const drawHuman = (human) => {
    if (human.business !== null) {
        return;
    }
    if (human.work !== null) {
        drawZoomedLine({
            x1: human.position.x,
            y1: human.position.y,
            x2: human.work.position.x,
            y2: human.work.position.y,
            width: 1,
            color: 0xff0000,
        });
    }
    const size = human.money / 10000;
    drawZoomedRect({
        color: human.color,
        x: human.position.x - size / 2,
        y: human.position.y - size / 2,
        width: size,
        height: size,
    }, true);
};

const drawBusinessParameter = (paramGetter, business, color) => {
    const size = paramGetter(business);
    drawZoomedRect({
        color: color,
        x: business.position.x - size / 2,
        y: business.position.y - size / 2,
        width: size,
        height: size,
    });
}

const drawBusiness = (business) => {
    drawBusinessParameter((b) => b.owner.money / 10000, business, 0xffffff);
    drawBusinessParameter((b) => b.workMonthes ** 0.5 * 10, business, 0x00ffff);
    drawBusinessParameter((b) => b.salary ** 0.5 * 50, business, 0x00ff00);
}

const draw = (world) => {
    for (let business of world.businesses) {
        drawBusiness(business);
    }

    for(let human of world.humans) {
        drawHuman(human);
    }
};

export default { setGraphics, setApp, draw };