<script>
	import Navbar from "components/Navbar.svelte";
	import Footer from "components/Footer.svelte";
	import Map from "components/Map.svelte";
	import AttentionBar from "components/AttentionBar.svelte";
	import Profile from "components/Profile.svelte";
	import DateTime from "components/DateTime.svelte";
	import Layers from "components/Layers.svelte";
	import StyleSelector from "components/StyleSelector.svelte";

	import {getCurrentDateInYYYYMMDD, getCurrentTime} from 'utils/fetch-time.js';


	let collectionList = [];
	let selectedGeohash = null;
	let selectedDate = getCurrentDateInYYYYMMDD();
	let selectedTime = getCurrentTime();
	let mapStyle = "navigation-night-v1";
	let isReadyForStyleSwitching = false;
	let kingstonDetails = {
		id: 0,
		photoURL: "https://www.meme-arsenal.com/memes/bd75c0339be8bbe24aeecd9c64764321.jpg",
		displayName: "Kingston",
		center: [-76.5, 44.233334],
		zoom: 12,
		pitch: 45,
		bearing: -17.6,
	};
</script>

<Navbar />
<AttentionBar />

<section class="grid grid-cols-1  md:grid-cols-12  gap-4 py-4 px-4 h-fit">
	<div class="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-1 gap-4 h-fit">
		<div class="col-span-1 md:col-span-1 row-span-1">
			<Layers bind:collectionList  />
		</div>

		<div class="col-span-1 md:col-span-1 row-span-1">
			<DateTime bind:selectedDate bind:selectedTime/>
		</div>

		<div class="col-span-1 md:col-span-1 row-span-1">
			<Profile kingstonDetails={kingstonDetails} bind:selectedGeohash/>
		</div>

		<div class="col-span-1 md:col-span-1 row-span-1">
			<section class="rounded-lg shadow-xl text-sm p-4">
				<p class="font-bold my-1">Search Geohash Vehicle Data:</p>
			
				{#if selectedDate === "" || selectedTime === "" || selectedGeohash === null}
					<div class="bg-red-100 rounded-lg py-4 px-6  text-red-700 my-1" role="alert">Select a Date, Time, and Geohash before Searching.</div>
		
				{:else}
					
					<button  class={`card-btn   card-btn-green  w-full block my-1 rounded-lg`}> Search Data </button>
				{/if}
				
			</section>
		</div>

	</div>

	<div class="col-span-1 md:col-span-9 relative">
		<Map {kingstonDetails} bind:collectionList bind:mapStyle bind:isReadyForStyleSwitching bind:selectedGeohash/>

		<div class="absolute top-1 left-1 ">
			<StyleSelector bind:mapStyle bind:isReadyForStyleSwitching/>
		</div>
	</div>
</section>
<Footer />

<style>
</style>
