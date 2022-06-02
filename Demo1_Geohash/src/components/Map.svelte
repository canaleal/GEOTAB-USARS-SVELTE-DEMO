<script>
	import { onMount } from "svelte";
	import { onDestroy } from "svelte";
	import { getDataWithAxios } from "utils/fetch-data.js";
	import { Data } from "constants/index.js";

	// User ID passed from parent
	export let collectionList;
	export let mapStyle;
	export let kingstonDetails;
	let isDataLoaded = false;
	let map;

	const addDataSources = async () => {
		try {
			let tempList = [];

			tempList.push({ id: 0, type: "Polygon", isShown: true, name: "Buildings", layerName: "add-3d-buildings", sourceName: "building" });
			tempList.push({ id: 1, type: "Polygon", isShown: true, name: "Sky Box", layerName: "sky", sourceName: "sky" });

			try {
				// Kingston geohash Data
				let geohashLayerName = "Kingston_Geohash";
				let geohashSourceName = "geohashSource";
				let geohashData = await getDataWithAxios(Data.GEOHASH_URL);
				map.addSource(geohashSourceName, {
					type: "geojson",
					data: geohashData,
				});
				tempList.push({ id: 2, type: "Polygon", isShown: true, name: geohashLayerName, layerName: geohashLayerName, sourceName: geohashSourceName });
				tempList.push({ id: 3, type: "Polygon", isShown: true, name: geohashLayerName + " Outline", layerName: geohashLayerName + " Outline", sourceName: geohashSourceName });
		
			} catch (e) {}

			try {
				// Neighbourhoods Data
				let neighbourhoodsLayerName = "Neighbourhoods";
				let neighbourhoodsSourceName = "neighbourhoodsSource";
				let neighbourhoodsData = await getDataWithAxios(Data.NEIGHBOURHOODS_URL);
				map.addSource(neighbourhoodsSourceName, {
					type: "geojson",
					data: neighbourhoodsData,
				});

				tempList.push({ id: 4, type: "Polygon", isShown: true, name: neighbourhoodsLayerName, layerName: neighbourhoodsLayerName, sourceName: neighbourhoodsSourceName });
				tempList.push({ id: 5, type: "Polygon", isShown: true, name: neighbourhoodsLayerName + " Outline", layerName: neighbourhoodsLayerName + " Outline", sourceName: neighbourhoodsSourceName });
			
			} catch (e) {}

			try {
				let treesLayerName = "Trees";
				let tressSourceName = "tressSource";
				let tressData = await getDataWithAxios(Data.TREES_URL);
				map.addSource(tressSourceName, {
					type: "geojson",
					data: tressData,
				});
				tempList.push({ id: 6, type: "Point", isShown: true, name: treesLayerName, layerName: treesLayerName, sourceName: tressSourceName });
				
			} catch (e) {}

			collectionList = tempList;
			isDataLoaded = true;
			addLayers(collectionList);
		} catch (e) {
			console.log(e);
		}
	};

	const addLayers = (tempList) => {
		addTerrainLayer(tempList[0]);
		addBuildingLayer(tempList[1]);
		addKingstonGeoHashLayer(tempList[2], tempList[3]);
		addNeighbourhoodsLayer(tempList[4], tempList[5]);
		addTreesLayer(tempList[6]);
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

	const addBuildingLayer = () => {
		// Insert the layer beneath any symbol layer.
		// The 'building' layer in the Mapbox Streets
		// vector tileset contains building height data
		// from OpenStreetMap.
		map.addLayer({
			id: "add-3d-buildings",
			source: "composite",
			"source-layer": "building",
			filter: ["==", "extrude", "true"],
			type: "fill-extrusion",
			minzoom: 15,
			paint: {
				"fill-extrusion-color": "#aaa",

				// Use an 'interpolate' expression to
				// add a smooth transition effect to
				// the buildings as the user zooms in.
				"fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
				"fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
				"fill-extrusion-opacity": 0.6,
			},
		});
	};

	const addKingstonGeoHashLayer = (fillList, outlineList) => {
		map.addLayer({
			id: fillList.layerName,
			type: "fill",
			source: fillList.sourceName,
			layout: {},
			paint: {
				"fill-color": "#fe1615", // blue color fill
				"fill-opacity": 0.3,
			},
		});

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
	};

	const addNeighbourhoodsLayer = (fillList, outlineList) => {
		map.addLayer({
			id: fillList.layerName,
			type: "fill",
			source: fillList.sourceName,
			layout: {},
			paint: {
				"fill-color": ["get", "fill"],
				"fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.8, 0.5],
			},
		});

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

		// When a click event occurs on a feature in the places layer, open a popup at the
		// location of the feature, with description HTML from its properties.
		map.on("click", fillList.layerName, (e) => {
			// Copy coordinates array.
			const coordinates = e.features[0].geometry.coordinates.slice();

			// Add features to the description
			let description = "";
			const sliced = Object.fromEntries(Object.entries(e.features[0].properties).slice(0, 3));
			for (const [key, value] of Object.entries(sliced)) {
				description += `<span class="block font-bold">${key}</span><span class="block">${value}</span>`;
			}

			while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
				coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
			}

			new mapboxgl.Popup().setLngLat(coordinates).setHTML(description).addTo(map);
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

	const addFilter = () => {
		// If map not loaded, abort
		if (map === null) return;

		try {
			// If any of the layers are not loaded, abort
			for (let i = 0; i < collectionList.length; i++) {
				let tempLayerName = collectionList[i]["layerName"];
				let tempLayerIsShown = collectionList[i]["isShown"];

				if (!map.getLayer(tempLayerName)) {
					console.log("No layer found");
					return;
				}

				if (tempLayerIsShown === true) {
					map.setLayoutProperty(tempLayerName, "visibility", "visible");
				} else {
					map.setLayoutProperty(tempLayerName, "visibility", "none");
				}
			}
		} catch (e) {
			console.log(e);
		}
	};

	$: collectionList && isDataLoaded && addFilter();

	const switchStyle = () => {
		map.setStyle("mapbox://styles/mapbox/" + mapStyle);
		map.resize();
	};

	$: mapStyle && isDataLoaded && switchStyle();

	onMount(async () => {
		mapboxgl.accessToken = "pk.eyJ1IjoiY2FuYWxlYWwiLCJhIjoiY2t6NmgzdGd0MTBhcTJ3bXprNjM1a3NsbiJ9.umUsk2Ky68kLBFUa6PeAxA";
		map = new mapboxgl.Map({
			center: kingstonDetails.center,
			zoom: kingstonDetails.zoom,
			pitch: kingstonDetails.pitch,
			bearing: kingstonDetails.bearing,
			container: "map",
			antialias: true,
			style: "mapbox://styles/mapbox/outdoors-v11",
		});

		map.addControl(
			new MapboxGeocoder({
				accessToken: mapboxgl.accessToken,
				mapboxgl: mapboxgl,
			})
		);

		map.addControl(new mapboxgl.FullscreenControl(), "bottom-right");
		map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

		map.on("load", () => {
			addDataSources();
		});

		map.on("style.load", function () {
			addDataSources();
		});
	});

	onDestroy(() => {
		for (let i = 0; i < collectionList.length; i++) {
			let tempLayerName = collectionList[i]["layerName"];
			let tempSourceName = collectionList[i]["sourceName"];

			map.removeLayer(tempLayerName);
			map.removeSource(tempSourceName);
		}

		map = null;
	});
</script>

<div id="map" class="h-96 md:h-full rounded-lg shadow-xl" />

<style>
</style>
