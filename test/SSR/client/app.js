import Doz from 'doz'
import 'doz-router'
import imagePhoneUrl from './iphone.png'
import './style.css'
import 'font-awesome/css/font-awesome.min.css'
//import DozPreRenderPlugin from '../../../plugin'
import meta from 'metaset'

//Doz.use(DozPreRenderPlugin);

//Doz.component('doz-router', router);

Doz.component('home-page', {
    template() {
        return `
                <div><h1>I'm home page</h1> <img src="//avatars0.githubusercontent.com/u/12598754?s=800"/></div>
            `
    },
    onCreate() {
        console.log(this.tag, 'created');
        meta.setTitle('Home page');
    },
    onDestroy() {
        console.log(this.tag, 'destroyed')
    }
});

Doz.component('about-page', {
    template() {
        return `
                <div>I'm about page <img src="${imagePhoneUrl}"></div>
            `
    },
    onCreate() {
        console.log(this.tag, 'created');
        meta.setTitle('About page');
    },
    onDestroy() {
        console.log(this.tag, 'destroyed')
    }
});

Doz.component('extension-page', {
    template() {
        return `
                <div>I'm .html page</div>
            `
    },
    onCreate() {
        console.log(this.tag, 'created');
        meta.setTitle('Extension page');
    },
    onDestroy() {
        console.log(this.tag, 'destroyed')
    }
});

Doz.component('contact-page', {
    template() {
        return `
                <div>I'm contact page</div>
            `
    },
    onCreate() {
        console.log(this.tag, 'created');
        meta.setTitle('Contact page');
    },
    onDestroy() {
        console.log(this.tag, 'destroyed')
    }
});

Doz.component('profile-page', {
    template() {
        return `
                <div>I'm profile me page</div>
            `
    },
    onCreate() {
        console.log(this.tag, 'created');
        meta.setTitle('Profile page');
    },
    onDestroy() {
        console.log(this.tag, 'destroyed')
    }
});

Doz.component('user-details-page', {
    template() {
        return `
                <div>I'm user page with id "${this.props.id}", <a href="javascript:history.back()">back</a>  <img src="${imagePhoneUrl}"> </div>
            `
    },
    onCreate() {
        this.props.id = this.getComponentById('router')._param['id'];
        console.log(this.tag, 'created');
        meta.setTitle('User details page');
    },
    onDestroy() {
        console.log(this.tag, 'destroyed')
    }
});

Doz.component('search-page', {
    template() {
        return `
                <div>I'm search page with query "${this.props.query}"</div>
            `
    },
    onCreate() {
        this.props.query = this.getComponentById('router')._query['t'];
        console.log(this.tag, 'created');
        meta.setTitle('Search page');
    },
    onDestroy() {
        console.log(this.tag, 'destroyed')
    }
});

Doz.component('user-page', {
    template() {
        return `
                <div>I'm user page index, <a href="/user/10">show id 10</a></div>
            `
    },
    onCreate() {
        console.log(this.tag, 'created');
        meta.setTitle('User page');
    },
    onDestroy() {
        console.log(this.tag, 'destroyed')
    }
});

Doz.component('section-page', {
    template() {
        let id = this.getComponentById('router')._param['id'];
        return `
                <div>I'm section page index ${id}</div>
            `
    },
    onCreate() {
        console.log(this.tag, 'created');
        meta.setTitle('Section page');
    },
    onDestroy() {
        console.log(this.tag, 'destroyed')
    }
});

Doz.component('not-found-page', {
    template() {
        return `
                <div>404 page not found</div>
            `
    },
    onCreate() {
        console.log(this.tag, 'created');
        meta.setTitle('Not found page');
    },
    onDestroy() {
        console.log(this.tag, 'destroyed')
    }
});

Doz.component('navigate-buttons', {
    template() {
        return `
                <div>
                    <button onclick="this.$router('/about')">About</button>
                    <button onclick="this.$router('/profile/me')">Profile</button>
                    <button onclick="this.$router('/search/?t=hello')">Search hello</button>
                </div>
            `
    },
    $router(path) {
        this.getComponentById('router').$navigate(path);
    }
});

new Doz({
    root: '#app',
    template: `
            <div class="container">
                <nav>
                    <a data-router-link href="/">Home</a> |
                    <a data-router-link href="/about">About</a> |
                    <a data-router-link href="/profile/me">Profile</a> |
                    <a data-router-link href="/profile.html">.html</a> |
                    <a data-router-link href="/user/">User</a> |
                    <a data-router-link href="/search/?t=hello">Search hello</a> |
                    <a data-router-link href="/search/?t=ciao">Search ciao</a> |
                    <a data-router-link href="/contact">Contact</a> |
                    <a data-router-link href="/not-found-page-bla-bla">Not found</a> |
                    <a data-router-link href="/section/1">Section 1</a> |
                    <a data-router-link href="/section/2">Section 2</a> |
                    <a data-router-link href="/section/3">Section 3</a> |
                    <a data-router-link href="/section/4">Section 4</a>
                </nav>
                <navigate-buttons></navigate-buttons>
                <doz-router d:id="router" mode="history">
                    <home-page route="/"></home-page>
                    <about-page route="/about"></about-page>
                    <contact-page route="/contact"></contact-page>
                    <extension-page route="/profile.html"></extension-page>
                    <profile-page route="/profile/me"></profile-page>
                    <search-page route="/search"></search-page>
                    <user-page route="/user/"></user-page>
                    <user-details-page route="/user/:id"></user-details-page>
                    <not-found-page route="*"></not-found-page>
                    <section-page route="/section/:id" preserve></section-page>
                </doz-router>
            </div>
        `,
    onMount() {
        if (window.SSR)
            window.SSR.ready();
    }
});