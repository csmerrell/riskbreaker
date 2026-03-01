import { docManager } from '@/db';
import { makeState } from './Observable';
import { CompositeActorConfig } from '@/game/actors/CompositeActor/CompositeActor';
import type { EquipmentSlotKey, StaticEquipmentKey } from '@/db/static/types/Equipment';
import { AstrologianDefault, RiskbreakerDefault } from './defaults/party';

export type LaneKey = 'left-2' | 'left-1' | 'mid' | 'right-1' | 'right-2';

export type PartyMember = {
    name: string;
    id: string;
    config: {
        leader?: boolean;
        battlePosition: LaneKey;
    };
    appearance: CompositeActorConfig;
    equipment: Partial<Record<EquipmentSlotKey, StaticEquipmentKey>>;
    skills: Record<string, unknown>;
    passives: Record<string, unknown>;
};

export type PartyState = {
    party: PartyMember[];
};

const partyState = makeState<PartyState>({
    party: [],
});

function getLeader() {
    return partyState.value.party.find((m) => m.config.leader)!;
}

function addPartyMember(member: PartyMember) {
    if (partyState.value.party.length === 2) {
        throw new Error('Cannot safely support more than 2 party members');
    }
    partyState.set({
        ...partyState.value,
        party: [...partyState.value.party, member],
    });
}

function removePartyMember(id: string) {
    const idx = partyState.value.party.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('party member not found in call to [updatePartyMember]');
    partyState.set({
        ...partyState.value,
        party: [...partyState.value.party.slice(0, idx), ...partyState.value.party.slice(idx + 1)],
    });
}

function updatePartyMember(member: PartyMember) {
    const idx = partyState.value.party.findIndex((m) => m.id === member.id);
    if (idx === -1) throw new Error('party member not found in call to [updatePartyMember]');
    partyState.set({
        ...partyState.value,
        party: [
            ...partyState.value.party.slice(0, idx),
            member,
            ...partyState.value.party.slice(idx + 1),
        ],
    });
}

async function loadParty() {
    try {
        const { party } = (await docManager.tryGet<PartyState>('_local/settings')) as PartyState;
        partyState.value = {
            party: party ?? [RiskbreakerDefault, AstrologianDefault],
        };
    } catch (_e) {
        await saveParty();
    }
}

async function saveParty() {
    const { party } = partyState.value;
    await docManager.upsert('_local/settings', {
        party,
    });
}

const loaded = makeState(false);
loadParty().then(() => {
    loaded.set(true);
});

export function useParty() {
    return {
        loaded,
        partyState,
        getLeader,
        loadParty,
        addPartyMember,
        removePartyMember,
        updatePartyMember,
        saveParty,
    };
}
