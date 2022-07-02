/* global browser */

let dl_store = {} // id => {url:"",file:"" }

//var buttons = [ { "title": "Open" } ]; // <= not availabe in ff yet
//

async function getFromStorage(storeid,fallback) {
	return (await (async () => {
		try {
			//console.log('storeid', storeid)
			let tmp = await browser.storage.local.get(storeid);
			//console.log(tmp);
			if (typeof tmp[storeid] !== 'undefined'){
				return tmp[storeid];

			}
		}catch(e){
			console.error(e);
		}
		return fallback;
	})());
}

let customAudioURLs = {
    complete: null,
    interrupted: null,
    hide: 0,
    enable_start: false,
    enable_complete: true,
    enable_interrupted: true
};

function getAudioURLs(key){
    return customAudioURLs[key];
}

function play(url){
    return new Promise( (resolve, reject) => {
    const player = new Audio(url);
    player.autoplay = false;
    player.preload = true;
    player.loop = false;
    player.ended = () => { resolve() };
    player.error = () => { resolve() };
    player.play();
    });
}

async function onCreated(info) {
	console.log(`Download ${info.id} created.`);
	dl_store[info.id] = { "url": info.url, "file": info.filename };

    if(customAudioURLs.enable_start) {
        const file = info.filename;
        const filename = file.split('/').pop().replace(/.{20}/g,'$&\n')
            //const url = info.url;
            const title = `"${filename}" download started`;
        const msg = ""; //`Savepath: ${file}`; //Download URL: ${url}`;
        /**/
        //const dlitem = info;
        const nID = await browser.notifications.create(""+info.id, // <= "download id" is "notification id"
                {
                "type": "basic"
                ,"iconUrl": browser.runtime.getURL("icon.png")
                ,"title": title
                ,"message": msg
                //,"buttons": buttons, // <= not availabe in firefox yet
                });
        const audioURL = getAudioURLs('start')
            if(audioURL) {
                await play(audioURL);
            }


        if(customAudioURLs.hide > 0){
            setTimeout(() => {
                    browser.notifications.clear(nID);
                    },customAudioURLs.hide*1000);
        }
        /**/
    }
}

async function onChanged(delta) {
	if(!delta.state) {return;}

	switch(delta.state.current){
		case 'interrupted':
            if(!customAudioURLs.enable_interrupted) { return; }
		case 'complete':
            if(!customAudioURLs.enable_complete) { return; }
			const info = dl_store[delta.id];
			const file = info.file;
            const filename = file.split('/').pop().replace(/.{20}/g,'$&\n')
			//const url = info.url;
			const title = `"${filename}" download ${delta.state.current}`;
			const msg = ""; //`Savepath: ${file}`; //Download URL: ${url}`;
			/**/
			//const dlitem = dl_store[delta.id]
			const nID = await browser.notifications.create(""+delta.id, // <= "download id" is "notification id"
			{
                "type": "basic"
				,"iconUrl": browser.runtime.getURL("icon.png")
				,"title": title
				,"message": msg
				//,"buttons": buttons, // <= not availabe in firefox yet
			});
            const audioURL = getAudioURLs(delta.state.current)
            if(audioURL) {
                play(audioURL);
            }

            if(customAudioURLs.hide > 0){
                setTimeout(() => {
                    browser.notifications.clear(nID);
                },customAudioURLs.hide*1000);
            }
			/**/
			delete dl_store[delta.id];
			break;
		default:
			break;
	}
}

/*  <= not availabe in ff yet
function onButtonClicked(id,index) {
	if( buttons[index].title !== buttons[0].title) { return; }
	browser.downloads.open(id); // <= download id
}
*/

function logStorageChange(changes, area) {
  console.log("Change in storage area: " + area);

  let changedItems = Object.keys(changes);

  for (let item of changedItems) {
    console.log(item + " has changed:");
    console.log("Old value: ");
    console.log(changes[item].oldValue);
    console.log("New value: ");
    console.log(changes[item].newValue);

    customAudioURLs[item] = changes[item].newValue; //await browser.storage.local.get(item);

    console.log(item, customAudioURLs[item]);
  }
}

browser.storage.onChanged.addListener(logStorageChange);
browser.downloads.onCreated.addListener(onCreated);
browser.downloads.onChanged.addListener(onChanged);
//browser.notifications.onButtonClicked.addListener(onButtonClicked);



async function handleStartup() {
    customAudioURLs.start = await getFromStorage('start',undefined);
    customAudioURLs.complete = await getFromStorage('complete',undefined);
    customAudioURLs.interrupted = await getFromStorage('interrupted',undefined);
    customAudioURLs.hide = await getFromStorage('hide',0);
    customAudioURLs.enable_start= await getFromStorage('enable_start',false);
    customAudioURLs.enable_complete= await getFromStorage('enable_complete',true);
    customAudioURLs.enable_interrupted= await getFromStorage('enable_interrupted',true);
}

browser.runtime.onStartup.addListener(handleStartup);

