import { Actor, vec } from 'excalibur';
import { HexTile } from './HexTile';
import { useBattlefield } from '@/state/useBattlefield';
import { getGameCoords } from '@/lib/helpers/screen.helper';
import { StrategemActor } from '../StrategemActor/StrategemActor';

export const hexTileMap = {
    0: 'N',
    N: 0,
    mid_top: 0,
    1: 'NW',
    NW: 1,
    back_top: 1,
    2: 'NE',
    NE: 2,
    front_top: 2,
    3: 'C',
    C: 3,
    mid_mid: 3,
    4: 'SW',
    SW: 4,
    back_bottom: 4,
    5: 'SE',
    SE: 5,
    front_bottom: 5,
    6: 'S',
    S: 6,
    mid_bottom: 6,
};

export type TileKey = keyof typeof hexTileMap;
export class TileField extends Actor {
    private tiles: HexTile[] = [];
    private actors: StrategemActor[] = [];

    constructor(public alignment: 'party' | 'enemy') {
        super();

        this.addTiles();
    }

    private addTiles() {
        const invert = this.alignment === 'enemy';
        let xStagger = [-33, -66, -11, -44, -77, -22, -55];
        if (invert) {
            xStagger = xStagger.map((val) => val * -1);
        }
        const yStagger = [-38, -33, -24, -19, -14, -5, 0];

        yStagger.forEach((yVal, idx: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
            this.tiles.push(
                new HexTile({
                    pos: vec(xStagger[idx], yVal),
                    invert,
                    cardinality: hexTileMap[idx],
                }),
            );
        });

        this.tiles.forEach((tile) => {
            this.addChild(tile);
        });
    }

    public setAnchor(el: HTMLElement) {
        const { bottom, left, right } = el.getBoundingClientRect();
        const invert = this.alignment === 'enemy';

        let side;
        if (this.alignment === 'party') {
            side = left;
        } else {
            side = right;
        }

        const { x, y } = getGameCoords({ x: side, y: bottom });
        const tileY = this.tiles[hexTileMap.S].pos.y - 12;
        const tileX = this.tiles[hexTileMap.SW].pos.x - (invert ? -19 : 19);
        const diffX = x - tileX;
        const diffY = y + tileY;

        this.tiles.forEach((tile) => {
            tile.pos.x = tile.fieldPosition.x + diffX;
            tile.pos.y = tile.fieldPosition.y + diffY;
        });
    }

    public addActor(actor: StrategemActor) {
        this.actors.push(actor);
    }

    public getHex(hex: TileKey) {
        return this.tiles[hexTileMap[hex]];
    }
}
