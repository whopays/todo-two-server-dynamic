import https from 'https';

export default () => {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  setInterval(() => {
    https.get('https://todo-two-server.onrender.com/health');

    console.log('pinged');
  }, 3 * 60 * 1000);
};
