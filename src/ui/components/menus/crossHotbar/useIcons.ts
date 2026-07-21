import { resources } from '@/resource';
import { ImageSource, SpriteSheet } from 'excalibur';

export function useIcons() {
    const getSkillIcon = async (col: number, row: number, src: ImageSource) => {
        return await SpriteSheet.fromImageSource({
            image: src,
            grid: {
                spriteHeight: 24,
                spriteWidth: 24,
                rows: 6,
                columns: 10,
            },
        }).getSpriteAsImage(col, row);
    };

    const getMenuIcon = async (col: number, row: number) => {
        return await SpriteSheet.fromImageSource({
            image: resources.image.icons.menu,
            grid: {
                spriteHeight: 32,
                spriteWidth: 32,
                rows: 16,
                columns: 8,
            },
        }).getSpriteAsImage(col, row);
    };
    return {
        getSkillIcon,
        getMenuIcon,
    };
}
