let querystring=require('querystring')
let phin=require('phin')
let xhr=require('xhr')
if(!xhr.open)xhr=require('request')
class youtubesearch{constructor(key){if(typeof key!=='string')throw new Error('The YouTube API key you provided was not a string.');this.key=key}
search(term,opts){let allowedProperties=['fields','channelId','channelType','eventType','forContentOwner','forDeveloper','forMine','location','locationRadius','onBehalfOfContentOwner','order','pageToken','publishedAfter','publishedBefore','regionCode','relatedToVideoId','relevanceLanguage','safeSearch','topicId','type','videoCaption','videoCategoryId','videoDefinition','videoDimension','videoDuration','videoEmbeddable','videoLicense','videoSyndicated','videoType','key']
return new Promise(async(resolve,reject)=>{if(!term||term===''||typeof term!=='string')return reject('The term you provided was not valid')
if(!opts)opts={}
opts.key=this.key
let params={q:term,part:opts.part||'snippet',maxResults:opts&&opts.maxResults||10}
Object.keys(opts).map(function(k){if(allowedProperties.indexOf(k)>-1)params[k]=opts[k]})
var key=this.key
phin('https://www.googleapis.com/youtube/v3/search?'+querystring.stringify(params)).then(res=>{let body=res.body
try{let result=JSON.parse(body)
if(result.error){let error=new Error(result.error.errors.shift().message)
throw error}
let pageInfo={totalResults:result.pageInfo.totalResults,resultsPerPage:result.pageInfo.resultsPerPage,nextPageToken:result.nextPageToken,prevPageToken:result.prevPageToken}
var findings=[];var index=0;result.items.forEach(async(item)=>{let dis={kind:item.id.kind,publishedAt:item.snippet.publishedAt,channelId:item.snippet.channelId,channelTitle:item.snippet.channelTitle,title:item.snippet.title,description:item.snippet.description,thumbnails:item.snippet.thumbnails,}
let link=''
let id=''
switch(item.id.kind){case 'youtube#channel':link='https://www.youtube.com/channel/'+item.id.channelId
id=item.id.channelId
let channel=await getChannel(key,{id:id})
dis.id=id
dis.link=channel[0].link
dis.country=channel[0].country
dis.statistics=channel[0].statistics
dis.contentDetails=channel[0].contentDetails
break
case 'youtube#playlist':link='https://www.youtube.com/playlist?list='+item.id.playlistId
id=item.id.playlistId
dis.id=id
dis.link=link
let playlist=await getVids(key,{playlistId:id})
dis.items=playlist
dis.itemCount=playlist.length
break
default:link='https://www.youtube.com/watch?v='+item.id.videoId
id=item.id.videoId
dis.id=id
dis.link=link
let vid=await getVid(key,{id:id})
dis.tags=vid[0].tags
dis.videoDuration=converttime(vid[0].videoDuration)
dis.statistics=vid[0].statistics
break}
index++;findings.push(dis)
if(findings.length===result.items.length)return resolve(findings)})}catch(error){reject(error)}}).catch(e=>reject(e))})}}
module.exports=youtubesearch
function getVid(key,opts){return new Promise(async(resolve,reject)=>{opts.key=key
let params={part:opts.part||'snippet,contentDetails,statistics',maxResults:opts.maxResults||30}
Object.keys(opts).map(function(k){params[k]=opts[k]})
phin('https://www.googleapis.com/youtube/v3/videos?'+querystring.stringify(params)).then(async(res)=>{try{let body=res.body
let result=JSON.parse(body)
if(result.error){let error=new Error(result.error.errors.shift().message)
throw error}
var items=result.items.map((item)=>{return{kind:item.kind,id:item.id,link:'https://www.youtube.com/watch?v='+item.id,tags:item.snippet.tags,videoDuration:item.contentDetails.duration,statistics:item.statistics}})
resolve(items)}catch(error){reject(error)}}).catch(e=>reject(err))})}
function getVids(key,opts){return new Promise((resolve,reject)=>{if(typeof opts==='function'){opts={}}
opts.key=key
let params={part:opts.part||'snippet',maxResults:opts.maxResults||30}
Object.keys(opts).map(function(k){params[k]=opts[k]})
phin('https://www.googleapis.com/youtube/v3/playlistItems?'+querystring.stringify(params)).then(res=>{try{let body=res.body
let result=JSON.parse(body)
if(result.error){let error=new Error(result.error.errors.shift().message)
throw error}
var items=result.items.map((item)=>{return{kind:item.kind,id:item.snippet.resourceId.videoId,link:'https://www.youtube.com/watch?v='+item.snippet.resourceId.videoId,title:item.snippet.title,description:item.snippet.description,thumbnails:item.snippet.thumbnails,channelTitle:item.snippet.channelTitle,channelId:item.snippet.channelId,publishedAt:item.snippet.publishedAt,position:item.snippet.position,}})
resolve(items)}catch(error){reject(error)}})})}
function getChannel(key,opts){return new Promise((resolve,reject)=>{if(typeof opts==='function'){opts={}}
opts.key=key
let params={part:opts.part||'snippet,contentDetails,statistics',maxResults:opts.maxResults||30}
Object.keys(opts).map(function(k){params[k]=opts[k]})
phin('https://www.googleapis.com/youtube/v3/channels?'+querystring.stringify(params)).then(res=>{try{let body=res.body
let result=JSON.parse(body)
if(result.error){let error=new Error(result.error.errors.shift().message)
throw error}
var items=result.items.map((item)=>{return{kind:item.kind,channelId:item.id,link:{default:'https://www.youtube.com/channel/'+item.id,custom:'https://www.youtube.com/'+item.snippet.customUrl},publishedAt:item.snippet.publishedAt,channelTitle:item.snippet.title,channelDescription:item.snippet.description,country:item.snippet.country,statistics:item.statistics,contentDetails:item.contentDetails}})
resolve(items)}catch(error){reject(error)}})})}
function converttime(time){var reptms=/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;var hours=0,minutes=0,seconds=0,totalseconds,totalmili;if(reptms.test(time)){var matches=reptms.exec(time);if(matches[1])hours=Number(matches[1]);if(matches[2])minutes=Number(matches[2]);if(matches[3])seconds=Number(matches[3]);totalseconds=hours*3600+minutes*60+seconds;totalmili=totalseconds*1000}
return totalmili}
