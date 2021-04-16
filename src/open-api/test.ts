export const log = () => {
  console.log(fetch);
  const data = new FormData();
  data.append('file', new File(['string'], 'test.json'));
  console.log('FormData', data.get('file'));
};
