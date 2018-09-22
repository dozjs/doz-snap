const PUBLIC_URL = '__DOZ_PRERENDER_PUBLIC_URL__';

function fixUrl(obj) {

    if (obj.props) {
        let prop;

        if (obj.props.href)
            prop = 'href';
        else if (obj.props.src)
            prop = 'src';

        if (prop && !/^http/.test(obj.props[prop])) {
            obj.props[prop] = window[PUBLIC_URL] + obj.props[prop];
        }
    }

    if (obj.children)
        obj.children.forEach(o => {
            if (typeof o === 'object')
                fixUrl(o);
        })
}

module.exports = function (Doz, app, options) {

    if (!window[PUBLIC_URL]) return;

    app.on('draw', (next) => {
        fixUrl(next);
    });
};