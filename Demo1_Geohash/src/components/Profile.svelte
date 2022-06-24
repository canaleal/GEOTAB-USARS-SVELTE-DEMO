<script>
	import { getCurrentDateTime } from "utils/fetch-time";
	export let kingstonDetails;
	export let selectedPolygon;

	
</script>

<section class="card h-fit">
	<p class="font-bold my-1">Selected Polygon:</p>

	{#if selectedPolygon === null}
		<div class="alert alert-red my-1" role="alert">Draw a polygon before searching.</div>
	{:else}
		<div class="alert alert-green my-1" role="alert">
			{selectedPolygon} 
		</div>
	{/if}

	<p class="font-bold my-1">City:</p>
	<p>{kingstonDetails.displayName}</p>

	<p class="font-bold my-1">Map Data:</p>
	<p>Data taken from API on {getCurrentDateTime()}</p>
</section>
