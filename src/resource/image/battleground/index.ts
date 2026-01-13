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

export function toLayerArray(bg: typeof battleground, type: 'grass' | 'dirt') {
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
        backShadowTrees,
        left,
        leftMid,
        mid,
        rightMid,
        right,
        bg[`${type}Ring`],
        backDeco,
        frontDeco,
        frontShadowTrees,
    ];
}
