<template>
	<div class="container my-5">
		<!-- Login menu with email and password for firebase authentication -->
		<div class="row">
			<div class="col-md-4 offset-md-4">
				<div class="card">
					<div class="card-header">
						<h3>Login</h3>
					</div>
					<div class="card-body">
						<form @submit.prevent="login">
							<div class="form-group">
								<label for="email">Email</label>
								<input
									type="email"
									class="form-control"
									id="email"
									aria-describedby="emailHelp"
									placeholder="Enter email"
									v-model="email"
								/>
							</div>
							<div class="form-group">
								<label for="password">Password</label>
								<input
									type="password"
									class="form-control"
									id="password"
									placeholder="Password"
									v-model="password"
								/>
							</div>
							<button type="submit" class="btn btn-login">
								Login
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import store from "@/store";
export default {
	data() {
		return {
			email: "",
			password: "",
		};
	},
	methods: {
		async login() {
			try {
				const res = await store.dispatch("login", {
					email: this.email,
					password: this.password,
				});

				if (!res) {
                    this.$router.push("/");
                }
				else {
                    throw res;
                }
			} catch (error) {
				console.log(error);
			}
		},
	},
};
</script>

<style>
.form-group {
	padding-bottom: 1rem;
}

.btn-login {
	background-color: #007bff;
	color: white;
	width: 100%;
	margin-top: 1rem;
}
</style>