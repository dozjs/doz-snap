const Snap = require('../../');

const snap = new Snap('../SSR/public/index.html', {
    publicURL: 'http://localhost:63342/doz-snap/test/SSR/snap/',
    clearDir: true
});

(async ()=> {
    console.log('--START--');
    await snap.exec();
    console.log('--END--');
})();