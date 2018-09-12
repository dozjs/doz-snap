const DozSSR = require('doz-ssr');
const Url = require('url');
const Path = require('path');
const fs = require('fs-extra');
const normalizeUrl = require('normalize-url');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const slash = require("super-trailing-slash");

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
            publicUrl: '/',
            routerAttribute: 'router-link'
        }, opt);

        this.entryDir = Path.parse(entryFile).dir + '/';

        this.opt.outputDir = slash.add(this.opt.outputDir);
        this.opt.publicUrl = slash.add(this.opt.publicUrl);

        this.processed = [];
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
    }

    async run(route = '/') {

        if (this.processed.includes(route)) return;

        this.processed.push(route);

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
            if (isLocalUrl(href) && !this.processed.includes(href)) {
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

            await this.saveStaticRes(el);

        }

        const bundleEl = _document.getElementById(this.opt.bundleId);

        if (bundleEl) {
            const js = _document.createElement('script');
            js.innerHTML = 'window.__DOZ_PRERENDER__ = true';
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

    async saveStaticRes(el) {
        let basename;

        if (el.href && isLocalUrl(el.href)) {

            basename = Path.basename(el.href);
            await this.copyRes(el.href, basename);
            el.href = this.setNewSrc(basename);

        } else if (el.src && isLocalUrl(el.src)) {

            basename = Path.basename(el.src);
            await this.copyRes(el.src, basename);
            el.src = this.setNewSrc(basename);
        }
    }

    setNewSrc(basename) {
        return normalizeUrl(`${this.opt.publicUrl}${basename}`);
    }

    getLinks() {
        return document.querySelectorAll(this.opt.linkSelector);
    }

}

module.exports = DozPrerender;