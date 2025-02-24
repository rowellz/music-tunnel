<script lang="ts">
	import TunnelTwo from '$lib/components/TunnelTwo/TunnelTwo.svelte';
	import { onHydrated, theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	
	onMount(() => onHydrated());
</script>

<div class="scroll-container">
	<div class="tunnel-background">
		<TunnelTwo />
	</div>
	<br>
	<br>
	<div class={`body contents ${$theme ? 'theme-dark' : 'theme-light'}`}>
		<div class="content container"><slot /></div>
		<hr>
	</div>
</div>

<style>
	.nav-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 100; /* Ensure it's above other content */
		background-color: #FFF; /* Or any color that matches your design */
		/* Add any other styling needed for your navbar here */
	}

	hr {
        border: none;
        border-top: 5px solid grey; /* Adjust thickness and color here */
        width: 90%;
        margin: 20px 0; /* Adjust size here */
		align-self: center;
    }
	.scroll-container {
		position: relative; /* Establishes a new positioning context */
		overflow-y: scroll; /* Enables scrolling within the container */
		height: 90vh; /* Full viewport height */
	}


	.body.contents {
		position: relative; /* Ensure stacking context */
		z-index: 1; /* Above the background */
	}

	.content.container {
		z-index: 2; /* Ensures content is above the background */
		background-color: transparent; /* Optional: Adjust based on your design */
		padding-top: 40px;
	}

	.content {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 0px 0px;
	}

	.body {
		margin: 0px;
		background-color: transparent; /* Make background transparent to see the TunnelTwo */
		color: var(--main-text);
		font-family: var(--text-f);
		display: flex;
		flex-direction: column;
		transition-duration: 200ms;
		letter-spacing: 1px;
		min-height: 100vh; /* Adjusted to be min-height */
	}

	:global(p), :global(h1, h2, h3, h4, h5, h6) {
		margin: 0px;
	}
</style>