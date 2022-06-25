<script>
	import { onMount } from "svelte";
	import { onDestroy } from "svelte";
	import { getDataWithAxios } from "utils/fetch-data.js";
	import { Data } from "constants/index.js";
	import { getListOfObjectWhereKeyContainsString } from "utils/filter-data.js";
	import MapboxDraw from "@mapbox/mapbox-gl-draw";
	import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

	// User ID passed from parent
	export let collectionList;
	export let selectedPolygon;
	export let mapStyle;
	export let isReadyForStyleSwitching;
	export let kingstonDetails;
	export let pointOfInterest;
	export let treesData;

	let layerDictionary;
	let isDataLoaded = false;
	let map;
	const small_popup = new mapboxgl.Popup();

	const fetchInitialMapData = async () => {
		try {
			let tempList = [];
			let tempDictionary = {};

			tempList.push({ id: 0, menu: 1, icon: "fa-building", type: "Polygon", isShown: true, name: "Buildings", layerName: "add-3d-buildings", sourceName: "building" });
			tempDictionary["Buildings"] = 0;

			tempList.push({ id: 1, menu: 1, icon: "fa-cloud", type: "Polygon", isShown: true, name: "sky", layerName: "sky", sourceName: "sky" });
			tempDictionary["Sky"] = 1;

			// // Neighbourhoods Data
			let neighbourhoodsLayerName = "Neighbourhoods";
			let neighbourhoodsSourceName = "neighbourhoodsSource";
			let neighbourhoodsData = await getDataWithAxios(Data.NEIGHBOURHOODS_URL);
			tempList.push({
				id: 2,
				menu: 1,
				icon: "fa-border-all",
				type: "Polygon",
				isShown: false,
				name: neighbourhoodsLayerName,
				layerName: neighbourhoodsLayerName,
				sourceName: neighbourhoodsSourceName,
				data: neighbourhoodsData,
			});
			tempList.push({
				id: 3,
				menu: 1,
				icon: "fa-border-all",
				type: "Polygon",
				isShown: false,
				name: neighbourhoodsLayerName + " Outline",
				layerName: neighbourhoodsLayerName + " Outline",
				sourceName: neighbourhoodsSourceName,
				data: neighbourhoodsData,
			});

			tempDictionary["Neighbourhoods"] = 2;
			tempDictionary["Neighbourhoods_Outline"] = 3;

			
			collectionList = tempList;
			layerDictionary = tempDictionary;
			console.log(layerDictionary);
		} catch (e) {}
	};

	const addDataSources = () => {
		try {
			const neighbourhoodsList = collectionList[layerDictionary["Neighbourhoods"]];
			map.addSource(neighbourhoodsList.sourceName, {
				type: "geojson",
				data: neighbourhoodsList.data,
			});

			isDataLoaded = true;
			addLayers();
		} catch (e) {
			console.error(e);
		}
	};

	const addLayers = () => {
		addTerrainLayer();
		addBuildingLayer(collectionList[layerDictionary["Buildings"]]);
		addNeighbourhoodsLayer(collectionList[layerDictionary["Neighbourhoods"]], collectionList[layerDictionary["Neighbourhoods_Outline"]]);
	};

	const addTerrainLayer = () => {
		map.addSource("mapbox-dem", {
			type: "raster-dem",
			url: "mapbox://mapbox.mapbox-terrain-dem-v1",
			tileSize: 512,
			maxzoom: 14,
		});
		// add the DEM source as a terrain layer with exaggerated height
		map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

		// add a sky layer that will show when the map is highly pitched
		map.addLayer({
			id: "sky",
			type: "sky",
			paint: {
				"sky-type": "atmosphere",
				"sky-atmosphere-sun": [0.0, 0.0],
				"sky-atmosphere-sun-intensity": 15,
			},
		});
	};

	const addBuildingLayer = (fillList) => {
		map.addLayer({
			id: fillList.layerName,
			source: "composite",
			"source-layer": "building",
			filter: ["==", "extrude", "true"],
			type: "fill-extrusion",
			minzoom: 15,
			paint: {
				"fill-extrusion-color": "#dee7e7",
				"fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
				"fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
				"fill-extrusion-opacity": 1,
			},
		});
	};

	const addNeighbourhoodsLayer = (fillList, outlineList) => {
		map.addLayer({
			id: fillList.layerName,
			type: "fill",
			source: fillList.sourceName,
			layout: {},
			paint: {
				"fill-color": ["get", "fill"],
				"fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.5, 0.2],
			},
		});
		map.setLayoutProperty(fillList.layerName, "visibility", "none");

		map.addLayer({
			id: outlineList.layerName,
			type: "line",
			source: outlineList.sourceName,
			layout: {},
			paint: {
				"line-color": "#ffffff",
				"line-width": 1,
			},
		});
		map.setLayoutProperty(outlineList.layerName, "visibility", "none");

		let hoveredStateId = null;
		map.on("mousemove", fillList.layerName, (e) => {
			if (e.features.length > 0) {
				if (hoveredStateId !== null) {
					map.setFeatureState({ source: fillList.sourceName, id: hoveredStateId }, { hover: false });
				}

				hoveredStateId = e.features[0].id;
				map.setFeatureState({ source: fillList.sourceName, id: hoveredStateId }, { hover: true });
			}
		});

		map.on("mouseleave", fillList.layerName, () => {
			if (hoveredStateId !== null) {
				map.setFeatureState({ source: fillList.sourceName, id: hoveredStateId }, { hover: false });
			}
			hoveredStateId = null;
		});
	};

	const addTreesLayer = (fillList) => {
		map.addLayer(
			{
				id: fillList.layerName,
				type: "circle",
				source: fillList.sourceName,
				minzoom: 12,

				paint: {
					"circle-radius": [
						"interpolate",
						["linear"],
						["zoom"],
						7,
						["interpolate", ["linear"], ["get", "trunk_diameter"], 1, 2, 3, 4],
						16,
						["interpolate", ["linear"], ["get", "trunk_diameter"], 3, 6, 9, 12],
					],

					"circle-color": "green",
				},
			},
			"waterway-label"
		);
		map.setLayoutProperty(fillList.layerName, "visibility", "none");
		map.moveLayer(fillList.layerName);

		map.on("click", fillList.layerName, (e) => {
			let description = "";
			const sliced = Object.fromEntries(Object.entries(e.features[0].properties).slice(0, 4));
			for (const [key, value] of Object.entries(sliced)) {
				description += `<span class="block font-bold">${key}</span><span class="block">${value}</span>`;
			}
			small_popup.setLngLat(e.lngLat).setHTML(description).addTo(map);
			pointOfInterest = { lat: e.lngLat["lat"], lng: e.lngLat["lng"] };
		});

		// Change the cursor to a pointer when the mouse is over the places layer.
		map.on("mouseenter", fillList.layerName, (e) => {
			map.getCanvas().style.cursor = "pointer";
		});

		// Change it back to a pointer when it leaves.
		map.on("mouseleave", fillList.layerName, () => {
			map.getCanvas().style.cursor = "";
		});
	};

	// const addLineLayer = (fillList, color) => {
	// 	map.addLayer({
	// 		id: fillList.layerName,
	// 		type: "line",
	// 		source: fillList.sourceName,
	// 		layout: {
	// 			"line-join": "round",
	// 			"line-cap": "round",
	// 		},
	// 		paint: {
	// 			"line-color": color,
	// 			"line-width": 4,
	// 		},
	// 	});

	// 	map.on("click", fillList.layerName, (e) => {
	// 		let description = "";
	// 		const sliced = Object.fromEntries(Object.entries(e.features[0].properties).slice(0, 4));
	// 		for (const [key, value] of Object.entries(sliced)) {
	// 			description += `<span class="block font-bold">${key}</span><span class="block">${value}</span>`;
	// 		}
	// 		small_popup.setLngLat(e.lngLat).setHTML(description).addTo(map);
	// 	});

	// 	// Change the cursor to a pointer when the mouse is over the places layer.
	// 	map.on("mouseenter", fillList.layerName, (e) => {
	// 		map.getCanvas().style.cursor = "pointer";
	// 	});

	// 	// Change it back to a pointer when it leaves.
	// 	map.on("mouseleave", fillList.layerName, () => {
	// 		map.getCanvas().style.cursor = "";
	// 	});
	// };

	const updatePolygon = ({ features }) => {
		selectedPolygon = features[0];
	};

	const clearPolygon = () => {
		selectedPolygon = null
	}

	const addDynamicTrees = () =>{

		let tempList = collectionList;
		let treesLayerName = "Trees";
		let treesSourceName = "treesSource";

		try{
			// Remove the old layer and source if they exist
			if(map.getLayer(treesLayerName)){
				map.removeLayer(treesLayerName);
				map.removeSource(treesSourceName);
			}
		
			let treesList = { id: 4, icon: "fa-tree", type: "Point", isShown: true, name: treesLayerName, layerName: treesLayerName, sourceName: treesSourceName, data: treesData };
			tempList.push(treesList);
			collectionList = tempList;

			map.addSource(treesList.sourceName, {
				type: "geojson",
				data: treesList.data,
			});

			addTreesLayer(treesList);
			map.resize();
		}
		catch(err){
			console.log(err);
		}
	}

	$: treesData && treesData!=null && addDynamicTrees();

	const addFilter = () => {
		// If map not loaded, abort
		if (map === null) return;

		try {
			// If any of the layers are not loaded, abort
			for (let i = 0; i < collectionList.length; i++) {
				const tempLayerName = collectionList[i]["layerName"];
				const tempLayerIsShown = collectionList[i]["isShown"];

				if (!map.getLayer(tempLayerName)) {
					return;
				}

				if (tempLayerIsShown === true) {
					map.setLayoutProperty(tempLayerName, "visibility", "visible");
				} else {
					map.setLayoutProperty(tempLayerName, "visibility", "none");
				}

				if (tempLayerName.includes("Trees") && tempLayerIsShown === false) {
					small_popup.remove();
				}
			}
		} catch (e) {}
	};
	$: collectionList && isDataLoaded && addFilter();

	const switchStyle = () => {
		if (isReadyForStyleSwitching === false) return;
		try {
			map.setStyle("mapbox://styles/mapbox/" + mapStyle);
			small_popup.remove();
			selectedPolygon = null;
		} catch (e) {}
	};
	$: mapStyle && isDataLoaded && switchStyle();

	onMount(async () => {
		// Get the initial Data
		await fetchInitialMapData();

		mapboxgl.accessToken = "pk.eyJ1IjoiY2FuYWxlYWwiLCJhIjoiY2t6NmgzdGd0MTBhcTJ3bXprNjM1a3NsbiJ9.umUsk2Ky68kLBFUa6PeAxA";
		map = new mapboxgl.Map({
			center: kingstonDetails.center,
			zoom: kingstonDetails.zoom,
			pitch: kingstonDetails.pitch,
			bearing: kingstonDetails.bearing,
			container: "map",
			antialias: true,
			style: "mapbox://styles/mapbox/" + mapStyle,
		});

		const draw = new MapboxDraw({
			displayControlsDefault: false,
			// Select which mapbox-gl-draw control buttons to add to the map.
			controls: {
				polygon: true,
				trash: true,
			},
			// Set mapbox-gl-draw to draw by default.
			// The user does not have to click the polygon control button first.
			defaultMode: "draw_polygon",
		});
		map.addControl(draw, "bottom-left");

		map.addControl(
			new MapboxGeocoder({
				accessToken: mapboxgl.accessToken,
				mapboxgl: mapboxgl,
			})
		);

		map.addControl(new mapboxgl.FullscreenControl(), "bottom-right");
		map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

		map.on("style.load", function () {
			addDataSources();
			addFilter();
		});
		map.on("draw.create", updatePolygon);
		map.on("draw.delete", clearPolygon);
		map.on("draw.update", updatePolygon);
	});

	onDestroy(() => {
		try {
			// Remove all the layers and data sources as they are cached and take up a lot of memory
			for (let i = 0; i < collectionList.length; i++) {
				map.removeLayer(collectionList[i]["layerName"]);
				map.removeSource(collectionList[i]["sourceName"]);
			}
			map = null;
		} catch (e) {}
	});
</script>

<div class="h-96 md:h-full"><div class="h-full rounded-lg" id="map"></div></div>
