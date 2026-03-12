import { Skill } from './Skill';
import { TargetComponent } from './TargetComponent';

export class AttackSkill extends Skill {
    constructor() {
        super();
        this.addComponent(
            new TargetComponent({
                targetTypes: ['enemy', 'ally'],
                targetPriority: 'enemy',
                areaType: 'single',
            }),
        );
    }

    public async activate() {
        return this.get(TargetComponent).promptTarget();
    }
}
