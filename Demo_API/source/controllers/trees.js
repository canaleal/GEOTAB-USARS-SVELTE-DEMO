import { trees_data } from '../data/trees.js';
import turfPoint from 'turf-point';
import turfPolygon from 'turf-polygon';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

const filterTrees = (search_polygon) =>{

    const polygon = turfPolygon(search_polygon);
    const trees = trees_data.features;
    const filteredTrees = trees.filter(tree => {
        const point = turfPoint([tree.geometry.coordinates[0], tree.geometry.coordinates[1]]);
        const isInside = booleanPointInPolygon(point, polygon);
        if(isInside){
            return true;
        }
    }
    );
    return filteredTrees;
}


export const getTrees = (req, res) => {
    const { raw_polygon } = req.params;
    if(raw_polygon){
        const search_polygon = JSON.parse(raw_polygon);
        const filteredTrees = filterTrees(search_polygon);
        res.send(filteredTrees);
    }
    else{
        const search_polygon = [[[-76.54860136610944,44.23781656965602],[-76.54346754418007,44.23904628801034],[-76.54304981355291,44.23707114151949],[-76.54854327075333,44.23687163655123],[-76.54860136610944,44.23781656965602]]];
        const filteredTrees = filterTrees(search_polygon);
        res.send(filteredTrees);
    }
}