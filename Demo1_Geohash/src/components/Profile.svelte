<script>
	import { getCurrentDateTime } from "utils/fetch-time";
	export let kingstonDetails;
	export let selectedGeohash;
</script>

<section class="rounded-lg shadow-xl text-sm p-4">
	<p class="font-bold my-1">Selected Geohash:</p>

	{#if selectedGeohash != null}
  <div class="bg-green-100 rounded-lg py-4 px-6 text-green-700 my-1" role="alert">{selectedGeohash}</div>
	{:else}
		<div class="bg-red-100 rounded-lg py-4 px-6 text-red-700 my-1" role="alert">Select a Geohash before Searching.</div>
	{/if}

	<p class="font-bold my-1">City:</p>
	<p>{kingstonDetails.displayName}</p>

	<p class="font-bold my-1">Map Data:</p>
	<p>Data taken from API on {getCurrentDateTime()}</p>
</section>
