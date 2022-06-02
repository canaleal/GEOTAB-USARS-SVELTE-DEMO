export const getCurrentDateTime = () => {
  const currentDate = new Date();
  const currentDateTime = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

  return currentDateTime;
};

export const getCurrentDate = () => {
  const currentDate = new Date();
  return currentDate;
};

export const getCurrentTime = () => {
  const currentDate = new Date();
  const currentTime = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
  return currentTime;
};
