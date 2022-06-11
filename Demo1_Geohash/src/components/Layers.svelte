<script>
	export let collectionList = [];

	let toggleBool = false;
	let toggleName = "Disable All";

	function toggleAll() {
		try {
			//Change all the isShow values to true or false
			let tempCollection = collectionList;
			tempCollection = tempCollection.map((item) => {
				item["isShown"] = toggleBool;
				return item;
			});

			toggleBool = !toggleBool;
			toggleName = toggleBool ? "Show All" : "Disable All";

			collectionList = tempCollection;
		} catch (e) {}
	}

	function toggleIsShown(item) {
		try {
			// Get the object from the list and toggle the is shown
			let tempCollection = collectionList;
			let objIndex = tempCollection.findIndex((obj) => obj.id == item["id"]);
			tempCollection[objIndex]["isShown"] = !tempCollection[objIndex]["isShown"];
			collectionList = tempCollection;
			allToggleButton();
		} catch (e) {}
	}

	const allToggleButton = () => {
		// Get a list of all the is shown values and check if they are all the same
		let tempCollection = collectionList;
		const isShownList = tempCollection.map((item) => item["isShown"]);
		const allSame = isShownList.every((element, index, isShownList) => element === isShownList[0]);

		// If they are all the same, change the toggle
		if (allSame === true) {
			if (isShownList[0] === true) {
				toggleBool = false;
				toggleName = "Disable All";
			} else {
				toggleBool = true;
				toggleName = "Show All";
			}
		}
	};
</script>

<section class="card h-fit">
	<p class="font-bold my-1">Layers:</p>

	{#if collectionList.length >= 1}
		<button on:click={() => toggleAll()} class={`card-btn   ${toggleBool ? "card-btn-green" : "card-btn-red"}  my-1 `}> {toggleName} </button>
		<div class="overflow-auto ">
			{#each collectionList as layer}
				<button key={layer.name} on:click={() => toggleIsShown(layer)} class={`card-btn ${layer.isShown ? "card-btn-blue" : ""} my-1 `}>
					<i class="fa-solid {layer.icon} " />
					{layer.name}
				</button>
			{/each}
		</div>
	{:else}
		<div class="bg-green-100 rounded-lg py-4 px-6 text-green-700 my-1" role="alert">Loading Data.</div>
	{/if}
</section>

<style>
</style>
