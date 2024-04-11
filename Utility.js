/*
function djb2Hash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return hash;
}

function getShortHashCode(str) {
    const hash = djb2Hash(str).toString();
    return hash.substring(hash.length - 2);
}
*/


function generateAudio(text) {
    let audioPlayer = document.getElementById("audio-player");
    if(audioPlayer===null){
        audioPlayer= document.createElement("audio")
        audioPlayer.id="audio-player"
        document.body.appendChild(audioPlayer)
    }
    if (!audioPlayer.paused) {
        return;
    }
    const apiUrl = "https://audio.api.speechify.dev/generateAudioFiles";
    const headers = {
        "accept": "*/*",
        "accept-base64": "true",
        "accept-language": "en,fi;q=0.9,ru;q=0.8,en-US;q=0.7",
        "content-type": "application/json; charset=UTF-8",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "x-speechify-client": "API"
    };
    const referrer = "https://onboarding.speechify.com/";
    const referrerPolicy = "strict-origin-when-cross-origin";
    const audioFormat = "ogg";
    const paragraphChunks = [text];
    const voiceParams = {
        "name": "Snoop",
        "engine": "resemble",
        "languageCode": "en"
    };
    const requestBody = JSON.stringify({ audioFormat, paragraphChunks, voiceParams });

    fetch(apiUrl, { method: "POST", headers, referrer, referrerPolicy, body: requestBody, mode: "cors", credentials: "omit" })
        .then(response => response.json())
        .then(data => {
            audioPlayer.src = "data:audio/" + data.format + ";base64," + data.audioStream;
            audioPlayer.play();
        })
        .catch(error => console.error(error));
}

globalThis.TranslateMeGoogle = async (sourceText) => {

    let targetLang = navigator.language;

    if (!sourceText) {
        return sourceText;
    }
    if (targetLang.startsWith("en")) {
        return sourceText;
    }

    let trKey = "tr"+sourceText;
    let cached = await new Promise(a=>chrome.storage.local.get("tr"+sourceText, (data) => {
        a(data[trKey]);
    }));

    if(cached) return cached;

    targetLang = targetLang ?? "en";



    var url =
        "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
        "en" +
        "&tl=" +
        targetLang +
        "&dt=t&q=" +
        encodeURI(sourceText);

    try {
        var response = await fetch(url);
        var json = await response.json();
        // Modified code to join the translations
        var translated = "";
        for (var i = 0; i < json[0].length; i++)
            translated += json[0][i][0];
        console.log(translated);
        chrome.storage.local.set( {[trKey]: translated})
        return translated;
        //translatedText = translatedText.split(":::")[1];

    } catch (e) {
        console.log("translate error " + sourceText + " " + e);
        return sourceText;
    }
};

