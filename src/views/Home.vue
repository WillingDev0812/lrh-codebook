<template>
	<div class="container my-5">
		<div class="row">
			<div class="col-md-6 offset-md-3">
				<input
					type="text"
					class="form-control searchbar"
					placeholder="Enter a search query..."
					v-model="searchQuery"
				/>
			</div>
		</div>
		<!-- Table to display results -->
		<div class="row mt-3">
			<div class="col-md-12">
				<table class="table">
					<thead>
						<tr>
							<div class="row">
								<th class="col-1"></th>
								<th class="col-10"><h5>Category</h5></th>
							</div>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="category in Object.keys(filteredResults)"
							:key="category"
						>
							<!-- Dropdown table row -->
							<td colspan="5">
								<div class="row">
									<button
										class="col-1 btn btn-link"
										@click="
											entryOpen[category] =
												!entryOpen[category]
										"
									>
										<i
											class="fa-solid fa-chevron-right"
											style="color: black"
											v-if="!entryOpen[category]"
										></i>
										<i
											class="fa-solid fa-chevron-down"
											style="color: black"
											v-else
										></i>
									</button>
									<div
										class="col-3 d-flex"
										style="align-items: center"
									>
										<h6 class="my-0">{{ category }}</h6>
									</div>
									<div
										class="col-7 d-flex"
										style="align-items: center"
									>
										{{ variableList[category] }}
									</div>
									<div class="col-1 d-flex">
										<button
											v-if="user"
											@click="deleteCategory(category)"
											class="btn"
										>
											<i
												class="fa-solid fa-trash-can"
												style="color: grey"
											></i>
										</button>
									</div>
									<div class="col-1"></div>
									<div class="col-11">
										<table
											class="table table-striped"
											v-if="entryOpen[category]"
										>
											<thead>
												<tr>
													<!-- Loop over headers -->
													<th
														v-for="header in headers"
														:key="header"
													>
														{{ header }}
													</th>
												</tr>
											</thead>
											<tbody>
												<tr
													v-for="row in filteredResults[
														category
													]"
													:key="row.Variable"
												>
													<!-- Loop over values corresponding to headers -->
													<td
														v-for="header in headers"
														:key="header"
													>
														{{ row[header] }}
													</td>
													<td>
														<button
															v-if="user"
															@click="
																deleteVariable({
																	category:
																		category,
																	variable:
																		row.Variable,
																})
															"
															class="btn"
														>
															<i
																class="fa-solid fa-trash-can"
																style="
																	color: grey;
																"
															></i>
														</button>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script>
import Papa from "papaparse";
import Navbar from "@/components/Navbar.vue";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import store from "@/store";

export default {
	name: "Home",
	components: {
		Navbar,
	},
	props: {
		user: {
			type: Object,
			required: true,
		},
	},
	watch: {
		searchQuery: function (val) {
			// Filter categories based on search query
			this.filteredResults = {};
			for (const category in this.results) {
				// First, check if category name matches search query
				if (category.toLowerCase().includes(val.toLowerCase())) {
					this.filteredResults[category] = this.results[category];
				} else {
					// Next, check if any of the variables in the category match the search query
					const filteredVariables = this.results[category].filter(
						(row) => {
							if (row.Variable) {
								return row.Variable.toLowerCase().includes(
									val.toLowerCase()
								);
							} else {
								return false;
							}
						}
					);
					if (filteredVariables.length > 0) {
						this.filteredResults[category] = filteredVariables;
					}
				}
			}
		},
	},
	data() {
		return {
			searchQuery: "",
			results: {},
			filteredResults: {},
			entryOpen: {},
			variableList: {},
			headers: [],
		};
	},
	methods: {
		async publish() {
			console.log("IN METHOD");
			console.log(this.results);
			await store.dispatch("uploadCodebook", { codebook: this.results });
		},
		async parseCSV() {
			// Load CodeBook.csv into results
			await Papa.parse("/CodeBook.csv", {
				download: true,
				header: true,
				complete: (results) => {
					const res = results.data;

					const formattedResults = this.formatCodebook(res);

					console.log(formattedResults);

					this.results = formattedResults;
					this.filteredResults = formattedResults;
				},
			});

			// CodeBook Headers:
			// VariableCategory,Variable,VariableDescription,IntrinsictoCohortDefinition,Important
		},
		async formatCodebook(res) {
			const uniqueCategories = Object.keys(res);

			console.log(uniqueCategories);

			// For each unique VariableCategory, add a row with the category name
			var formattedResults = {};
			uniqueCategories.forEach((category) => {
				// For each category, map the category name to a list of variables in that category
				formattedResults[category] = res[category];

				var concatenatedVariables = "";

				// Concatenate all variables in the category
				res[category].forEach((row) => {
					concatenatedVariables += row.Variable + ", ";
				});

				if (concatenatedVariables.length > 100) {
					concatenatedVariables =
						concatenatedVariables.substring(0, 100) + "...";
				} else {
					concatenatedVariables = concatenatedVariables.substring(
						0,
						concatenatedVariables.length - 2
					);
				}

				// check if concatenatedVariables is empty
				if (concatenatedVariables === "undefined") {
					concatenatedVariables = "Missing Variable Names";
				}

				this.variableList[category] = concatenatedVariables;
			});
			return formattedResults;
		},
		async deleteCategory(category) {
			console.log("Deleting category: " + category);
		},
		async deleteVariable(variable) {
			console.log("Deleting variable: " + variable.variable);
		},
	},
	async beforeMount() {
		console.log("PAPAPARSE");
		await Papa.parse("/CodeBook.csv", {
			download: true,
			header: true,
			complete: (results) => {
				const res = results.data;

				console.log(res);
			},
		});

		console.log("STOP PAPAPARSE");

		const res = await store.dispatch("fetchCodebook");

		const formattedResults = await this.formatCodebook(res);

		const rawHeaders = await store.dispatch("fetchHeaders");

		this.headers = rawHeaders.filter(
			(header) => header !== "VariableCategory"
		);
		this.results = formattedResults;
		this.filteredResults = formattedResults;

		console.log("BEFORE MOUNT");
		console.log(this.results);
		console.log("Mounting...");
	},
	async mounted() {
		if (this.$route.path == "/downloads") {
			const codebookCSV = Papa.unparse(this.results);

			console.log("CSV");
			console.log(codebookCSV);

			// Download the codebook as a CSV file
			const element = document.createElement("a");
			const file = new Blob([codebookCSV], { type: "text/csv" });
			element.href = URL.createObjectURL(file);
			element.download = "CodeBook.csv";
			document.body.appendChild(element); // Required for this to work in FireFox
			element.click();
		}
	},
};
</script>

<style>
</style>