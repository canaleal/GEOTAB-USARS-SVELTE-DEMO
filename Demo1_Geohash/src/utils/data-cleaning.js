/* eslint-disable import/prefer-default-export */
export const removeEverySecondElementFromArray = (array) => {
  // Filtering Array of data to remove every second element
  const result = array.filter((element, index) => index % 2 === 0);
  return result;
};
