<script>
    export let selectedDate;
    export let selectedTime;
    export let selectedGeohash;
    export let fetchData;

</script>


<section class="rounded-lg shadow-xl text-sm p-4">
    <p class="font-bold my-1">Search Geohash Vehicle Data:</p>

    {#if selectedDate === "" || selectedTime === "" || selectedGeohash === null}
        <div class="bg-red-100 rounded-lg py-4 px-6  text-red-700 my-1" role="alert">Select a Date, Time, and Geohash before Searching.</div>
    {:else}
        <button class={`card-btn   card-btn-green  w-full block my-1 rounded-lg`} on:click={fetchData}> Search Data </button>
    {/if}
</section>


