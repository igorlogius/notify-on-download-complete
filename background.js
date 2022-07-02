/* global browser */

let dl_store = new Map(); // id => {url:"",file:"" }

async function getFromStorage(storeid,fallback) {
	return (await (async () => {
		try {
			let tmp = await browser.storage.local.get(storeid);
			if (typeof tmp[storeid] !== 'undefined'){
				return tmp[storeid];

			}
		}catch(e){
			console.error(e);
		}
		return fallback;
	})());
}

let storageDataCache = {
    complete: null,
    interrupted: null,
    hide: 0,
    enable_start: false,
    enable_complete: true,
    enable_interrupted: true
};

function getAudioURLs(key){
    return storageDataCache[key];
}

function play(url){
    return new Promise( (resolve/*, reject*/) => {
    const player = new Audio(url);
        player.autoplay = false;
        player.preload = true;
        player.loop = false;
        player.ended = () => { resolve() };
        player.error = () => { resolve() };
        player.play();
    });
}

async function onDownloadCreated(info) {
    if(info.url && info.filename) {
        dl_store.set(info.id, { "url": info.url, "file": info.filename });
        if(storageDataCache.enable_start) {
            const file = info.filename;
            const filename = file.split('/').pop().replace(/.{20}/g,'$&\r\n')
                const nID = await browser.notifications.create(""+info.id, // <= "download id" is "notification id"
                        {
                        "type": "basic"
                        ,"iconUrl": browser.runtime.getURL("icon.png")
                        ,"title": "Download Started"
                        ,"message": filename
                        });
            if(storageDataCache.hide > 0){
                setTimeout(() => {
                    browser.notifications.clear(nID);
                },storageDataCache.hide*1000);
            }
            const audioURL = getAudioURLs('start');
            if(audioURL) {
                await play(audioURL);
            }
        }
    }
}

async function onDownloadChanged(delta) {
	if(!delta.state) {return;}
    if( (delta.state.current === 'complete' && storageDataCache.enable_complete)
        || (delta.state.current === 'interrupted' && storageDataCache.enable_interrupted)
      ){
        if(dl_store.has(delta.id)) {
            const info = dl_store.get(delta.id);
            const file = info.file;
            const filename = file.split('/').pop().replace(/.{20}/g,'$&\r\n')
                const nID = await browser.notifications.create(""+delta.id,
                        {
                        "type": "basic"
                        ,"iconUrl": browser.runtime.getURL("icon.png")
                        ,"title": "Download " + delta.state.current
                        ,"message": filename
                        });
            if(storageDataCache.hide > 0){
                setTimeout(() => {
                    browser.notifications.clear(nID);
                },storageDataCache.hide*1000);
            }
            const audioURL = getAudioURLs(delta.state.current)
            if(audioURL) {
                await play(audioURL);
            }
        }
    }
    if( (delta.state.current === 'complete' )
        || (delta.state.current === 'interrupted' )
    ){
        if(dl_store.has(delta.id)) {
            dl_store.delete(delta.id);
        }
    }
}

function onStorageChange(changes /*, area*/) {
  Object.keys(changes).forEach( (item) => {
    storageDataCache[item] = changes[item].newValue;
  });
}

async function onRuntimeStartup() {
    storageDataCache.start = await getFromStorage('start',undefined);
    storageDataCache.complete = await getFromStorage('complete',undefined);
    storageDataCache.interrupted = await getFromStorage('interrupted',undefined);
    storageDataCache.hide = await getFromStorage('hide',0);
    storageDataCache.enable_start= await getFromStorage('enable_start',false);
    storageDataCache.enable_complete= await getFromStorage('enable_complete',true);
    storageDataCache.enable_interrupted= await getFromStorage('enable_interrupted',true);
}

browser.runtime.onStartup.addListener(onRuntimeStartup);
browser.storage.onChanged.addListener(onStorageChange);
browser.downloads.onCreated.addListener(onDownloadCreated);
browser.downloads.onChanged.addListener(onDownloadChanged);

