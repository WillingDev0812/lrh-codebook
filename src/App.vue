
<template>
	<Navbar :user="user"/>
	<div class="router-view">
		<router-view />
	</div>
</template>
<script>
import Navbar from "./components/Navbar.vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
	components: {
		Navbar,
	},
	data() {
		return {
			user: null,
		};
	},
	mounted() {
		onAuthStateChanged(getAuth(), (user) => {
			this.user = user;
		});
	},
};
</script>

<style>
:root {
	--navbar-height: 4rem;
}

html {
	overflow-y: hidden;
}

.router-view {
	margin-top: var(--navbar-height);
	height: calc(100vh - var(--navbar-height));
	width: 100vw;
	overflow-y: auto;
}
</style>
