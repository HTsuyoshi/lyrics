import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import Lyrics from './pages/Lyrics.vue'

const router = createRouter({
	history: createWebHistory(),
	routes: [ {
			path: '/lyrics',
			name: 'Home',
			component: Home
		},
		{
			path: '/lyrics/teste',
			name: 'Lyrics',
			component: Lyrics
		},
	]
})

export default router;
