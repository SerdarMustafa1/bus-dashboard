export default (data) => {
  const date = new Date(data);
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${date.getFullYear()}`;
};

export const formatDateTime = () => {
  console.log('Not implemented!');
  return 'Not implemented';
};
