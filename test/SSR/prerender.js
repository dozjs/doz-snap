const DozPrerender = require('../../');

const prerender = new DozPrerender('../SSR/public/index.html', {
    publicURL: 'http://localhost:63342/doz-prerender/test/SSR/dist/',
    clearDir: true
});

(async ()=> {
    console.log('--START--');
    await prerender.exec();
    console.log('--END--');
})();