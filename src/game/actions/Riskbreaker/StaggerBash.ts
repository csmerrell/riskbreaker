import { Skill } from '../Skill';
import { TargetComponent } from '../TargetComponent';

export class StaggerBashSkill extends Skill {
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
