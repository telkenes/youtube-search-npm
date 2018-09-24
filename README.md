# Youtube search npm
a simple youtube search package that gives a lot of information


# How to use
* download this package with `npm i youtube-search-npm`
* run the code below

__code example__

```javascript
const youtubesearch = require('youtube-search-npm') 
const ytsearch = new youtubesearch('ur yt api key kthx')

ytsearch.search('youtube').then(r => {
  console.log(r)
})
```



__Extra Information__
* by telk
* this package uses promises
