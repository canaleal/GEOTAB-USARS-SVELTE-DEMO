<script>
	import { onMount } from "svelte/internal";
	
	export let pointOfInterest;
	let mapContainer = null;

	onMount(() => {
		mapContainer = new google.maps.StreetViewPanorama(mapContainer, {
			position: pointOfInterest,
			pov: {
				heading: 34,
				pitch: 10,
			},
		});
	});

	// When the location changes, set the new lat long to the map
	const onLocationChange = () => {
		try {
			mapContainer.setPosition(pointOfInterest);
		} catch (e) {}
	};
	$: pointOfInterest && mapContainer != null && onLocationChange();
</script>

<section class="card card-2xl">
	<div bind:this={mapContainer} class="h-full w-full rounded-lg" />
</section>
