let dl_store = {} // id => {url:"",file:"" }

//var buttons = [ { "title": "Open" } ]; // <= not availabe in ff yet

function onCreated(info) {
	console.log(`Download ${info.id} created.`);
	dl_store[info.id] = { "url": info.url, "file": info.filename };
}

function onChanged(delta) {
	if(!delta.state) {return;}
	switch(delta.state.current){
		case 'complete':
		case 'interrupted':
			const info = dl_store[delta.id];
			const file = info.file;
			const filename = file.split('/').pop();
			const url = info.url;
			const title = `"${filename}" download ${delta.state.current}`;
			const msg = ""; //`Savepath: ${file}`; //Download URL: ${url}`;
			/**/
			const dlitem = dl_store[delta.id]
			browser.notifications.create(""+delta.id, // <= "download id" is "notification id"
			{
				"type": "basic",
				"iconUrl": "icons.png",
				"title": title,
				"message": msg,
				//"buttons": buttons, // <= not availabe in firefox yet
			});
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

browser.downloads.onCreated.addListener(onCreated);
browser.downloads.onChanged.addListener(onChanged);
//browser.notifications.onButtonClicked.addListener(onButtonClicked);

