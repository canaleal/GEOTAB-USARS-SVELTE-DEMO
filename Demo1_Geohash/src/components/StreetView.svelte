<script>
	/*global google*/
	import { onMount } from "svelte/internal";
	export let pointOfInterest;
	let container = null;

	onMount(() => {
		console.log("New Map");
		container = new google.maps.StreetViewPanorama(container, {
			position: pointOfInterest,
			pov: {
				heading: 34,
				pitch: 10,
			},
		});
	});

	const onLocationChange = () => {
		console.log("Map Refresh");
		try {
			container.setPosition(pointOfInterest);
		} catch (e) {}
	};
	$: pointOfInterest && container != null && onLocationChange();
</script>

<section class="rounded-lg shadow-xl text-sm p-4 h-72">
	<div bind:this={container} class="h-full w-full rounded-lg" />
</section>
