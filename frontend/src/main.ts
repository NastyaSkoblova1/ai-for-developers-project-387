import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import App from './App.vue'
import './assets/theme/custom-theme.css'

/* Layouts */
import PublicLayout from './layouts/PublicLayout.vue'
import AdminLayout from './layouts/AdminLayout.vue'

/* Views */
import HomeView from './views/HomeView.vue'
import BookingView from './views/BookingView.vue'
import AdminDashboardView from './views/AdminDashboardView.vue'
import AdminEventTypesView from './views/AdminEventTypesView.vue'
import AdminEventTypeFormView from './views/AdminEventTypeFormView.vue'
import AdminBookingsView from './views/AdminBookingsView.vue'

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'book/:eventTypeId', name: 'booking', component: BookingView, props: true },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', name: 'admin-dashboard', component: AdminDashboardView },
      { path: 'event-types', name: 'admin-event-types', component: AdminEventTypesView },
      { path: 'event-types/new', name: 'admin-event-type-new', component: AdminEventTypeFormView },
      { path: 'event-types/:id/edit', name: 'admin-event-type-edit', component: AdminEventTypeFormView, props: true },
      { path: 'bookings', name: 'admin-bookings', component: AdminBookingsView },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)

app.use(router)
app.use(VueQueryPlugin)
app.use(ToastService)
app.use(ConfirmationService)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: false,
      cssLayer: false,
    },
  },
})

app.mount('#app')
