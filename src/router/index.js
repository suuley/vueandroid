import { createRouter, createWebHistory } from 'vue-router'
import SearchView from '../views/SearchView.vue'
import RegisterView from '../views/RegisterView.vue'
import PaymentView from '../views/PaymentView.vue'
import TableView from '../views/TableView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'search', component: SearchView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/payment', name: 'payment', component: PaymentView },
    { path: '/payment', name: 'payment', component: PaymentView }
  ]
})

export default router