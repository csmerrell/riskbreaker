import { vec } from 'excalibur';
import { makeState } from './Observable';

const positions = makeState({
    left: {
        1: [vec(50, 92)],
        2: [vec(58, 80), vec(44, 98)],
        3: [vec(40, 80), vec(58, 90), vec(45, 100)],
    },
    leftMid: {
        1: [vec(94, 82)],
        2: [vec(104, 78), vec(84, 95)],
        3: [vec(108, 76), vec(82, 82), vec(86, 98)],
    },
    mid: {
        1: [vec(148, 88)],
        2: [vec(140, 78), vec(158, 95)],
        3: [vec(140, 78), vec(160, 90), vec(134, 97)],
    },
    rightMid: {
        1: [vec(204, 82)],
        2: [vec(204, 78), vec(214, 95)],
        3: [vec(186, 85), vec(210, 76), vec(206, 98)],
    },
    right: {
        1: [vec(254, 82)],
        2: [vec(254, 78), vec(264, 95)],
        3: [vec(238, 78), vec(262, 88), vec(248, 98)],
    },
});

export function useBattleState() {
    return {
        positions,
    };
}
