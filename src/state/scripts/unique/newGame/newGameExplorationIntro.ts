import { useExploration } from '@/state/useExploration';
import { GameScript } from '../../types/GameScript';
import { useParty } from '@/state/useParty';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { LightSource } from '@/game/actors/LightSource/LightSource.component';
import { maps } from '@/resource/maps';

export const newGameExplorationIntro: GameScript = {
    events: [
        async () => {
            const explorationMgr = useExploration().getExplorationManager();
            await explorationMgr.ready();
            const leader = useParty().getLeader();
            const actor = new CompositeActor({
                ...leader.appearance,
            });
            actor.partyId = leader.id;
            actor.addComponent(new LightSource({ radius: 2 }));

            const actorMgr = explorationMgr.actorManager;
            actorMgr.addPlayer(actor);

            const mapMgr = explorationMgr.mapManager;
            mapMgr.placePlayerAtTile(maps.intro.startPos);
        },
    ],
};
