function getFullWindowPath() {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return null;
}

export const Data = {
  NEIGHBOURHOODS_URL: `${getFullWindowPath()}/data/neighbourhoods.geojson`,
  TREES_URL: `${getFullWindowPath()}/data/trees.geojson`,
  SIDEWALK_URL: `${getFullWindowPath()}/data/sidewalk.geojson`,
  ROADWORK_URL: `${getFullWindowPath()}/data/roadwork.geojson`,
  TREES_SEARCH_URL: 'https://mapboxdemoapi.ue.r.appspot.com/trees',
};

export default Data;
