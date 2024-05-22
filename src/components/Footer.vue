<template>
	<footer class="footer">
		<div class="container">
			<span class="text-muted">
				<!-- dynamic year -->
				<center>
					&copy; {{ new Date().getFullYear() }} All rights reserved.
					Powered by
					<a
						href="https://icaz117.web.app/#/"
						target="_blank"
						class="text-reset text-decoration-underline"
					>
						Cazalas Technologies</a
					>.
				</center>
			</span>
		</div>
	</footer>
</template>

<script>
export default {};
</script>

<style>
.footer {
	bottom: 0;
	width: 100%;
	height: var(--footer-height);
	line-height: 60px;
	background-color: #f5f5f5;
	text-decoration: none;
}
</style>