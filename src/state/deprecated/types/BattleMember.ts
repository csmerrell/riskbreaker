import type { UnitClassKey } from '@/db/units/BattleUnit';
import type { StrategemActor } from '@/game/actors/StrategemActor/StrategemActor';

type BattleLineKey = 'front' | 'mid' | 'back';
type BattleCellKey = 'top' | 'mid' | 'bottom';

export type BattleMember<T extends 'party' | 'enemy' = 'party'> = {
    class: UnitClassKey;
    line: BattleLineKey;
    cell: BattleCellKey;
    enemy: T extends 'party' ? false : true;
};

export type BattleMemberReady<T extends 'party' | 'enemy' = 'party'> = BattleMember<T> & {
    actor: StrategemActor;
};
