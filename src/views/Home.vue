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
										class="col-8 d-flex"
										style="align-items: center"
									>
										{{ variableList[category] }}
									</div>
									<div class="col-1"></div>
									<div class="col-11">
										<table
											class="table table-striped"
											v-if="entryOpen[category]"
										>
											<thead>
												<tr>
													<th>Variable</th>
													<th>
														Variable Description
													</th>
													<th>
														Intrinsic to Cohort
														Definition
													</th>
													<th>Important</th>
												</tr>
											</thead>
											<tbody>
												<tr
													v-for="row in filteredResults[
														category
													]"
													:key="row.Variable"
												>
													<td>{{ row.Variable }}</td>
													<td>
														{{
															row.VariableDescription
														}}
													</td>
													<td>
														{{
															row.IntrinsictoCohortDefinition
														}}
													</td>
													<td>{{ row.Important }}</td>
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

export default {
	name: "Home",
    components: {
        Navbar,
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
		};
	},
	async beforeMount() {
		// Load CodeBook.csv into results
		await Papa.parse("/CodeBook.csv", {
			download: true,
			header: true,
			complete: (results) => {
				const res = results.data;

				// Create set of unique VariableCategories
				const uniqueCategories = new Set();
				res.forEach((row) =>
					uniqueCategories.add(row.VariableCategory)
				);

				// For each unique VariableCategory, add a row with the category name
				var formattedResults = {};
				uniqueCategories.forEach((category) => {
					formattedResults[category] = res.filter(
						(row) => row.VariableCategory === category
					);

                    // Add a string of all variables into variableList
                    var concatenatedVariables = "";

                    formattedResults[category].forEach((row) => {
                        concatenatedVariables += row.Variable + ", ";
                    });

                    if (concatenatedVariables.length > 100) {
                        concatenatedVariables = concatenatedVariables.substring(0, 100) + "...";
                    }
                    else {
                        concatenatedVariables = concatenatedVariables.substring(0, concatenatedVariables.length - 2);
                    }

                    this.variableList[category] = concatenatedVariables;
				});

				console.log(formattedResults);

				this.results = formattedResults;
                this.filteredResults = formattedResults;
			},
		});


		// CodeBook Headers:
		// VariableCategory,Variable,VariableDescription,IntrinsictoCohortDefinition,Important
	},
};
</script>

<style>
</style>