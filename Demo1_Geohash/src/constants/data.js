function getFullWindowPath() {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return null;
}

export const Data = {
  GEOHASH_URL: `${getFullWindowPath()}/data/kingston-neighbourhood.geojson`,
  NEIGHBOURHOODS_URL: `${getFullWindowPath()}/data/neighbourhoods.geojson`,
  TREES_URL: `${getFullWindowPath()}/data/trees.geojson`,

};

export default Data;
