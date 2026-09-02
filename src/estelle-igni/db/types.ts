import { ImageSource } from 'excalibur';

export type SpriteSheetDefinition = {
    sourceName: string;
    cellHeight: number;
    cellWidth: number;
    numCols: number;
    numRows: number;
    flipHorizontal?: boolean;
};

export type AnimationMetadata = InternalSheetAnimation | ExternalSheetAnimation;

export type InternalSheetAnimation = {
    row: number;
    startFrame: number;
    frameCount: number;
    frameDuration: number;
};

export type ExternalSheetAnimation = {
    isExternal: true;
    name: string;
    sheet: SpriteSheetDefinition;
    anim: InternalSheetAnimation;
};

export type SourceMappedSpriteSheet = SpriteSheetDefinition & {
    source: ImageSource;
};

export function isExternalAnimation(anim: AnimationMetadata): anim is ExternalSheetAnimation {
    return 'isExternal' in anim && anim.isExternal === true;
}

export function isInternalAnimation(anim: AnimationMetadata): anim is InternalSheetAnimation {
    return !('isExternal' in anim);
}

export function isSourceMappedSpriteSheet(
    sheet: SpriteSheetDefinition,
): sheet is SourceMappedSpriteSheet {
    return 'source' in sheet && sheet.source instanceof ImageSource;
}
