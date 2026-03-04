export type UnitStatFields = {
    hp: number;
    speed: number;

    //phys
    strength: number;
    dexterity: number;
    balance: number;

    //mental
    intelligence: number;
    wisdom: number;
    lucidity: number;

    //def
    fortitude: number;
};

export type UnitStats = UnitStatFields & {
    mods: Record<keyof UnitStatFields, { modValue: number; duration: number }[]>;
    effects: Partial<StatusEffects>;
};

export function emptyStatMods() {
    return {
        hp: [],
        speed: [],

        //phys
        strength: [],
        dexterity: [],
        balance: [],

        //mental
        intelligence: [],
        wisdom: [],
        lucidity: [],

        //def
        fortitude: [],
    };
}

export type StatusEffects = {
    poison: number;
    sleep: number;
    poised: number;
};

export function getEffectiveStat(key: keyof UnitStatFields, unitStats: UnitStats) {
    return unitStats[key] + unitStats.mods[key].reduce((acc, mod) => (acc += mod.modValue), 0);
}

export function tickStatMods(unitStats: UnitStats) {
    const ticked = {
        ...unitStats,
    };

    (Object.keys(ticked.mods) as (keyof UnitStatFields)[]).forEach((key) => {
        ticked.mods[key] = ticked.mods[key]
            .map((mod) => ({ ...mod, duration: mod.duration - 1 }))
            .filter((mod) => mod.duration !== 0);
    });
}

export function tickStatusEffects(_unitStats: UnitStats) {
    throw new Error('[tickStatusEffects] >> Not Yet Implemented.');
}
