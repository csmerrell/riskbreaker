import { Actor, Color, Rectangle, Scene, vec, Vector } from 'excalibur';
import { SceneManager } from '../SceneManager';
import { BattleManager } from './BattleManager';
import { useParty } from '../useParty';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { useBattle } from '../useBattle';
import { KeyedAnimationActor } from '@/game/actors/KeyedAnimationActor';
import { colors } from '@/lib/enum/colors.enum';
import { getScale } from '@/lib/helpers/screen.helper';

type ForecastActor = (KeyedAnimationActor | CompositeActor) & {
    forecastId: string;
    transforms: { scale?: Vector; offset?: Vector };
};
export class ForecastManager extends SceneManager {
    public scene: Scene;
    constructor(private parent: BattleManager) {
        super(parent);
        this.scene = parent.scene;
    }

    private forecast: ForecastActor[] = [];
    private forecastTiles: Actor[] = [];
    private forecastActors: ForecastActor[] = [];
    public updateForecast() {
        this.forecast = [
            ...this.forecastActors,
            ...this.forecastActors,
            ...this.forecastActors,
            ...this.forecastActors,
        ].slice(0, 10);
        this.forecast.forEach((forecasted, idx) => {
            const _tile = this.addTile(forecasted, idx);
        });
    }

    private collectForecastActors() {
        const party = useParty().partyState.value.party;
        this.forecastActors = this.forecastActors.concat(
            party.map((member) => {
                const { mainHand, offHand, ...appearance } = member.appearance;
                const actor = new CompositeActor({
                    offset: vec(0, 4),
                    height: 12,
                    width: 24,
                    ...appearance,
                });
                (actor as ForecastActor).forecastId = member.id;
                return actor as ForecastActor;
            }),
        );
        const enemies = useBattle().battleState.value.enemies;
        this.forecastActors = this.forecastActors.concat(
            enemies.map((enemy) => {
                const { scale, offset } = enemy.actor.getHeadshotTransforms();
                const actor = enemy.actor.cloneStatic({
                    scale,
                    offset,
                    height: 12,
                    width: 24,
                }) as ForecastActor;
                actor.forecastId = enemy.id;
                return actor;
            }),
        );
    }

    private addTile(forecasted: ForecastActor, idx: number) {
        const rectOuter = new Rectangle({
            height: 12,
            width: 24,
            color: Color.fromHex(colors.gold),
        });
        const rectInner = new Rectangle({
            height: 12 - 0.99 / getScale(),
            width: 24 - 0.99 / getScale(),
            color: Color.fromHex(colors.bg),
        });
        const rectInnerActor = new Actor({
            offset: vec(1 / getScale(), 1 / getScale()),
        });
        rectInnerActor.graphics.add(rectInner);
        const wrapper = new Actor({
            height: 12,
            width: 24,
        });
        wrapper.graphics.add(rectOuter);
        wrapper.addChild(rectInnerActor);
        const clone = forecasted.cloneStatic();
        wrapper.addChild(clone);
        wrapper.pos = this.scene.camera.pos
            .add(
                vec(
                    4 + visualViewport!.width / -2 / getScale() + 23 * idx,
                    visualViewport!.height / -2 / getScale() + 2,
                ),
            )
            .add(vec(rectOuter.width / 2, rectOuter.height / 2));
        wrapper.z = 1003;
        this.scene.add(wrapper);
        setTimeout(() => {
            clone.useAnimation('static');
        });
        return wrapper;
    }

    public init() {
        this.collectForecastActors();
        this.updateForecast();
    }

    public cleanup() {}
}
