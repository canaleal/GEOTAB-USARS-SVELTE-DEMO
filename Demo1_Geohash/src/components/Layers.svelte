<script>
	export let collectionList = [];

	let toggleBool = 0;
	let toggleName = "Disable All";
	function toggleAll() {
		try {
			let tempCollection = collectionList;
			tempCollection = tempCollection.map((item) => {
				item["isShown"] = toggleBool;
				return item;
			});
			collectionList = tempCollection;
			toggleBool = !toggleBool;
			toggleName = toggleBool ? "Show All" : "Disable All";
		} catch (e) {
			console.log(e);
		}
	}

	function toggleIsShown(item) {
		try {
			let tempCollection = collectionList;
			let objIndex = tempCollection.findIndex((obj) => obj.id == item["id"]);
			tempCollection[objIndex]["isShown"] = !tempCollection[objIndex]["isShown"];
			collectionList = tempCollection;

			const isShownList = tempCollection.map((item) => item["isShown"]);
			const result = isShownList.every((element, index, isShownList) => element === isShownList[0]);

			// If they are all the same, change the toggle
			if (result) {
				if (isShownList[0]) {
					toggleBool = false;
					toggleName = "Disable All";
				} else {
					toggleBool = true;
					toggleName = "Show All";
				}
			}
		} catch (e) {
			console.log(e);
		}
	}
</script>

<section class="h-full rounded-lg shadow-xl p-4 text-sm">
	<p class="font-bold my-1">Layers:</p>

	{#if collectionList.length >= 1}
		<div>
			<button on:click={() => toggleAll()} class={`card-btn   ${toggleBool ? "card-btn-green" : "card-btn-red"}  w-full block my-1 rounded-lg`}> {toggleName} </button>
			<div class="overflow-y-auto">
				{#each collectionList as item}
					<button on:click={() => toggleIsShown(item)} class={`card-btn w-full block ${item["isShown"] ? "card-btn-blue" : ""} my-1 rounded-lg `}>
						<i class="fa-solid {item['icon']} " /> {item["name"]}
					</button>
				{/each}
			</div>
		</div>
	{:else}
		<div class="bg-green-100 rounded-lg py-4 px-6 text-green-700 my-1" role="alert">Loading Data.</div>
	{/if}
</section>

<style>
</style>
