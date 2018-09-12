const DozPrerender = require('../../');

const prerender = new DozPrerender('../SSR/public/index.html', {
    publicUrl: 'http://localhost:63342/doz-prerender/test/SSR/dist/'
});

console.log('--START--');

prerender
    .run()
    .then(() => {
        console.log('--END--');
        process.exit(0);
    })
    .catch(e => {
        console.log(e);
    });