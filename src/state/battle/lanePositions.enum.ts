import { vec } from 'excalibur';

export const LANE_POSITIONS = {
    'left-2': [
        [],
        [vec(-100, 24)],
        [vec(-108, 8), vec(-96, 24)],
        [vec(-88, 8), vec(-108, 12), vec(-96, 24)],
    ],
    'left-1': [
        [],
        [vec(-52, 16)],
        [vec(-48, 16), vec(-60, 28)],
        [vec(-32, 8), vec(-60, 20), vec(-44, 28)],
    ],
    mid: [[], [vec(0, 20)], [vec(-8, 8), vec(8, 24)], [vec(-8, 4), vec(8, 16), vec(-4, 24)]],
    'right-1': [
        [],
        [vec(48, 16)],
        [vec(60, 12), vec(48, 28)],
        [vec(32, 8), vec(60, 20), vec(44, 28)],
    ],
    'right-2': [
        [],
        [vec(100, 24)],
        [vec(96, 28), vec(112, 12)],
        [vec(88, 8), vec(108, 16), vec(96, 28)],
    ],
};
