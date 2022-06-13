<script>
	import * as am5 from "@amcharts/amcharts5";
	import * as am5xy from "@amcharts/amcharts5/xy";
	import { onMount } from "svelte";
    let chartDiv;
	onMount(() => {
		
		let root = am5.Root.new(chartDiv);
		let chart = root.container.children.push(
			am5xy.XYChart.new(root, {})
		);

		let xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
		xRenderer.labels.template.setAll({
			rotation: -90,
			centerY: am5.p50,
			centerX: am5.p100,
			paddingRight: 15,
		});

		let xAxis = chart.xAxes.push(
			am5xy.CategoryAxis.new(root, {
				maxDeviation: 0.3,
				categoryField: "year",
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

		let series = chart.series.push(
			am5xy.ColumnSeries.new(root, {
				name: "Series 1",
				xAxis: xAxis,
				yAxis: yAxis,
				valueYField: "value",
				sequencedInterpolation: true,
				categoryXField: "year",
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

		let data = [
			{
				year: "2014",
				value: 200,
			},
			{
				year: "2015",
				value: 250,
			},
			{
				year: "2016",
				value: 100,
			},
			{
				year: "2017",
				value: 50,
			},
			{
				year: "2018",
				value: 20,
			}
		];

		xAxis.data.setAll(data);
		series.data.setAll(data);
	});
</script>

<section class="card h-fit">
	<p class="font-bold my-1">Chart:</p>
	<div bind:this={chartDiv} class="h-72 w-full" />
</section>
