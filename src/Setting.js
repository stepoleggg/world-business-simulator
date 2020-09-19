let id = 0;
class Setting {
    constructor(name, parser, setter, getter) {
        this.name = name;
        this.setter = setter;
        this.getter = getter;
        this.id = id;
        this.parser = parser;
        id += 1;
    }

    apply() {
        const value = document.getElementById(`setting${this.id}`).value;
        this.setter(this.parser(value));
    }

    getBody() {
        return `
        <div class="setting-block">
        <h5>${this.name}</h5>
        <input class="setting" id="setting${this.id}" value="${this.getter()}" type="number"/>
        </div>`;
    }
}

export default Setting;