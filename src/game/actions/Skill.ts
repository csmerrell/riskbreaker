import { Entity } from 'excalibur';

export class Skill extends Entity {
    public async activate() {
        throw new Error('[Skill.activate] must be implemented by the extending class.');
    }
}
