<script>
	import Navbar from "components/Navbar.svelte";
	import Footer from "components/Footer.svelte";
	import Map from "components/Map.svelte";
	import AttentionBar from "components/AttentionBar.svelte";
	import Profile from "components/Profile.svelte";
	import DateTime from "components/DateTime.svelte";
	import Layers from "components/Layers.svelte";
	import StyleSelector from "components/StyleSelector.svelte";
	import FormRequest from "components/FormRequest.svelte";
	import StreetView from "components/StreetView.svelte";
	import Chart from "components/Chart.svelte";
	import { Data } from "constants/index.js";
	import { getDataWithAxiosAndParams } from "utils/fetch-data.js";
	import { getCurrentDateInYYYYMMDD, getCurrentTime } from "utils/fetch-time.js";

	let selectedMenu = 1;
	let pointOfInterest = null;
	let collectionList = [];
	let selectedPolygon = null;
	let selectedDate = getCurrentDateInYYYYMMDD();
	let selectedTime = getCurrentTime();
	let mapStyle = "outdoors-v11";
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

	const fetchData = async() => {
		alert(`Fetching data for: ${selectedDate} at ${selectedTime} => Polygon : ${JSON.stringify(selectedPolygon.geometry.coordinates)}`);

		let payload = {
			date: selectedDate,
			time: selectedTime,
			polygon: JSON.stringify(selectedPolygon.geometry.coordinates),
		};
		const data = getDataWithAxiosAndParams(Data.TREES_SEARCH_URL, payload)
		console.log(data);
	};
</script>

<Navbar />
<AttentionBar bind:selectedMenu />

<section class="grid grid-cols-1  md:grid-cols-12 grid-rows-6  gap-4 pb-4 px-4 h-fit">
	<div class="col-span-1 md:col-span-3 row-span-6 grid grid-cols-1 md:grid-cols-1 gap-4 h-fit">
		<div class="col-span-1 md:col-span-1 row-span-1">
			<Layers bind:collectionList />
		</div>

		{#if selectedMenu === 1}
			<div class="col-span-1 md:col-span-1 row-span-1">
				<DateTime bind:selectedDate bind:selectedTime />
			</div>

			<div class="col-span-1 md:col-span-1 row-span-1">
				<Profile {kingstonDetails} bind:selectedPolygon />
			</div>

			<div class="col-span-1 md:col-span-1 row-span-1">
				<FormRequest bind:selectedDate bind:selectedTime bind:selectedPolygon {fetchData} />
			</div>
		{:else if selectedMenu === 2}
			<div class="col-span-1 md:col-span-1 row-span-1">
				<StreetView bind:pointOfInterest />
			</div>
		{:else if selectedMenu === 3}
			 <Chart />
		{/if}



	</div>

	<div class="col-span-1 md:col-span-9  row-span-6 relative">
		<Map {kingstonDetails} bind:collectionList bind:mapStyle bind:isReadyForStyleSwitching bind:selectedPolygon bind:pointOfInterest />
		<div class="absolute top-1 left-1 ">
			<StyleSelector bind:mapStyle bind:isReadyForStyleSwitching />
		</div>
	</div>
</section>
<Footer />

<style>
</style>
