<script>
	export let selectedDate;
	export let selectedTime;
	export let selectedGeohash;
	export let fetchData;
</script>

<section class="card h-fit">
	<p class="font-bold my-1">Search Geohash Vehicle Data:</p>

	{#if selectedDate === "" || selectedTime === "" || selectedGeohash === null}
		<div class="alert alert-red my-1" role="alert">Select a Date, Time, and Geohash before Searching.</div>
	{:else}
		<button class={`card-btn card-btn-green my-1`} on:click={fetchData}> Search Data </button>
	{/if}
</section>
