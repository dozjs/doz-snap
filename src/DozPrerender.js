const DozSSR = require('doz-ssr');
const url = require('url');
const path = require('path');
const fs = require('fs-extra');
const normalizeUrl = require('normalize-url');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

function isLocalUrl(href) {
    const hrefPart = url.parse(href);
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

        this.entryDir = path.parse(entryFile).dir;
        this.processed = [];
        this.ssr = new DozSSR(entryFile, opt);
    }

    async write(route, content) {

        let finalPath;

        const routePart = url.parse(route);
        const routePathName = routePart.pathname;
        const routePathPart = path.parse(routePathName);

        if (!routePathPart.ext) {
            finalPath = `${routePathName}/${this.opt.indexFile}`;
        } else {
            finalPath = routePathName;
        }

        finalPath = path.normalize(this.opt.outputDir + '/' + finalPath);

        await fs.outputFile(finalPath, content);
    }

    async run(route = '/') {

        if (this.processed.includes(route)) return;

        this.processed.push(route);

        // Render
        await this.ssr.render(route);

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

        let content = this.ssr.getContent();

        // here manipulate DOM

        // Create local DOM from rendered content
        const localDom = new JSDOM(content);

        // Retrieve all element with href o src attribute
        const nodesUrl = localDom.window.document.querySelectorAll('[href], [src]');

        //
        for (let i = 0; i < nodesUrl.length; i++) {
            const el = nodesUrl[i];

            if (el.href && isLocalUrl(el.href)) {
                el.href = normalizeUrl(`${this.opt.publicUrl}/${el.href}`);
            } else if (el.src && isLocalUrl(el.src)) {

                await fs.copy(`${this.entryDir}${el.src}`, `${this.opt.outputDir}/${path.basename(el.src)}`);

                //console.log('OLD', (`${this.entryDir}${el.src}`));
                //console.log('NEW', normalizeUrl(`${this.opt.publicUrl}/${path.basename(el.src)}`));
                el.src = normalizeUrl(`${this.opt.publicUrl}/${path.basename(el.src)}`);
            }
        }

        content = `${this.opt.docTypeString}${localDom.window.document.documentElement.outerHTML}`;

        await this.write(route, content);


    }

    getLinks() {
        return document.querySelectorAll(this.opt.linkSelector);
    }

}

module.exports = DozPrerender;