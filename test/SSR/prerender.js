const DozPrerender = require('../../');

const prerender = new DozPrerender('../SSR/public/index.html', {
    publicUrl: 'http://localhost:63342/doz-prerender/test/SSR/dist/'
});

prerender
    .run()
    .then();