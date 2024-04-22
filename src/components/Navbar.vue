<template>
	<!-- Fixed full-width navbar -->
	<nav class="navbar navbar-expand-md navbar-dark bg-dark">
		<div class="container-fluid">
			<a class="navbar-brand" href="#">LRH Research Code Book</a>
			<button
				class="navbar-toggler"
				type="button"
				data-toggle="collapse"
				data-target="#navbarCollapse"
				aria-controls="navbarCollapse"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navbarCollapse">
				<ul class="navbar-nav d-flex w-100">
					<li class="nav-item">
						<router-link
							to="/"
							class="nav-link"
							active-class="active"
							>Home</router-link
						>
					</li>
					<!-- Flexible full-width spacer -->
					<li class="flex-grow-1"></li>

					<li class="nav-item" v-if="!user">
						<!-- login -->
						<router-link
							to="/login"
							class="nav-link"
							active-class="active"
							>Login</router-link
						>
					</li>
					<div v-else>
						<li class="nav-item">
							<!-- Dropdown list -->
							<div class="nav-item dropdown">
								<a
									class="nav-link dropdown-toggle"
									href="#"
									id="navbarDropdown"
									role="button"
									data-bs-toggle="dropdown"
									aria-expanded="false"
								>
									{{ user.email }}
								</a>
								<div
									class="dropdown-menu"
									aria-labelledby="navbarDropdown"
								>
									<router-link
										to="/new-account"
										class="dropdown-item"
										active-class="active"
										>New Account</router-link
									>
									<router-link
										to="/logout"
										class="dropdown-item"
										active-class="active"
										>Logout</router-link
									>
								</div>
							</div>
						</li>
					</div>
				</ul>
			</div>
		</div>
	</nav>
	<div class="spacer"></div>
</template>

<script>
export default {
	props: {
		user: Object,
	},
};
</script>

<style>
.navbar {
	position: fixed;
	width: 100%;
	z-index: 1000;
	height: var(--navbar-height);
	top: 0;
}
</style>