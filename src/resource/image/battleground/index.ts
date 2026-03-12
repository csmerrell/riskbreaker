import { LaneKey } from '@/state/useParty';
import { ImageSource } from 'excalibur';

export const battleground = {
    backShadowTrees: new ImageSource('/image/battle/BackShadowTrees.png'),
    left: new ImageSource('/image/battle/Left.png'),
    leftMid: new ImageSource('/image/battle/LeftMid.png'),
    mid: new ImageSource('/image/battle/Mid.png'),
    rightMid: new ImageSource('/image/battle/RightMid.png'),
    right: new ImageSource('/image/battle/Right.png'),
    grassRing: new ImageSource('/image/battle/GrassRing.png'),
    dirtRing: new ImageSource('/image/battle/DirtRing.png'),
    backDeco: new ImageSource('/image/battle/BackDeco.png'),
    frontDeco: new ImageSource('/image/battle/FrontDeco.png'),
    frontShadowTrees: new ImageSource('/image/battle/FrontShadowTrees.png'),
};

export function toLayerArray(
    bg: typeof battleground,
    type: 'grass' | 'dirt',
): {
    sources: ImageSource[];
    zIndex: number;
    lane?: LaneKey;
    isGround?: boolean;
}[] {
    const {
        backShadowTrees,
        left,
        leftMid,
        mid,
        rightMid,
        right,
        backDeco,
        frontDeco,
        frontShadowTrees,
    } = bg;

    return [
        {
            sources: [backShadowTrees],
            zIndex: 1000,
        },
        {
            sources: [left],
            zIndex: 1010,
            lane: 'left-2',
        },
        {
            sources: [leftMid],
            zIndex: 1010,
            lane: 'left-1',
        },
        {
            sources: [mid],
            zIndex: 1010,
            lane: 'mid',
        },
        {
            sources: [rightMid],
            zIndex: 1010,
            lane: 'right-1',
        },
        {
            sources: [right],
            zIndex: 1010,
            lane: 'right-2',
        },
        { sources: [bg[`${type}Ring`], backDeco], zIndex: 1020, isGround: true },
        { sources: [frontDeco, frontShadowTrees], zIndex: 1030 },
    ];
}
