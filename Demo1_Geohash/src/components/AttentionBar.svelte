<script>
	import { getCurrentDateTime } from "utils/fetch-time";
	export let selectedMenu;
</script>

<section class=" sticky top-0 z-10">
	<div class="bg-blue py-1 px-5">
		<p class="text-white text-sm"><span class="font-bold">Last Updated :</span> Fetch to API on {getCurrentDateTime()}</p>
	</div>

	<section class="grid grid-cols-1  md:grid-cols-12 grid-rows-1  gap-4 pb-4 px-4 h-fit">
		<div class="col-span-1 md:col-span-3 row-span-1 " />
		<div class="col-span-1 md:col-span-2 row-span-1 ">
			<button class={`card-btn-sm ${selectedMenu == 0 ? "card-btn-blue" : "bg-white"} w-full block mb-1 rounded-b-lg hover:underline`} on:click={() => (selectedMenu = 0)}> Layers View </button>
		</div>
		<div class="col-span-1 md:col-span-2 row-span-1">
			<button class={`card-btn-sm ${selectedMenu == 1 ? "card-btn-blue" : "bg-white"} w-full block mb-1 rounded-b-lg hover:underline`} on:click={() => (selectedMenu = 1)}> Chart View </button>
		</div>
		<div class="col-span-1 md:col-span-2 row-span-1">
			<button class={`card-btn-sm ${selectedMenu == 2 ? "card-btn-blue" : "bg-white"} w-full block mb-1 rounded-b-lg hover:underline`} on:click={() => (selectedMenu = 2)}> Details View </button>
		</div>
	</section>
</section>
