import { createStore } from 'vuex'
import Papa from "papaparse";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { getFirestore, addDoc, doc, getDoc, collection, setDoc, getDocs, deleteDoc } from "firebase/firestore";
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
        codebook: null,
        headers: [],
        uploadPercentage: -1,
    },
    getters: {
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        setCodebook(state, codebook) {
            state.codebook = codebook;
        },
        setHeaders(state, headers) {
            state.headers = headers;
        },
        setUploadPercentage(state, {complete, total}) {
            console.log("Set Store Upload Percentage", complete, total);
            if (complete == 0 || total == 0) {
                state.uploadPercentage = 0;
            }
            else {
                state.uploadPercentage = Math.round(complete / total * 100);
            }
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
                    dispatch('login', { email: originalEmail, password: userPass });
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
        async fetchCodebook({ commit }) {
            const codebook = {};

            // Get all documents in the variables collection
            const variablesCollection = collection(db, "variables");

            // Loop through all documents in the variables collection
            const snapshot = await getDocs(variablesCollection);

            snapshot.forEach((doc) => {
                // Add each document to the codebook object
                codebook[doc.id] = doc.data().variables;
            }
            );

            console.log(codebook);
            commit('setCodebook', codebook);
            return codebook;
        },
        async uploadCodebook({ commit, dispatch, state }, { codebookFile }) {
            console.log("\n------------------------------------------");
            console.log("UPLOAD CODEBOOK");
            console.log("------------------------------------------");

            // Set upload percentage to 0
            commit('setUploadPercentage', { complete: 0, total: 0 });
            // create copy of file
            const file = Object.assign({}, codebookFile);

            console.log(file);
            console.log("\nStep 1: Update Headers");
            const headers = file.headers;
            const codebook = file.rows;

            

            await dispatch('updateHeaders', { headers });

            console.log("\nStep 2: Get unique categories");
            const uniqueCategories = new Set();

            for (const row of codebook) {
                uniqueCategories.add(row["VariableCategory"]);
            }

            console.log("Unique Categories", uniqueCategories);

            console.log("\nStep 3: Generate composite codebook");
            const compositeCodebook = {};

            // Loop through all unique categories
            for (const category of uniqueCategories) {
                // Filter the codebook to only include variables from the current category
                if (category != "") {
                    const variables = codebook.filter(row => row["VariableCategory"] == category);

                    // Remove the "VariableCategory" key from each variable
                    for (const variable of variables) {
                        compositeCodebook[category] = variables.map(({ VariableCategory, ...rest }) => rest);
                    }

                }
            }

            console.log("Composite Codebook", compositeCodebook);

            console.log("\nStep 4: Delete variables collection in Firestore");
            await dispatch('deleteVariablesCollection');

            console.log("\nStep 5: Upload composite codebook to Firestore");
            const variablesCollection = collection(db, "variables");

            for (const category in compositeCodebook) {
                // For each category, add a document to the variables collection, with the category as the document ID
                await setDoc(doc(variablesCollection, category), {
                    variables: compositeCodebook[category]
                });
                console.log("Uploading", category);
                console.log("completed", Object.keys(compositeCodebook).indexOf(category) + 1, "out of", Object.keys(compositeCodebook).length);
                commit('setUploadPercentage', { complete: Object.keys(compositeCodebook).indexOf(category) + 1, total: Object.keys(compositeCodebook).length });
            }

            commit('setUploadPercentage', { complete: 1, total: 1 });
            
        },
        async deleteVariablesCollection() {
            const variablesCollection = collection(db, "variables");
            const snapshot = await getDocs(variablesCollection);

            snapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
        },
        async updateHeaders({ commit }, { headers }) {
            // Add the headers to the headers document in the codebookData collection
            await setDoc(doc(db, "codebookData", "headers"), {
                headers: headers
            }, { merge: true });
            commit('setHeaders', headers);
        },
        async fetchHeaders({ commit }) {
            // Get the headers document from the codebookData collection
            const headersDoc = doc(db, "codebookData", "headers");
            const headersDocSnap = await getDoc(headersDoc);
            const headers = headersDocSnap.data().headers;
            commit('setHeaders', headers);
            return headers;
        },
        async downloadCodebook({ commit, dispatch }) {
            console.log("\n------------------------------------------");
            console.log("DOWNLOAD CODEBOOK");
            console.log("------------------------------------------");

            console.log("\nStep 1: Fetch Headers");
            const headers = await dispatch('fetchHeaders');
            console.log("Headers", headers);

            console.log("\nStep 2: Get raw codebook");
            const rawCodebook = this.state.codebook;
            console.log("Raw Codebook", rawCodebook);

            console.log("\nStep 3: Create codebook array");
            // Loop through all variable categories
            const codebookArray = [];

            for (const category in rawCodebook) {
                const variables = rawCodebook[category];

                // Loop through all variables in the category
                for (const variable of variables) {
                    // Create an entry for each variable
                    const entry = { "VariableCategory": category };

                    for (const header of headers) {
                        if (header == "VariableCategory") {
                            continue;
                        }

                        // Add each variable to the entry
                        if (header in variable) {
                            entry[header] = variable[header];
                        }
                        else {
                            entry[header] = "";
                        }
                    }

                    codebookArray.push(entry);
                }
            }
            console.log("Codebook Array", codebookArray);

            console.log("\nStep 4: Convert codebook array to CSV");
            const codebookCSV = Papa.unparse(codebookArray);

            console.log("\nStep 5: Download CSV file");
            const element = document.createElement("a");
            const file = new Blob([codebookCSV], { type: "text/csv" });
            element.href = URL.createObjectURL(file);
            element.download = "CodeBook.csv";
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
        },
    },
    modules: {
    }
})
