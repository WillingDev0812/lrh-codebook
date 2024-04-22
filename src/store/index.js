import { createStore } from 'vuex'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBvBL5nTfjdu85awdDkGTS-HtlUvTLcD2U",
    authDomain: "lrh-codebook.firebaseapp.com",
    projectId: "lrh-codebook",
    storageBucket: "lrh-codebook.appspot.com",
    messagingSenderId: "19502263714",
    appId: "1:19502263714:web:563e622ef36866ca5d16fb",
    measurementId: "G-VE6JHR065F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
export default createStore({
    state: {
        user: null,

    },
    getters: {
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
    },
    actions: {
        // Login
        async login({ commit }, { email, password }) {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                commit('setUser', user);
                return null;
            } catch (error) {
                alert(error);
                return error;
            }
        },
        // Reauthenticate
        async reauthenticate({ commit }, { password }) {
            try {
                const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
                await reauthenticateWithCredential(auth.currentUser, credential);
                return null;
            } catch (error) {
                return error;
            }
        },
        // Logout
        async logout({ commit }) {
            try {
                await auth.signOut();
                commit('setUser', null);
                return Promise.resolve();
            } catch (error) {
                return Promise.reject(error);
            }
        },
        // Create new account only if another account is already signed in
        async createAccount({ commit, dispatch }, { email, password, userPass }) {
            // Check if user is already signed in
            if (auth.currentUser) {
                try {
                    const originalEmail = auth.currentUser.email;
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    auth.signOut();
                    // call signIn method
                    dispatch('login', { email: originalEmail, password: userPass});
                    return null;
                } catch (error) {
                    return error;
                }
            }
            else {
                return Promise.reject("Only admins can create new accounts. Please sign in first.");
            }
        },
        // Forgot password
        async forgotPassword({ commit }, email) {
            try {
                await sendPasswordResetEmail(auth, email);
                return Promise.resolve();
            } catch (error) {
                return Promise.reject(error);
            }
        },
        // Update password
        async updatePassword({ commit }, password) {
            try {
                await updatePassword(auth.currentUser, password);
                return Promise.resolve();
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    modules: {
    }
})
