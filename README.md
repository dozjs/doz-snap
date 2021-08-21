# doz-snap
Pre-rendering for Doz

<a href="https://opensource.org/licenses/MIT" target="_blank"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" title="License: MIT"/></a>

> Works only with bundle provided by Parcel.

## Installation

```
npm install --save-dev doz-snap
```

## Usage

```
$ doz-snap -f ./public/index.html
```

### CLI
```
$ doz-snap --help

  Options:

    -f,     --entry-file        Entry file
    -b,     --bundle-id         Bundle script id    'bundle'
    -D,     --doc-type-string   Document type       '<!DOCTYPE html>'
    -d,     --delay-render      Delay render        0
    -s,     --link-selector     Link selector       'a[href]'
    -i,     --index-file        Index file          'index.html'
    -o,     --output-dir        Output directory'   'snap'
    -p,     --public-url        Public url          'http://localhost'
    -R,     --router-attribute  Router attribute    'data-router-link'
    --no-clear-dir              Disable clear directory before build
    --no-verbose                Disable verbose log
    --cname                     A domain in a file named CNAME
```

## Important
Once your static app has been created, however, you need a web server such as Apache, Nginx etc.

## Changelog
You can view the changelog <a target="_blank" href="https://github.com/dozjs/doz-snap/blob/master/CHANGELOG.md">here</a>

## License
doz-snap is open-sourced software licensed under the <a target="_blank" href="http://opensource.org/licenses/MIT">MIT license</a>

## Author
<a target="_blank" href="http://rica.li">Fabio Ricali</a>