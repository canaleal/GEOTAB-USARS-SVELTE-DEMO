<script>
	export let selectedDate;
	export let selectedTime;

	$: console.log(selectedDate);
	$: console.log(selectedTime);
</script>

<section class="h-full rounded-lg shadow-xl  p-4 text-sm">
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
				placeholder="Select a time"
				data-mdb-toggle="timepicker"
				min="2010-01-01"
				max="2022-12-31"
				bind:value={selectedTime}
			/>
			<label for="floatingInput" class="text-gray-700  text-sm">Select a time</label>
		</div>
	</div>

	{#if selectedDate === "" || selectedTime === ""}
		<div class="bg-red-100 rounded-lg py-5 px-6 mb-4 text-red-700 my-1" role="alert">Select a Date and Time before Searching.</div>
	{/if}
</section>

<style>
</style>
