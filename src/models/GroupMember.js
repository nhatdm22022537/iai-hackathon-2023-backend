import {User} from "./User";

export class GroupMember extends User {
    constructor(id, name, overall) {
        super(id, name);
        this.overallEvaluation = overall || 0;
    }

    /**
     * for now, we only care about the points which the user got after each game.
     */
    updateOverallEvaluation(result) {
            this.overallEvaluation += result.points;
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            overallEvaluation: this.overallEvaluation
        }
    }
}