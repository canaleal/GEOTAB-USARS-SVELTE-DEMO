import { pedestrians_data } from '../data/pedestrians.js';
import turfPoint from 'turf-point';
import turfPolygon from 'turf-polygon';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

const filterPedestrians = (search_polygon) =>{

    const polygon = turfPolygon(search_polygon);
    const pedestrians = pedestrians_data.features;
    const filteredPedestrians = pedestrians.filter(tree => {
        const point = turfPoint([pedestrians.geometry.coordinates[0], pedestrians.geometry.coordinates[1]]);
        const isInside = booleanPointInPolygon(point, polygon);
        if(isInside){
            return true;
        }
    }
    );
    return filteredPedestrians;
}


export const getPedestrians = (req, res) => {

    const { polygon } = req.query;
    if(polygon){
        const search_polygon = JSON.parse(polygon);
        const filteredPedestrians = filterPedestrians(search_polygon);
        let data = {type: "FeatureCollection", features: filteredPedestrians};
        res.send(data);
    }
    else{
        const search_polygon = [[[-76.54860136610944,44.23781656965602],[-76.54346754418007,44.23904628801034],[-76.54304981355291,44.23707114151949],[-76.54854327075333,44.23687163655123],[-76.54860136610944,44.23781656965602]]];
        const filteredPedestrians = filterPedestrians(search_polygon);
        let data = {type: "FeatureCollection", features: filteredPedestrians};
        res.send(data);
    }
}