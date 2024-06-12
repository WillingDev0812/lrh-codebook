<template>
	<div class="container">
        <div class="py-5">
		<center><h3>Upload Codebook</h3></center>
		<div class="row mt-4 px-5 mx-auto">
			<div class="col-6">
				<div class="requirementsBox">
					<h5>Requirements</h5>
					<ul class="m-0">
						<li>File must be in CSV format</li>
						<li>The first row must be the header row</li>
						<li>
							The headers must contain STRICTLY alphanumeric
							characters. No spaces or special characters
						</li>
						<li>
							The first column must have the header
							"VariableCategory"
						</li>
						<li>All columns must have a header</li>
						<li>The file must contain at least 1 non-header row</li>
					</ul>
				</div>
			</div>
			<div class="col-6">
				<form @submit.prevent>
					<div class="mb-3">
						<label for="file" class="form-label">Select File</label>
						<input
							type="file"
							class="form-control"
							id="file"
							accept=".csv"
                            @change="launchPreview"
						/>
					</div>
					<div class="row">
						<div class="col-12">
							<button
								class="btn btn-primary w-100"
								:disabled="
									file.headers.length == 0 ||
									file.rows.length == 0
								"
								@click="uploadFile"
							>
								{{ uploadBtnText }}
							</button>
                            <span>Warning: Do not close this window while the upload is running to avoid data corruption!</span>
						</div>
					</div>
				</form>
			</div>
		</div>
		<div
			v-if="file.headers.length > 0 && file.rows.length > 0"
			class="preview w-100"
		>
			<hr />
			<h5>Preview</h5>
			<div class="tableBorder">
				<div class="previewTable">
					<table class="table table-striped">
						<thead>
							<tr style="border-bottom: 2px solid black">
								<th
									v-for="header in file.headers"
									:key="header"
								>
									{{ header }}
								</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="row in file.rows"
								:key="row"
								v-show="row.VariableCategory != ''"
							>
								<td v-for="cell in row" :key="cell">
									{{ cell }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
    </div>
</template>

<script>
import Papa from "papaparse";
import store from "@/store";

export default {
	data() {
		return {
			rawFile: null,
			file: {
				headers: [],
				rows: [],
			},
            uploadBtnText: "Upload",
		};
	},
    watch: {
        // Watch localUploadPercentage 
        '$store.state.uploadPercentage': function() {
            this.uploadBtnText = "Uploading... " + store.state.uploadPercentage + "%";
            if (store.state.uploadPercentage == 100) {
                this.uploadBtnText = "Upload";
            }
            console.log("Upload percentage", store.state.uploadPercentage);
        }
    },
    computed: {
        // Get uploadPercentage from vuex store
        localUploadPercentage() {
            return store.state.uploadPercentage;
        },  
    },
	methods: {
		async launchPreview() {
			this.file = {
				headers: [],
				rows: [],
			};

			console.log("\n------------------------------------------");
			console.log("LAUNCH PREVIEW");
			console.log("------------------------------------------");

			console.log("\nStep 1: Get the raw file");
			const rawFile = document.getElementById("file").files[0];
			if (!rawFile) {
				alert("Please select a file");
				return;
			}
			this.rawFile = rawFile;
			console.log("Raw file", this.rawFile);

			console.log("\nStep 2: Parse the rows");
			var rows = await this.parseFile(this.rawFile);
			var headers = rows.meta.fields.filter((header) => header !== "");
			console.log("Rows", rows);
			console.log("Headers", headers);

			console.log("\nStep 3: Verify requirements");
			// Check if the first column is "VariableCategory"
			if (headers[0] !== "VariableCategory") {
				alert("The first column must be 'VariableCategory'");
				return;
			}

			// Check if there are 0 rows
			if (rows.data.length == 0) {
				alert("There are no rows in the file");
				return;
			}

			// Check if the headers are alphanumeric
			for (var header of headers) {
				if (!/^[a-zA-Z0-9]*$/.test(header)) {
					alert("Headers must be alphanumeric");
					return;
				}
			}

			// Check if all columns have a header
			// Loop over all rows
			var i = 2;
			for (var row of rows.data) {
				console.log(row);
				// Check if row length is greater than headers length
				if (Object.keys(row).length > headers.length) {
					alert(
						"All columns must have a header. Row " +
							i +
							" has " +
							Object.keys(row).length +
							" columns, but there are only " +
							headers.length +
							" headers."
					);
					return;
				}
				i++;
			}

			this.file.headers = rows.meta.fields;
			this.file.rows = rows.data;
		},

		async parseFile(file) {
			console.log("\n\t------------------------------------------");
			console.log("\tPARSE FILE");
			console.log("\t------------------------------------------");

			console.log("\n\tStep 1: Parse the file");
			var results = await new Promise((resolve, reject) => {
				Papa.parse(file, {
					header: true,
					complete: (results) => {
						resolve(results);
					},
				});
			});
			console.log("\tResults", results);

			console.log("\n\tStep 2: Return the results");
			return results;
		},

		async uploadFile() {
			var confirmUpload = confirm(
				"Are you SURE you want to upload this file? This will overwrite the existing codebook in the database. This cannot be undone!"
			);

			if (!confirmUpload) {
				return;
			}

			await store.dispatch("uploadCodebook", { codebookFile: this.file });
            alert("Codebook uploaded successfully!");
		},
	},
};
</script>

<style scoped>
.requirementsBox {
	border: 1px solid rgb(0, 95, 19);
	border-radius: 5px;
	padding: 1rem;
	background-color: rgb(213, 243, 214);
}

.requirementsBox ul {
	/* Use a dash (-) for bullets */
	list-style-type: "-  ";
}

.previewTable {
	width: 100%;
	height: 500px;
	overflow-x: scroll;
}

thead {
	position: sticky;
	top: 0;
	background-color: white;
}

.tableBorder {
	border: 1px solid black;
	border-radius: 10px;
	padding: 10px;
	margin-bottom: 2rem;
}

.table {
	border-collapse: separate;
	border-spacing: 0;
}
</style>