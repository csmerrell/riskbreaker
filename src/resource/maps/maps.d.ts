import { maps } from '.';

type KeyPointZone = {
    type: 'region' | 'subZone' | 'city';
    key: string;
    posOverride?: Vector;
};

type KeyPointInteraction = {
    type: 'interactable';
    onInteract: () => void;
};

type KeyPointLightSource = {
    type: 'lightSource';
    radius: number;
    offset?: Vector;
};

type KeyPointBase = {
    type: 'bonfire';
};
export type ZoneOmittedKeyPoint = KeyPointInteraction | KeyPointLightSource | KeyPointBase;

export type KeyPointType =
    | 'region'
    | 'subZone'
    | 'modalScene'
    | 'city'
    | 'interactable'
    | 'lightSource'
    | 'bonfire';
export type KeyPointMeta = {
    type: KeyPointType;
} & (KeyPointZone | KeyPointInteraction | KeyPointLightSource | KeyPointBase);

export type MapMeta = {
    type: KeyPointType;
    key: string;
    name: string;
    startPos: Vector;
    map: TiledResource;
    keyPoints: Record<string, KeyPointMeta>;
};

export type MapMetaKeyed = MapMeta & { key: keyof typeof maps };
