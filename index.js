const querystring = require('querystring')
const phin = require('phin')

class youtubesearch {
  constructor(key) {
    if (typeof key !== 'string') throw new Error('The YouTube API key you provided was not a string.');
    this.key = key;
  }

  //search function
  search(term, opts) {
    //allowed properties to be used in search
    let allowedProperties=["fields","channelId","channelType","eventType","forContentOwner","forDeveloper","forMine","location","locationRadius","onBehalfOfContentOwner","order","pageToken","publishedAfter","publishedBefore","regionCode","relatedToVideoId","relevanceLanguage","safeSearch","topicId","type","videoCaption","videoCategoryId","videoDefinition","videoDimension","videoDuration","videoEmbeddable","videoLicense","videoSyndicated","videoType","key"];

    //return promise
    return new Promise(async (resolve, reject) => {
      //check if the term and object is valid
      if (!term || term === '' || typeof term !== 'string') return reject('The term you provided was not valid')
      if (opts && typeof opts !== 'object') return reject('Options parameter must be an object')
      if (!opts) opts = {}
      opts.key = this.key

      let params = {
        q: term,
        part: 'snippet',
        maxResults: opts && opts.maxResults || 10
      }

      Object.keys(opts).map(function(k) {
        if (allowedProperties.indexOf(k) > -1) params[k] = opts[k]
      })

      let key = this.key
      phin('https://www.googleapis.com/youtube/v3/search?' + querystring.stringify(params)).then(res => {
        try {
          let result = JSON.parse(res.body)

          if (result.error) {
            reject(new Error(result.error.errors.shift().message))

            return
          }

          let pageInfo = {
            totalResults: result.pageInfo.totalResults,
            resultsPerPage: result.pageInfo.resultsPerPage,
            nextPageToken: result.nextPageToken,
            prevPageToken: result.prevPageToken
          }

          let findings = [];
          let index = 0;
          result.items.forEach(async (item) => {
            let dis = {
              kind: item.id.kind,
              publishedAt: item.snippet.publishedAt,
              channel: {
                id: item.snippet.channelId,
                title: item.snippet.channelTitle
              },
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnails: item.snippet.thumbnails,
            }
            let link = ''
            let id = ''
            switch (item.id.kind) {
              case 'youtube#channel':
                link = 'https://www.youtube.com/channel/' + item.id.channelId
                id = item.id.channelId
                let channel = await this.getChannel({
                  id: id,
                  part: 'snippet,statistics',
                })
                dis.id = id
                dis.link = channel[0].link
                dis.country = channel[0].country
                dis.statistics = channel[0].statistics
                break
              case 'youtube#playlist':
                link = 'https://www.youtube.com/playlist?list=' + item.id.playlistId
                id = item.id.playlistId
                dis.id = id
                dis.link = link
                let playlist = await this.playlistItems({
                  playlistId: id
                })
                dis.items = playlist
                dis.itemCount = playlist.length
                break
              default:
                link = 'https://www.youtube.com/watch?v=' + item.id.videoId
                id = item.id.videoId
                dis.id = id
                dis.link = link
                let vid = await this.getVideo({
                  id: id
                })
                dis.tags = vid[0].tags
                dis.videoDuration = vid[0].videoDuration
                dis.statistics = vid[0].statistics
                break
            }

            index++;
            findings.push(dis)
            if (findings.length === result.items.length) return resolve(findings)

          })

        } catch (error) {
          reject(error)
        }
      }).catch(e => reject(e))
    })
  }


  //other functions
  getChannel (opts) {
    let allowedProperties = ["id", "username", "part", "categoryId", "hl", "maxResults", "key"]
    return new Promise(async (resolve, reject) => {
      if (!opts || (!opts.id && !opts.username))
      if (opts && typeof opts !== 'object') return reject('Options parameter must be an object')
      opts.key = this.key
      let params = {
        part: opts.part || 'snippet,contentDetails,statistics',
        maxResults: opts.maxResults || 30
      }

      Object.keys(opts).map(function(k) {
        if (allowedProperties.indexOf(k) > -1) params[k] = opts[k]
      })

      phin('https://www.googleapis.com/youtube/v3/channels?' + querystring.stringify(params)).then(res => {
        try {
          let body = res.body
          let result = JSON.parse(body)
          if (result.error) {
            let error = new Error(result.error.errors.shift().message)
            throw error
          }
          let items = result.items.map((item) => {
            let obj = {
              kind: item.kind,
              channelId: item.id,
              link: {
                default: 'https://www.youtube.com/channel/' + item.id,
              }
            }

            if (item.snippet) {
              obj.link.vanity = 'https://www.youtube.com/' + item.snippet.customUrl
              obj.publishedAt = item.snippet.publishedAt
              obj.channelTitle = item.snippet.title,
              obj.channelDescription = item.snippet.description,
              obj.country = item.snippet.country
            }
            if (item.contentDetails) {
              obj.relatedPlaylists = item.contentDetails.relatedPlaylists
            }

            if (item.statistics) {
              obj.statistics = item.statistics
            }
            return obj
          })
          resolve(items)

        } catch (error) {
          reject(error)
        }
      })
    })
  }

