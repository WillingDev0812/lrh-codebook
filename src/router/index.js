import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'Log In',
    component: () => import('../views/auth/Login.vue')
  },
  {
    path: '/logout',
    name: 'Log Out',
    component: () => import('../views/auth/Logout.vue'),
    meta: {
        requiresAuth: true
    }
  },
  {
    path: '/new-account',
    name: 'New Account',
    component: () => import('../views/auth/NewAccount.vue'),
    meta: {
        requiresAuth: true
    }
  },
  {
    path: '/upload',
    name: 'Upload Codebook',
    component: () => import('../views/Upload.vue'),
    meta: {
        requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const removeListener = onAuthStateChanged(
            getAuth(),
            (user) => {
                removeListener();
                resolve(user);
            },
            reject
        );
    });
};

// Prevent user from going to certain routes when not logged in
router.beforeEach(async (to, from, next) => {
    // Check firebase auth status
    const user = await getCurrentUser();

    //  If the route requires auth, but the user is not logged in, redirect to login
    if (to.matched.some(record => record.meta.requiresAuth) && !user) {
        next('/login');
    } else {
        next();
    }
});

export default router
