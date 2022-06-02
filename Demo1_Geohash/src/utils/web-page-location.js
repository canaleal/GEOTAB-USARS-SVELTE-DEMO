/* eslint-disable import/prefer-default-export */
export const getCurrentWebpageLocation = () => {
  const currentLocation = `${window.location.protocol}//${window.location.host}`;
  const rawUrl = `${currentLocation}/data/`;

  return rawUrl;
};
