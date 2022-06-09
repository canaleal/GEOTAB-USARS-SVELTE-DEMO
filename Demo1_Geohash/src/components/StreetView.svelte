<script>
	import { onMount } from "svelte/internal";

	const fenway = { lat: 42.345573, lng: -71.098326 };
	let el;

	onMount(() => {
		const panorama = new google.maps.StreetViewPanorama(el, {
			position: fenway,
			pov: {
				heading: 34,
				pitch: 10,
			},
		});
	});
</script>

<section class="rounded-lg shadow-xl text-sm p-4 h-52">
	<div bind:this={el} class="h-full w-full" />
</section>
