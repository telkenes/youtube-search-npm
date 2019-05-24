# Youtube search npm
A simple to use youtube search package that maximizes the data given by the api


# How to use
* download this package with `npm i youtube-search-npm`
* run the one code below
* get an api key from [The Documentation Page](https://developers.google.com/youtube/v3/docs/)

__code example__

```javascript
const youtubesearch = require('youtube-search-npm') 
const ytsearch = new youtubesearch('ur yt api key kthx')

//search videos, channels, and playlists
ytsearch.search('youtube').then(r => {
  console.log(r)
})


//search a video
ytsearch.searchVideo('youtube').then(r => {
  console.log(r)
})

//search a channel
ytsearch.searchChannel('youtube').then(r => {
  console.log(r)
})
```
__Functions__
* search(term, opts)
* searchVideo(term, opts)
* searchChannel(term, opts)
* searchPlaylist(term, opts)
* getVideo(opts)
* getChannel(opts)
* playlistItems(opts)
