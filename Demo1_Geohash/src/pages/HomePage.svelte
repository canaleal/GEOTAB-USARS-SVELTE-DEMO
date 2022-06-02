<script>
	import Navbar from "components/Navbar.svelte";
	import Footer from "components/Footer.svelte";
	import Map from "components/Map.svelte";
	import Profile from "components/Profile.svelte";
	import AttentionBar from "components/AttentionBar.svelte";
	import DateTime from "components/DateTime.svelte";
	import Layers from "components/Layers.svelte";
	import StyleSelector from "components/StyleSelector.svelte";

	let collectionList = [];
	let mapStyle = "outdoors-v11";
	let kingstonDetails = {
		id: 0,
		photoURL: "https://perspective.ca/wp-content/uploads/2018/10/city-of-kingston-ontario-perspective-globe-and-mail.jpg",
		displayName: "Kingston",
		center: [-76.5, 44.233334],
		zoom: 12,
		pitch: 45,
		bearing: -17.6,
	};
</script>

<Navbar />
<AttentionBar />

<section class="grid grid-cols-1  md:grid-cols-12  gap-4 py-4 px-4 h-screen">
	<div class="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-1 gap-4 h-fit">
		<div class="col-span-1 md:col-span-1 row-span-1">
			<Layers bind:collectionList {mapStyle} />
		</div>

		<div class="col-span-1 md:col-span-1 row-span-1">
			<DateTime />
		</div>
	</div>

	<div class="col-span-1 md:col-span-9 relative">
		<Map {kingstonDetails} bind:collectionList bind:mapStyle />

		<div class="absolute top-1 left-1 ">
			<StyleSelector bind:mapStyle />
		</div>
	</div>
</section>
<Footer />

<style>
</style>
