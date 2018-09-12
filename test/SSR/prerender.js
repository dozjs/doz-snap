const DozPrerender = require('../../');

const prerender = new DozPrerender('../SSR/public/index.html', {
    publicURL: 'http://localhost:63342/doz-prerender/test/SSR/dist/',
    clearDir: true
});

console.log('--START--');

prerender
    .exec()
    .then(() => {
        console.log('--END--');
    })
    .catch(e => {
        console.log(e);
    });