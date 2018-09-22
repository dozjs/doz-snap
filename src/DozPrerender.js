const DozSSR = require('doz-ssr');
const Url = require('url');
const Path = require('path');
const fs = require('fs-extra');
const normalizeUrl = require('normalize-url');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const slash = require('super-trailing-slash');
const util = require('util');
const clearDir = util.promisify(require('empty-dir'));
const PUBLIC_URL = '__DOZ_PRERENDER_PUBLIC_URL__';

function isLocalUrl(href) {
    const hrefPart = Url.parse(href);
    return hrefPart.protocol == null
}

class DozPrerender {

    constructor(entryFile, opt = {}) {

        this.opt = Object.assign({
            bundleId: 'bundle',
            docTypeString: '<!DOCTYPE html>',
            delayRender: 0,
            linkSelector: 'a[href]',
            indexFile: 'index.html',
            outputDir: 'dist',
            publicURL: '/',
            routerAttribute: 'router-link',
            clearDir: false
        }, opt);

        this.entryDir = Path.parse(entryFile).dir + '/';

        this.opt.outputDir = slash.add(this.opt.outputDir);
        this.opt.publicURL = slash.add(this.opt.publicURL);

        this.processedRoutes = [];
        this.processedRes = [];
        this.ssr = new DozSSR(entryFile, opt);

    }

    async write(route, content) {

        let finalPath;

        const routePart = Url.parse(route);
        const routePathName = routePart.pathname;
        const routePathPart = Path.parse(routePathName);

        if (!routePathPart.ext) {
            finalPath = `${routePathName}/${this.opt.indexFile}`;
        } else {
            finalPath = routePathName;
        }

        finalPath = Path.normalize(this.opt.outputDir + '/' + finalPath);

        await fs.outputFile(finalPath, content);

        console.log('[done]', route);
    }

    async exec(route = '/') {
        console.log('[START] pre-rendering...');
        if (this.opt.clearDir) {
            console.log('[cleanup...]');
            await clearDir(this.opt.outputDir);
        }
        await this.run(route);
        console.log('[END] pre-rendering');

        console.log(this.processedRoutes);
        console.log(this.processedRes);
        setImmediate(() => {
            process.exit(0);
        });
    }

    async run(route = '/') {

        if (this.processedRoutes.includes(route)) return;

        this.processedRoutes.push(route);

        console.log('[processing]', route);

        // Render
        let content = await this.ssr.render(route);

        // Retrieve all links
        const links = this.getLinks();

        let link;
        let href;

        // Iterate links
        for (let i = 0; i < links.length; i++) {
            link = links[i];
            link.removeAttribute(this.opt.routerAttribute);
            href = link.href;

            // Added only if is relative url
            if (isLocalUrl(href) && !this.processedRoutes.includes(href)) {
                await this.run(href);
            }
        }

        // here manipulate DOM

        // Create local DOM from rendered content
        const localDom = new JSDOM(content);
        const _document = localDom.window.document;

        // Retrieve all element with href o src attribute
        const nodesUrl = _document.querySelectorAll('[href], [src]');

        for (let i = 0; i < nodesUrl.length; i++) {
            const el = nodesUrl[i];
            await this.detectRes(el);
        }

        const bundleEl = _document.getElementById(this.opt.bundleId);

        if (bundleEl) {
            const js = _document.createElement('script');
            js.innerHTML = `window.${PUBLIC_URL} = '${this.opt.publicURL}';`;
            bundleEl.parentNode.insertBefore(js, bundleEl);
        }

        content = `${this.opt.docTypeString}${_document.documentElement.outerHTML}`;

        await this.write(route, content);

    }

    async copyRes(src, basename) {
        return fs.copy(
            `${this.entryDir}${src}`,
            `${this.opt.outputDir}${basename}`
        );
    }

    async detectRes(el) {
        if (el.nodeName === 'A' && el.href && isLocalUrl(el.href)) {
            el.href = this.setNewSrc(el.href);
        } else if (el.nodeName !== 'A' && el.href && isLocalUrl(el.href)) {
            await this.processRes(el, 'href');
        } else if (el.src && isLocalUrl(el.src)) {
            await this.processRes(el, 'src');
        }
    }

    async processRes(el, attr) {
        const basename = Path.basename(el[attr]);
        if (!this.processedRes.includes(el[attr])) {
            await this.copyRes(el[attr], basename);
            this.processedRes.push(el[attr]);
        }
        el[attr] = this.setNewSrc(basename);
    }

    setNewSrc(basename) {
        const newPath = `${this.opt.publicURL}${basename}`;
        return normalizeUrl(newPath);
    }

    getLinks() {
        return document.querySelectorAll(this.opt.linkSelector);
    }

}

module.exports = DozPrerender;