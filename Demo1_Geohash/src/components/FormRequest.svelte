<script>
	export let selectedDate;
	export let selectedFrom;
	export let selectedTo;
	export let selectedPolygon;
	export let fetchData;
</script>

<section class="card h-fit">
	<p class="font-bold my-1">Search Polygon Vehicle Data:</p>

	{#if selectedDate === "" || selectedFrom === "" || selectedTo === "" || selectedPolygon === null}
		<div class="alert alert-red my-1" role="alert">Select a Date, Time Range, and Polygon before Searching.</div>
	{:else}
		<button class={`card-btn card-btn-green my-1`} on:click={fetchData}> Search Data </button>
	{/if}
</section>
