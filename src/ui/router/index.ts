import { createRouter, createWebHashHistory } from 'vue-router';
import TitleScreen from '@/ui/views/TitleScreen/TitleScreen.vue';
import LoadingScreen from '@/ui/views/Loading/LoadingScreen.vue';
import PartyMenu from '@/ui/views/PartyMenu/PartyMenu.vue';
import BattleScreen from '../views/BattleScreen/BattleScreen.vue';
import TestView from '../views/TestView/TestView.vue';

const router = createRouter({
    history: createWebHashHistory('/'),
    routes: [
        {
            path: '/',
            name: 'default',
            redirect: '/loading',
        },
        {
            path: '/title',
            name: 'title_screen',
            component: TitleScreen,
        },
        {
            path: '/loading',
            name: 'loading',
            component: LoadingScreen,
        },
        {
            path: '/party',
            name: 'party_menu',
            component: PartyMenu,
        },
        {
            path: '/battle',
            name: 'battle',
            component: BattleScreen,
        },
        {
            path: '/test',
            name: 'test',
            component: TestView,
        },
    ],
});

export default router;
