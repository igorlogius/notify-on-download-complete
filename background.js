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
    interrupted: null
};

function getAudioURLs(key){
    return customAudioURLs[key];
}

function play(url){
    const player = new Audio(url);
    player.autoplay = false;
    player.preload = true;
    player.loop = false;
    player.play();
}

function onCreated(info) {
	console.log(`Download ${info.id} created.`);
	dl_store[info.id] = { "url": info.url, "file": info.filename };
}

async function onChanged(delta) {
	if(!delta.state) {return;}
	switch(delta.state.current){
		case 'interrupted':
		case 'complete':
			const info = dl_store[delta.id];
			const file = info.file;
			const filename = file.split('/').pop();
			const url = info.url;
			const title = `"${filename}" download ${delta.state.current}`;
			const msg = ""; //`Savepath: ${file}`; //Download URL: ${url}`;
			/**/
			const dlitem = dl_store[delta.id]
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
            const hide = await getFromStorage('hide',0);

            console.log('hide: ' , hide);

            if(hide > 0){
                setTimeout(() => {
                    console.log('hide2: ' , hide);
                    browser.notifications.clear(nID);
                },hide*1000);
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
    customAudioURLs.complete = await getFromStorage('complete',undefined);
    customAudioURLs.interrupted = await getFromStorage('interrupted',undefined);
}

browser.runtime.onStartup.addListener(handleStartup);

