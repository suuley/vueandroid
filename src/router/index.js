import { createRouter, createWebHistory } from 'vue-router'
import SearchView from '../views/SearchView.vue'
import TableView from '../views/TableView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'search', component: SearchView },
    { path: '/table', name: 'table', component: TableView }
  ]
})

export default router