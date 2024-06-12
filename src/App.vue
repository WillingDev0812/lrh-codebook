
<template>
	<Navbar :user="user" />
	<div class="router-view">
		<div class="page-view">
			<router-view :user="user"/>
		</div>
		<Footer></Footer>
	</div>
</template>
<script>
import Footer from "./components/Footer";
import Navbar from "./components/Navbar.vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
	components: {
		Footer,
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
	--footer-height: 60px;
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

.page-view {
	min-height: calc(100vh - var(--navbar-height) - var(--footer-height));
}
</style>
