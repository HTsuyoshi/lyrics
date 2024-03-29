import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import Night_dancer from './pages/Night_dancer.vue'
import Senbonzakura from './pages/Senbonzakura.vue'
import Cupid from './pages/Cupid.vue'
import Paranoia from './pages/Paranoia.vue'

const router = createRouter({
	history: createWebHistory(),
	routes: [ {
			path: '/lyrics',
			name: 'Home',
			component: Home
		},
		{
			path: '/lyrics/night_dancer',
			name: 'Night_dancer',
			component: Night_dancer
		},
		{
			path: '/lyrics/senbonzakura',
			name: 'Senbonzakura',
			component: Senbonzakura
		},
		{
			path: '/lyrics/cupid',
			name: 'Cupid',
			component: Cupid
		},
		{
			path: '/lyrics/paranoia',
			name: 'Paranoia',
			component: Paranoia
		},
	]
})

export default router;
