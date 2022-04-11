
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


['complete', 'interrupted'].forEach( async (key) => {

    let audio_element = document.getElementById('audio_'+key);//
    let clear_element = document.getElementById('clear_'+key);//
    let input_element = document.getElementById(key)

    clear_element.addEventListener('click', function(evt){

        input_element.value = '';

        //console.log(input_element.id);

                switch(input_element.id){
                    case 'complete':
                        browser.storage.local.set({ 'complete': undefined });
                        audio_element.src = '';
                        break;
                    case 'interrupted':
                        browser.storage.local.set({ 'interrupted': undefined });
                        audio_element.src = '';
                        break;
                    default:
                        break;
                }
    });


    input_element.addEventListener('input', function (evt) {


        var file  = this.files[0];
        //console.log(file.name);

        var reader = new FileReader();
        reader.onload = async function(e) {
            try {
                //console.log(key, reader.result);
                //var config = JSON.parse(reader.result);
                //console.log("impbtn", config);

                audio_element.src = reader.result;

                switch(key){
                    case 'complete':
                        await browser.storage.local.set({ 'complete': reader.result });
                        break;
                    case 'interrupted':
                        await browser.storage.local.set({ 'interrupted': reader.result });
                        break;
                    default:
                        break;
                }
                //document.querySelector("form").submit();
            } catch (e) {
                console.error('error loading file: ' + e);
            }
        };
        //reader.readAsText(file);
        reader.readAsDataURL(file);
    });

    /*
    audio_element.onvolumechange = async (event) => {

                    console.log('onvolumechange');

                        await browser.storage.local.set({ 'complete': {
                            src: audio_element.src,
                            volume: audio_element.volume
                        }});

                        await browser.storage.local.set({ 'interrupted': {
                            src: audio_element.src,
                            volume: audio_element.volume
                        }});
    };
    */

    audio_element.src = await getFromStorage(key);
    //audio_element.volume = tmp.volume;
});


/*document.addEventListener('DOMContentLoaded', async function(){
});*/
