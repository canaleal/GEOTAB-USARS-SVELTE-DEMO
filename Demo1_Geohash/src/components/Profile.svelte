<script>
	import { getCurrentDateTime } from "utils/fetch-time";
	export let kingstonDetails;
	export let selectedGeohash;

	const clearSelectedGeohash = () => {
		selectedGeohash = null;
	};
</script>

<section class="card h-fit">
	<p class="font-bold my-1">Selected Geohash:</p>

	{#if selectedGeohash === null}
		<div class="alert alert-red my-1" role="alert">Select a Geohash before Searching.</div>
	{:else}
		<div class="alert alert-green my-1" role="alert">
			{selectedGeohash} <button class="float-right fa-lg" on:click={clearSelectedGeohash}><i class="fa-solid fa-xmark " /></button>
		</div>
	{/if}

	<p class="font-bold my-1">City:</p>
	<p>{kingstonDetails.displayName}</p>

	<p class="font-bold my-1">Map Data:</p>
	<p>Data taken from API on {getCurrentDateTime()}</p>
</section>
