import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import Night_dancer from './pages/Night_dancer.vue'
import Senbonzakura from './pages/Senbonzakura.vue'
import Cupid from './pages/Cupid.vue'
import Paranoia from './pages/Paranoia.vue'

const router = createRouter({
	history: createWebHistory(),
	routes: [ {
			path: '/',
			name: 'Home',
			component: Home
		},
		{
			path: '/night_dancer',
			name: 'Night_dancer',
			component: Night_dancer
		},
		{
			path: '/senbonzakura',
			name: 'Senbonzakura',
			component: Senbonzakura
		},
		{
			path: '/cupid',
			name: 'Cupid',
			component: Cupid
		},
		{
			path: '/paranoia',
			name: 'Paranoia',
			component: Paranoia
		},
	]
})

export default router;
