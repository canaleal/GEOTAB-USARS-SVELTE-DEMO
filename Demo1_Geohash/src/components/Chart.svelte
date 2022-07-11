<script>
	import * as am5 from "@amcharts/amcharts5";
	import * as am5xy from "@amcharts/amcharts5/xy";
	import { onMount } from "svelte";

	let chartDiv;
	let selectedChartButton = "y"; // year default
	let chartData = [];
	let xAxis;
	let series;

	const changeSelectedButtonOnclick = (buttonType) => {
		selectedChartButton = buttonType;
		chartData = [];
		switch (buttonType) {
			case "y":
				for (let i = 0; i < 5; i++) {
					chartData.push({ time: 2021 - i, value: Math.floor(Math.random() * 200) + 1000 });
				}
				break;
			case "m":
				var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
				for (let i = 0; i < month.length; i++) {
					chartData.push({ time: month[i], value: Math.floor(Math.random() * 200) + 1000 });
				}
				break;
			case "d":
				for (let i = 0; i < 30; i++) {
					chartData.push({ time: i+1, value: Math.floor(Math.random() * 20) + 10 });
				}
				break;
		}

		xAxis.data.setAll(chartData);
		series.data.setAll(chartData);
	};

	onMount(() => {
		let root = am5.Root.new(chartDiv);
		let chart = root.container.children.push(am5xy.XYChart.new(root, {}));

		let xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
		xRenderer.labels.template.setAll({
			rotation: -90,
			centerY: am5.p50,
			centerX: am5.p100,
			paddingRight: 15,
		});

		xAxis = chart.xAxes.push(
			am5xy.CategoryAxis.new(root, {
				maxDeviation: 0.3,
				categoryField: "time",
				renderer: xRenderer,
				tooltip: am5.Tooltip.new(root, {}),
			})
		);

		let yAxis = chart.yAxes.push(
			am5xy.ValueAxis.new(root, {
				maxDeviation: 0.3,
				renderer: am5xy.AxisRendererY.new(root, {}),
			})
		);

		series = chart.series.push(
			am5xy.ColumnSeries.new(root, {
				name: "Series 1",
				xAxis: xAxis,
				yAxis: yAxis,
				valueYField: "value",
				sequencedInterpolation: true,
				categoryXField: "time",
				tooltip: am5.Tooltip.new(root, {
					labelText: "{valueY}",
				}),
			})
		);

		series.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5 });
		series.columns.template.adapters.add("fill", function (fill, target) {
			return chart.get("colors").getIndex(series.columns.indexOf(target));
		});

		series.columns.template.adapters.add("stroke", function (stroke, target) {
			return chart.get("colors").getIndex(series.columns.indexOf(target));
		});
		for (let i = 0; i < 5; i++) {
			chartData.push({ time: 2021 - i, value: Math.floor(Math.random() * 200) + 1000 });
		}
		xAxis.data.setAll(chartData);
		series.data.setAll(chartData);
	});
</script>

<section class="card h-fit">
	<p class="font-bold my-1">Chart:</p>
	<div bind:this={chartDiv} class="h-72 w-full" />
	<div class="flex">
		<button
			on:click={() => {
				changeSelectedButtonOnclick("y");
			}}
			class={`card-btn mx-1 text-center ${selectedChartButton == "y" ? "card-btn-blue" : ""}`}
		>
			Year
		</button>
		<button
			on:click={() => {
				changeSelectedButtonOnclick("m");
			}}
			class={`card-btn mx-1 text-center ${selectedChartButton == "m" ? "card-btn-blue" : ""}`}
		>
			Month
		</button>
		<button
			on:click={() => {
				changeSelectedButtonOnclick("d");
			}}
			class={`card-btn mx-1 text-center ${selectedChartButton == "d" ? "card-btn-blue" : ""}`}
		>
			Day
		</button>
	</div>
</section>
