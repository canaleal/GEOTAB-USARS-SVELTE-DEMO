<script>
	export let selectedDate;
	export let selectedFrom;
	export let selectedTo;

	const clearDateTime = () => {
		selectedDate = "";
		selectedFrom = "";
		selectedTo = "";
	};
</script>

<section class="h-fit rounded-lg shadow-xl p-4 text-sm">
	<p class="font-bold my-1">Date Time Selection:</p>

	<div class="flex items-center justify-center">
		<div class="datepicker form-floating my-1 w-full" data-mdb-toggle-button="false">
			<input
				type="date"
				class="form-control block w-full text-sm text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
				placeholder="Select a date"
				data-mdb-toggle="datepicker"
				min="2010-01-01"
				max="2022-12-31"
				bind:value={selectedDate}
			/>
			<label for="floatingInput" class="text-gray-700  text-sm">Select a date</label>
		</div>
	</div>

	<div class="flex items-center justify-center">
		<div class="datepicker form-floating my-1 w-full" data-mdb-toggle-button="false">
			<input
				type="time"
				class="form-control block w-full text-sm text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
				placeholder="From"
				data-mdb-toggle="timepicker"
				min="2010-01-01"
				max="2022-12-31"
				bind:value={selectedFrom}
			/>
			<label for="floatingInput" class="text-gray-700  text-sm">From</label>
		</div>
		<div class="datepicker form-floating my-1 w-full" data-mdb-toggle-button="false">
			<input
				type="time"
				class="form-control block w-full text-sm text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
				placeholder="To"
				data-mdb-toggle="timepicker"
				min="2010-01-01"
				max="2022-12-31"
				bind:value={selectedTo}
			/>
			<label for="floatingInput" class="text-gray-700  text-sm">To</label>
		</div>
	</div>

	{#if selectedDate === "" || selectedFrom === "" || selectedTo === ""}
		<div class="alert alert-red my-1" role="alert">Select a Date and Time before Searching.</div>
	{:else}
		<div class="alert alert-green my-1" role="alert">
			{selectedDate} from {selectedFrom} to {selectedTo} <button class="float-right fa-lg" on:click={clearDateTime}><i class="fa-solid fa-xmark " /></button>
		</div>
	{/if}
</section>

<style>
</style>
