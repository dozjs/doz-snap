const DozSSR = require('doz-ssr');
const Url = require('url');
const Path = require('path');
const fs = require('fs-extra');
const normalizeUrl = require('normalize-url');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const slash = require('super-trailing-slash');
const del = require('delete');
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
            clearDir: false,
            verbose: false
        }, opt);

        this.entryDir = Path.parse(entryFile).dir + '/';

        this.opt.outputDir = slash.add(this.opt.outputDir);
        this.opt.publicURL = slash.add(this.opt.publicURL);

        this.processedRoutes = [];
        this.processedRes = [];
        this.ssr = new DozSSR(entryFile, opt);

    }

    resolvePath(route) {
        const routePart = Url.parse(route);
        const routePathName = routePart.pathname;
        return Path.join(this.opt.outputDir, routePathName);
    }

    async write(route, content) {

        let finalPath;

        const routePathName = this.resolvePath(route);
        const routePathPart = Path.parse(routePathName);

        if (!routePathPart.ext) {
            finalPath = Path.join(routePathName, this.opt.indexFile);
        } else {
            finalPath = routePathName;
        }

        await fs.outputFile(finalPath, content);

        console.log('[done]', route);
    }

    async exec(route = '/') {
        console.log('[START] pre-rendering...');
        if (this.opt.clearDir) {
            console.log('[cleanup...]');
            await del.promise(this.opt.outputDir, {force: true});
        }
        await this.run(route);
        console.log('[END] pre-rendering');

        if (this.opt.verbose) {
            console.log('[Verbose]');
            console.log('Routes processed:');
            console.log(this.processedRoutes);
            console.log('Resources copied:');
            console.log(this.processedRes);
        }

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

        // Retrieve all element with href, src or srcset attribute
        const nodesUrl = _document.querySelectorAll('[href], [src], [srcset]');

        for (let i = 0; i < nodesUrl.length; i++) {
            const el = nodesUrl[i];
            await this.detectRes(el, route);
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

    async detectRes(el, route) {
        const destinationPart = Path.parse(route);
        const destination = !destinationPart.ext && !/^\?/.test(destinationPart.base)
            ? Path.join(destinationPart.dir, destinationPart.base)
            : destinationPart.dir;

        if (el.nodeName === 'A' && el.href && isLocalUrl(el.href)) {
            el.href = this.setNewSrc(el.href);
        } else if (el.nodeName !== 'A' && el.href && isLocalUrl(el.href)) {
            await this.processRes(el, 'href', destination);
        } else if (el.src && isLocalUrl(el.src)) {
            await this.processRes(el, 'src', destination);
        } else if (el.srcset && isLocalUrl(el.srcset)) {
            await this.processRes(el, 'srcset', destination);
        }
    }

    async processRes(el, attr, destination) {
        // Copy to relative folder
        const toFolder = Path.join(destination, Path.basename(el[attr]));
        if (!this.processedRes.includes(toFolder)) {
            await this.copyRes(el[attr], toFolder);
            this.processedRes.push(toFolder);
        }

        // Copy to root
        const toRoot = Path.basename(el[attr]);
        if (!this.processedRes.includes(toRoot)) {
            await this.copyRes(el[attr], toRoot);
            this.processedRes.push(el[attr]);
        }
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