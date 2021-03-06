import axios from 'axios';

export const getDataWithAxios = async (sourceLink) => {
  const response = await axios.get(
    sourceLink,
  );
  return response.data;
};

export const getDataWithAxiosAndParams = async (sourceLink, payload) => {
  const response = await axios.get(
    sourceLink,
    {
      params: payload,
    },
  );
  return response.data;
};

export const getDataUsingFetch = async (url) => fetch(url, {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
  .then((response) => response.json());
