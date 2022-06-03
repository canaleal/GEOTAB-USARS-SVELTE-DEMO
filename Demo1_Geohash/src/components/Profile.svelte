<script>
	import { getCurrentDateTime } from "utils/fetch-time";
	export let kingstonDetails;
</script>

<section class="rounded-lg shadow-xl text-sm">

	<div class="p-4">
		<p class="font-bold my-2">City:</p>
		<p>{kingstonDetails.displayName}</p>

		<p class="font-bold my-2">Map Data:</p>
		<p>Data taken from API on {getCurrentDateTime()}</p>
	</div>
</section>
