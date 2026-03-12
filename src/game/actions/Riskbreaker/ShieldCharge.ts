import { TargetComponent } from '../TargetComponent';
import { Skill } from '../Skill';

export class ShieldChargeSkill extends Skill {
    constructor() {
        super();
        this.addComponent(
            new TargetComponent({
                targetPriority: 'enemy',
                targetTypes: ['enemy'],
                areaType: 'single',
            }),
        );
    }

    public async activate() {
        return this.get(TargetComponent).promptTarget();
    }
}