  getVideo (opts) {
    let allowedProperties = ["chart", "hl", "id", "locale", "maxHeight", "maxWidth", "maxResults", "regionCode", "videoCategoryId", "key"]
    return new Promise(async (resolve, reject) => {
      if (!opts || (!opts.id && !opts.username))
      if (opts && typeof opts !== 'object') return reject('Options parameter must be an object')
      opts.key = this.key
      let params = {
        part: opts.part || 'snippet,contentDetails,statistics',
        maxResults: opts.maxResults || 10
      }

      Object.keys(opts).map(function(k) {
        if (allowedProperties.indexOf(k) > -1) params[k] = opts[k]
      })

      phin('https://www.googleapis.com/youtube/v3/videos?' + querystring.stringify(params)).then(async (res) => {
        try {
          let body = res.body
          let result = JSON.parse(body)
          if (result.error) {
            let error = new Error(result.error.errors.shift().message)
            reject(error)
          }

          let items = result.items.map((item) => {
            let obj = {
              kind: item.kind,
              id: item.id,
              link: 'https://www.youtube.com/watch?v=' + item.id,
            }

            //which parts is wanted
            if (item.snippet) {
              obj.title = item.snippet.title
              obj.description = item.snippet.description
              obj.publishedAt = item.snippet.publishedAt
              obj.channel = {
                id: item.snippet.channelId,
                title: item.snippet.channelTitle
              }
              obj.thumbnails = item.snippet.thumbnails
              obj.tags = item.snippet.tags
              obj.categoryId = item.snippet.categoryId
              obj.defaultLanguage = item.snippet.defaultLanguage
            }

            if (item.contentDetails) {
              obj.videoDuration = converttime(item.contentDetails.duration)
              obj.dimension = item.contentDetails.dimension
              obj.definition = item.contentDetails.definition
              obj.regionRestriction = item.contentDetails.regionRestriction
            }

            if (item.statistics) {
              obj.statistics = item.statistics
            }

            return obj
          })
          resolve(items)
        } catch (error) {
          reject(error)
        }
      }).catch(e => reject(err))
    })
  }

  playlistItems (opts) {
    let allowedProperties = ["id", "playlistId", "videoId", "key"]
    return new Promise((resolve, reject) => {
      if (opts && typeof opts !== 'object') return reject('Options parameter must be an object')
      opts.key = this.key
      let params = {
        part: opts.part || 'snippet',
        maxResults: opts.maxResults || 10
      }

      Object.keys(opts).map(function(k) {
        if (allowedProperties.indexOf(k) > -1) params[k] = opts[k]
      })

      phin('https://www.googleapis.com/youtube/v3/playlistItems?' + querystring.stringify(params)).then(res => {
        try {
          let body = res.body
          let result = JSON.parse(body)
          if (result.error) {
            let error = new Error(result.error.errors.shift().message)
            reject(error)
          }
          let findings = []
          let items = result.items.map(async (item) => {
            let obj = {
              kind: item.kind,
            }

            if (item.snippet) {
              let vid = await this.getVideo({id: item.snippet.resourceId.videoId, part: "contentDetails"})
              obj.id = item.snippet.resourceId.videoId
              obj.link = 'https://www.youtube.com/watch?v=' + item.snippet.resourceId.videoId
              obj.title = item.snippet.title
              obj.description = item.snippet.description
              obj.thumbnails = item.snippet.thumbnails
              obj.channelTitle = item.snippet.channelTitle
              obj.channelId = item.snippet.channelId
              obj.publishedAt = item.snippet.publishedAt
              obj.videoDuration = vid[0].videoDuration
              obj.position = item.snippet.position
            }

            if (item.status) {
              obj.privacyStatus = item.status.privacyStatus
            }
            findings.push(obj)
            if (findings.length === result.items.length) return resolve(findings)
          })

        } catch (error) {
          reject(error)
        }
      })
    })
  }

  searchVideo(term, opts) {
    const opt = {'type': 'video', ...opts }
    return this.search(term, opt)
  }

  searchChannel(term, opts) {
    const opt = {'type': 'channel', ...opts }
    return this.search(term, opt)
  }

  searchPlaylist(term, opts) {
    const opt = {'type': 'playlist', ...opts }
    return this.search(term, opt)
  }

}

module.exports = youtubesearch

function converttime(time) {
  let reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  let hours = 0,
    minutes = 0,
    seconds = 0,
    totalseconds, totalmili;

  if (reptms.test(time)) {
    let matches = reptms.exec(time);
    if (matches[1]) hours = Number(matches[1]);
    if (matches[2]) minutes = Number(matches[2]);
    if (matches[3]) seconds = Number(matches[3]);
    totalseconds = hours * 3600 + minutes * 60 + seconds;
    totalmili = totalseconds * 1000
  }
  return totalmili
}
