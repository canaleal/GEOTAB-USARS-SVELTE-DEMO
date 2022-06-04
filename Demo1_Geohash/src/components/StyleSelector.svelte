<script>
	export let mapStyle;
	export let isReadyForStyleSwitching;

	const mapStyleList = [
		{ name: "Streets", value: "streets-v11" },
		{ name: "Dark", value: "dark-v10" },
		{ name: "Outdoors", value: "outdoors-v11" },
		{ name: "Satellite", value: "satellite-streets-v11" },
		{ name: "Navigation - Night", value: "navigation-night-v1" },
	];

	const toggleStyle = (item) => {
		try {
			mapStyle = item;
			isReadyForStyleSwitching = true;
		} catch (e) {}
	};
</script>

<section class="h-full rounded-lg bg-white p-4 mb-4 text-sm">
	<p class="font-bold my-1">Map Style:</p>
	{#each mapStyleList as item}
		<div key={item.name}>
			<input id={item.name} type="radio" value={item.value} checked={mapStyle === item.value} on:click={() => toggleStyle(item["value"])} data-bs-toggle="collapse" data-bs-target="#collapseMenu" />
			<label class="ml-2" for={item["name"]}>{item["name"]}</label>
		</div>
	{/each}
</section>
