import { Skill, SkillConfig } from '../Skill';
import { TargetComponent } from '../TargetComponent';

export class CompressSkill extends Skill {
    constructor(cfg: SkillConfig) {
        super(cfg);
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
