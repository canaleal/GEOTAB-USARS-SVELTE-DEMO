<script>
	import { getCurrentDateTime } from "utils/fetch-time";
	export let selectedMenu;
</script>

<section class=" sticky top-0 z-10">
	<div class="bg-blue py-1 px-5">
		<p class="text-white text-sm"><span class="font-bold">Last Updated :</span> Fetch to API on {getCurrentDateTime()}</p>
	</div>

	<section class="grid grid-cols-1  md:grid-cols-12 grid-rows-1  gap-4 px-4 h-fit">
		<div class="col-span-1 md:col-span-3 row-span-1 " />
		<div class="col-span-1 md:col-span-2 row-span-1 ">
			<button class={`card-btn ${selectedMenu == 1 ? "card-btn-blue" : ""} my-1 `} on:click={() => (selectedMenu = 1)}> Date Time View </button>
		</div>
		<div class="col-span-1 md:col-span-2 row-span-1">
			<button class={`card-btn ${selectedMenu == 2 ? "card-btn-blue" : ""} my-1 `} on:click={() => (selectedMenu = 2)}> Street View </button>
		</div>
	</section>
</section>
