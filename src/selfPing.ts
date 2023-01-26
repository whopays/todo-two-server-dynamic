import https from 'https';

export default () => {
  setInterval(() => {
    https.get('https://todo-two-server.onrender.com/');

    console.log('pinged');
  }, 3 * 60 * 1000);
};
