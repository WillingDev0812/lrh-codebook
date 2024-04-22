<template>
	<div class="container my-5">
		<!-- Login menu with email and password for firebase authentication -->
		<div class="row">
			<div class="col-md-4 offset-md-4">
				<div class="card">
					<div class="card-header">
						<h3>Create New Account</h3>
					</div>
					<div class="card-body">
						<form @submit.prevent="createAccount">
                            <p>1. Please confirm YOUR password</p>
                            <div class="form-group">
								<label for="userPass">Your Password</label>
								<input
									type="password"
									class="form-control"
									id="userPass"
									placeholder="Your Password"
									v-model="userPass"
                                    required
								/>
							</div>
                            <hr>

                            <p>2. Please enter the credentials for the new account</p>
							<div class="form-group">
								<label for="email">Email</label>
								<input
									type="email"
									class="form-control"
									id="email"
									aria-describedby="emailHelp"
									placeholder="Enter email"
									v-model="email"
                                    required
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
                                    required
								/>
							</div>
							<!-- Confirm password -->
							<div class="form-group">
								<label for="confirmPassword"
									>Confirm Password</label
								>
								<input
									type="password"
									class="form-control"
									id="confirmPassword"
									placeholder="Confirm Password"
									v-model="confirmPassword"
                                    required
								/>
							</div>
							<button type="submit" class="btn btn-login">
								Create Account
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
            userPass: "",
			email: "",
			password: "",
            confirmPassword: "",
		};
	},
	methods: {
		async createAccount() {
            // Attempt to re-authenticate the user
            try {
                const res = await store.dispatch("reauthenticate", {
                    email: this.email,
                    password: this.userPass,
                });

                if (!res) {
                    console.log("Re-authenticated");
                } else {
                    throw res;
                }
            } catch (error) {
                console.log(error);
                alert("Your password is incorrect. Please try again.");
                return;
            }

            if (this.password !== this.confirmPassword) {
                alert("Passwords do not match");
            }
            else if (this.password.length < 8) {
                alert("Password must be at least 8 characters long");
            }
            else {
                try {
				const res = await store.dispatch("createAccount", {
					email: this.email,
					password: this.password,
                    userPass: this.userPass,
				});

				if (!res) {
					this.$router.push("/");
				} else {
					throw res;
				}
			} catch (error) {
				console.log(error);
                alert(error);
			}
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