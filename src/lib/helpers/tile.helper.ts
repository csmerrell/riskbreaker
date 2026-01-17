import { Vector } from 'excalibur';
import { TileLayer } from '@excaliburjs/plugin-tiled/build/umd/src/resource/tile-layer';

// Tiled GID flag constants
const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG = 0x20000000;
const TILE_ID_MASK = 0x1fffffff;

/**
 * Direction type for tile edges
 */
export type Dir = 'N' | 'E' | 'S' | 'W';

/**
 * Interface for tile edge connectivity
 */
export interface TileEdges {
    N: boolean;
    E: boolean;
    S: boolean;
    W: boolean;
}

/**
 * Decoded GID information
 */
export interface DecodedGID {
    id: number;
    flipH: boolean;
    flipV: boolean;
    flipD: boolean;
}

/**
 * Decode Tiled GID to extract tile ID and flip flags
 */
export function decodeGID(gid: number): DecodedGID {
    return {
        id: gid & TILE_ID_MASK,
        flipH: (gid & FLIPPED_HORIZONTALLY_FLAG) !== 0,
        flipV: (gid & FLIPPED_VERTICALLY_FLAG) !== 0,
        flipD: (gid & FLIPPED_DIAGONALLY_FLAG) !== 0,
    };
}

/**
 * Apply horizontal/vertical flips to tile edges
 */
export function applyFlip(edges: TileEdges, flipH: boolean, flipV: boolean): TileEdges {
    const newEdges = { ...edges };
    if (flipH) [newEdges.E, newEdges.W] = [newEdges.W, newEdges.E];
    if (flipV) [newEdges.N, newEdges.S] = [newEdges.S, newEdges.N];
    return newEdges;
}

/**
 * Apply diagonal flip (transpose across main diagonal: N↔W, E↔S)
 */
export function applyDiagonalFlip(edges: TileEdges): TileEdges {
    return {
        N: edges.W,
        E: edges.S,
        S: edges.E,
        W: edges.N,
    };
}

/**
 * Extract edge properties from a tile's Tiled properties
 */
export function getEdgesFromTile(tile: {
    tiledTile?: { properties: Map<string, unknown> };
}): TileEdges {
    if (!tile.tiledTile) {
        return { N: false, E: false, S: false, W: false };
    }
    return {
        N: (tile.tiledTile.properties.get('edge_n') as boolean) || false,
        E: (tile.tiledTile.properties.get('edge_e') as boolean) || false,
        S: (tile.tiledTile.properties.get('edge_s') as boolean) || false,
        W: (tile.tiledTile.properties.get('edge_w') as boolean) || false,
    };
}

/**
 * Check if a tile has any edge properties defined
 */
export function hasEdgeProperties(tile: {
    tiledTile?: { properties: Map<string, unknown> };
}): boolean {
    if (!tile.tiledTile) return false;
    return (
        tile.tiledTile.properties.has('edge_n') ||
        tile.tiledTile.properties.has('edge_e') ||
        tile.tiledTile.properties.has('edge_s') ||
        tile.tiledTile.properties.has('edge_w')
    );
}

/**
 * Get transformed edges for a tile at given coordinates
 */
export function getTileEdgesAt(layer: TileLayer, x: number, y: number): TileEdges | null {
    // Check bounds
    if (x < 0 || x >= layer.width || y < 0 || y >= layer.height) return null;

    // Get tile at coordinates
    const tile = layer.getTileByCoordinate(x, y);
    if (!tile) return null;

    // Get base edges from tile properties
    const baseEdges = getEdgesFromTile(tile);

    // If no edge properties are defined at all, return null
    if (!hasEdgeProperties(tile)) return null;

    // Get GID from layer data
    const index = y * layer.width + x;
    const gidRaw = layer.tiledTileLayer.data[index];
    if (!gidRaw) return null;

    // Convert GID to number if it's a string
    const gid = typeof gidRaw === 'string' ? parseInt(gidRaw, 10) : gidRaw;

    // Decode GID and apply transformations
    const { flipH, flipV, flipD } = decodeGID(gid);

    let transformed = { ...baseEdges };

    // Apply diagonal flip (transpose) first if needed
    if (flipD) {
        transformed = applyDiagonalFlip(transformed);
    }

    // Then apply horizontal/vertical flips
    if (flipH || flipV) {
        transformed = applyFlip(transformed, flipH, flipV);
    }

    return transformed;
}

/**
 * Determine if movement is possible between two adjacent tile coordinates
 */
export function canMoveBetween(fromCoord: Vector, toCoord: Vector, layer: TileLayer): boolean {
    // Get edges for both tiles
    const fromEdges = getTileEdgesAt(layer, fromCoord.x, fromCoord.y);
    const toEdges = getTileEdgesAt(layer, toCoord.x, toCoord.y);

    if (!fromEdges || !toEdges) return false;

    // Calculate direction vector
    const dx = toCoord.x - fromCoord.x;
    const dy = toCoord.y - fromCoord.y;

    // Check if tiles are adjacent and both allow movement in the required direction
    if (dx === 1 && dy === 0) return fromEdges.E && toEdges.W; // Moving right
    if (dx === -1 && dy === 0) return fromEdges.W && toEdges.E; // Moving left
    if (dx === 0 && dy === 1) return fromEdges.S && toEdges.N; // Moving down
    if (dx === 0 && dy === -1) return fromEdges.N && toEdges.S; // Moving up

    return false; // not adjacent or diagonal movement
}
