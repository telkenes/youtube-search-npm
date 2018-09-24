let querystring = require('querystring')
let xhr = require('xhr')

if (!xhr.open) xhr = require('request')

class youtubesearch {
    constructor (key) {
        if (typeof key !== 'string') throw new Error('The YouTube API key you provided was not a string.');

        this.key = key;
    }
         channel(opts) {
            //channel properties
            var allowed= ['id', 'forUsername', 'username', 'categoryId', 'key']
            return new Promise((resolve, reject) => {
              if (typeof opts === 'function') {
                opts = {}
              }
              opts.key = this.key
              opts.forUsername = opts.username || options.forUsername || ''
              let params = {
                //q: term,
                part: opts.part || 'snippet,contentDetails,statistics',
                maxResults: opts.maxResults || 10
              }
          
              Object.keys(opts).map(function (k) {
                if (allowed.indexOf(k) > -1) {
                    params[k] = opts[k]
                }
            
              })
          
              xhr({
                url: 'https://www.googleapis.com/youtube/v3/channels?' + querystring.stringify(params),
                method: 'GET'
              }, function (err, res, body) {
                if (err) throw err
          
                try {
                  let result = JSON.parse(body)
                  if (result.error) {
                    let error = new Error(result.error.errors.shift().message)
                    throw error
                  }
          
          
                  let findings = result.items.map(function (item) {
                    return {
                      kind: item.kind,
                      channelId: item.id,
                      link: {default: 'https://www.youtube.com/channel/' + item.id, custom: 'https://www.youtube.com/channel/' + item.snippet.customUrl},
                      publishedAt: item.snippet.publishedAt,
                      channelTitle: item.snippet.title,
                      channelDescription: item.snippet.description,
                      country: item.snippet.country,
                      statistics: item.statistics,
                      contentDetails: item.contentDetails
                    }
                  })
          
                  resolve(findings)
                } catch (error) {
                  reject(error)
                }
              })
            })
    }

    playlist(opts) {
        //playlist properties
        var allowedprop = ['id', 'channelId', 'key']
        return new Promise(async (resolve, reject) => {
          if (typeof opts === 'function') {
            opts = {}
          }
          opts.key = this.key
          let params = {
            part: opts.part || 'snippet,contentDetails',
            maxResults: opts.maxResults || 10
          }
      
          Object.keys(opts).map(function (k) {
            if (allowedprop.indexOf(k) > -1) {
                params[k] = opts[k]
            }
        
          })
          var key = this.key

          xhr({
            url: 'https://www.googleapis.com/youtube/v3/playlists?' + querystring.stringify(params),
            method: 'GET'
          }, async (err, res, body) => {
            if (err) throw err
      
            try {
              let result = JSON.parse(body)
              if (result.error) {
                let error = new Error(result.error.errors.shift().message)
                throw error
              }
              let findings = [];
              var index = 0;
              result.items.forEach(async (item) => {
                getVids(key, {playlistId: item.id}).then(vids => {
                  index++;
                findings.push({
                  kind: item.kind,
                  id: item.id,
                  link: 'https://www.youtube.com/playlist?list=' + item.id,
                  title: item.snippet.title,
                  description: item.snippet.description,
                  thumbnails: item.snippet.thumbnails,
                  channelTitle: item.snippet.channelTitle,
                  channelId: item.snippet.channelId,
                  publishedAt: item.snippet.publishedAt,
                  itemCount: item.contentDetails.itemCount,
                  items: vids
                })
                if (index === result.items.length) return resolve(findings)
              })
              })
      
            } catch (error) {
              reject(error)
            }
          })
        })
    }

