import { vec } from 'excalibur';

export const LANE_POSITIONS = {
    'left-2': [
        [],
        [vec(-25, 6)],
        [vec(-27, 2), vec(-24, 6)],
        [vec(-22, 2), vec(-27, 3), vec(-24, 6)],
    ],
    'left-1': [
        [],
        [vec(-13, 4)],
        [vec(-12, 4), vec(-15, 7)],
        [vec(-8, 2), vec(-15, 5), vec(-11, 7)],
    ],
    mid: [[], [vec(0, 5)], [vec(-2, 2), vec(2, 6)], [vec(-2, 1), vec(2, 4), vec(-1, 6)]],
    'right-1': [[], [vec(12, 4)], [vec(15, 3), vec(12, 7)], [vec(8, 2), vec(15, 5), vec(11, 7)]],
    'right-2': [[], [vec(25, 6)], [vec(24, 7), vec(28, 3)], [vec(22, 2), vec(27, 4), vec(24, 7)]],
};
