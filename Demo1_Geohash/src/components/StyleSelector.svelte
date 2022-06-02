<script>
	export let mapStyle;

	const mapStyleList = [
		{ name: "Streets", value: "streets-v11" },
		//{ name: "Light", value: "light-v10" },
		{ name: "Dark", value: "dark-v10" },
		{ name: "Outdoors", value: "outdoors-v11" },
		{ name: "Satellite", value: "satellite-streets-v11" },
		//{ name: "Navigation - Day", value: "navigation-day-v1" },
        { name: "Navigation - Night", value: "navigation-night-v1" },
	];

	function toggleStyle(item) {
		try {
			mapStyle = item;
		} catch (e) {
			console.log(e);
		}
	}
</script>

<section class="h-full rounded-lg bg-white p-4 mb-4 "  >
	<p class=" my-1">Map Style:</p>



	{#each mapStyleList as item}
		

        <div key={item.name}>
            <input
                id={item.name}
                type="radio"
                value={item.value}
                checked={mapStyle === item.value}
                on:click={() => toggleStyle(item["value"])}
                data-bs-toggle="collapse" data-bs-target="#collapseMenu"
            />
            <label class='text-sm ml-2' for={item['name']}>{item['name']}</label> 
        </div>
	{/each}
  
</section>