     search(term, opts) {
      let allowedProperties = [
        'fields',
        'channelId',
        'channelType',
        'eventType',
        'forContentOwner',
        'forDeveloper',
        'forMine',
        'location',
        'locationRadius',
        'onBehalfOfContentOwner',
        'order',
        'pageToken',
        'publishedAfter',
        'publishedBefore',
        'regionCode',
        'relatedToVideoId',
        'relevanceLanguage',
        'safeSearch',
        'topicId',
        'type',
        'videoCaption',
        'videoCategoryId',
        'videoDefinition',
        'videoDimension',
        'videoDuration',
        'videoEmbeddable',
        'videoLicense',
        'videoSyndicated',
        'videoType',
        'key'
      ]
        return new Promise((resolve, reject) => {
          if (typeof opts === 'function') {
            opts = {}
          }
          if (!opts) opts = {}
          opts.key = this.key
          let params = {
            q: term,
            part: opts.part || 'snippet',
            maxResults: opts && opts.maxResults || 10
          }
      
          Object.keys(opts).map(function (k) {
            if (allowedProperties.indexOf(k) > -1) params[k] = opts[k]
          })
          var key = this.key
          xhr({
            url: 'https://www.googleapis.com/youtube/v3/search?' + querystring.stringify(params),
            method: 'GET'
          }, function (err, res, body) {
            if (err) throw err
      
            try {
              let result = JSON.parse(body)
      
              if (result.error) {
                let error = new Error(result.error.errors.shift().message)
                throw error
              }
      
              let pageInfo = {
                totalResults: result.pageInfo.totalResults,
                resultsPerPage: result.pageInfo.resultsPerPage,
                nextPageToken: result.nextPageToken,
                prevPageToken: result.prevPageToken
              }
      
              var findings = [];
              var index = 0;
              result.items.forEach(async (item) => {
                let link = ''
                let id = ''
                switch (item.id.kind) {
                  case 'youtube#channel':
                    link = 'https://www.youtube.com/channel/' + item.id.channelId
                    id = item.id.channelId
                    break
                  case 'youtube#playlist':
                    link = 'https://www.youtube.com/playlist?list=' + item.id.playlistId
                    id = item.id.playlistId
                    break
                  default:
                    link = 'https://www.youtube.com/watch?v=' + item.id.videoId
                    id = item.id.videoId
                    break
                }
                getVid(key, {id: id}).then(vid => {
                
                index++;
                findings.push({
                  id: id,
                  link: link,
                  kind: item.id.kind,
                  publishedAt: item.snippet.publishedAt,
                  channelId: item.snippet.channelId,
                  channelTitle: item.snippet.channelTitle,
                  title: item.snippet.title,
                  description: item.snippet.description,
                  thumbnails: item.snippet.thumbnails,
                  tags: (item.id.kind === 'youtube#video' && vid[0].tags) || null,
                  videoDuration: (item.id.kind === 'youtube#video' && vid[0].videoDuration) || null,
                  statistics: (item.id.kind === 'youtube#video' && vid[0].statistics) || null
                })
                if (findings.length === result.items.length) return resolve(findings)
              })
              })

            } catch (error) {
              reject(error)
            }
          })
        })
      }
      playlistVids(opts) {
        return new Promise((resolve, reject) => {
            if (typeof opts === 'function') {
              opts = {}
            }
            opts.key = this.key
            let params = {
              part: opts.part || 'snippet',
              maxResults: opts.maxResults || 30
            }
        
            Object.keys(opts).map(function (k) {
                  params[k] = opts[k]
          
            })
            
            xhr({
              url: 'https://www.googleapis.com/youtube/v3/playlistItems?' + querystring.stringify(params),
              method: 'GET'
            }, function (err, res, body) {
              if (err) throw err
        
              try {
                let result = JSON.parse(body)
                if (result.error) {
                  let error = new Error(result.error.errors.shift().message)
                  throw error
                }
                let findings = result.items.map((item) => {
                    return {
                      kind: item.kind,
                      id: item.snippet.resourceId.videoId,
                      link: 'https://www.youtube.com/watch?v=' + item.snippet.resourceId.videoId,
                      title: item.snippet.title,
                      description: item.snippet.description,
                      thumbnails: item.snippet.thumbnails,
                      channelTitle: item.snippet.channelTitle,
                      channelId: item.snippet.channelId,
                      publishedAt: item.snippet.publishedAt,
                      position: item.snippet.position,

                                    }
                  })
                
                resolve(findings)
              } catch (error) {
                reject(error)
              }
            })
          })
    }

}
module.exports = youtubesearch

function getVid(key, opts) {
        return new Promise((resolve, reject) => {
            if (typeof opts === 'function') {
              opts = {}
            }
            opts.key = key
            let params = {
              part: opts.part || 'snippet,contentDetails,statistics',
              maxResults: opts.maxResults || 30
            }
        
            Object.keys(opts).map(function (k) {
                  params[k] = opts[k]
          
            })
        
            xhr({
              url: 'https://www.googleapis.com/youtube/v3/videos?' + querystring.stringify(params),
              method: 'GET'
            }, function (err, res, body) {
              if (err) throw err
        
              try {
                let result = JSON.parse(body)
                if (result.error) {
                  let error = new Error(result.error.errors.shift().message)
                  throw error
                }
                var items = result.items.map((item) => {
                  return {
                      kind: item.kind,
                      id: item.id,
                      link: 'https://www.youtube.com/watch?v=' + item.id,
                      tags: item.snippet.tags,
                      videoDuration: item.contentDetails.duration,
                      statistics: item.statistics
                                    }
                  })
                  resolve(items)
              } catch (error) {
                reject(error)
              }
            })
          })

}



function getVids(key, opts) {
  return new Promise((resolve, reject) => {
    if (typeof opts === 'function') {
      opts = {}
    }
    opts.key = key
    let params = {
      part: opts.part || 'snippet',
      maxResults: opts.maxResults || 30
    }

    Object.keys(opts).map(function (k) {
          params[k] = opts[k]
  
    })

    xhr({
      url: 'https://www.googleapis.com/youtube/v3/playlistItems?' + querystring.stringify(params),
      method: 'GET'
    }, function (err, res, body) {
      if (err) throw err

      try {
        let result = JSON.parse(body)
        if (result.error) {
          let error = new Error(result.error.errors.shift().message)
          throw error
        }
        var items = result.items.map((item) => {
          return {
              kind: item.kind,
              id: item.snippet.resourceId.videoId,
              link: 'https://www.youtube.com/watch?v=' + item.snippet.resourceId.videoId,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnails: item.snippet.thumbnails,
              channelTitle: item.snippet.channelTitle,
              channelId: item.snippet.channelId,
              publishedAt: item.snippet.publishedAt,
              position: item.snippet.position,
                            }
          })
          resolve(items)
        
      } catch (error) {
        reject(error)
      }
    })
  })
}
