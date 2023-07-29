
export class Item {
    constructor(name, type, cost, description) {
        this.name = name;
        this.type = type;
        this.cost = cost;
        this.description = description;
    }

    toJSON() {
        return {
            name: this.name,
            type: this.type,
            cost: this.cost,
            description: this.description,
        };
    }

    set setName(name) {
        this.name = name;
    }
    set setType(type) {
        this.type = type;
    }
    set setCost(cost) {
        this.cost = cost;
    }
    set setDescription(description) {
        this.description = description;
    }
}
