import { vec } from 'excalibur';

export const LANE_POSITIONS = {
    'left-2': [
        [],
        [vec(-23, 6)],
        [vec(-25, 2), vec(-22, 6)],
        [vec(-20, 2), vec(-25, 3), vec(-22, 6)],
    ],
    'left-1': [
        [],
        [vec(-12, 4)],
        [vec(-11, 4), vec(-14, 7)],
        [vec(-8, 2), vec(-14, 5), vec(-10, 7)],
    ],
    mid: [[], [vec(0, 5)], [vec(-2, 2), vec(2, 6)], [vec(-2, 1), vec(2, 4), vec(-1, 6)]],
    'right-1': [[], [vec(11, 3)], [vec(14, 3), vec(11, 7)], [vec(8, 2), vec(14, 5), vec(10, 7)]],
    'right-2': [[], [vec(23, 6)], [vec(22, 7), vec(26, 3)], [vec(20, 2), vec(25, 4), vec(22, 7)]],
};
