
async function GPTApi(abortController,payload, callback) {
    const decoder = new TextDecoder();
    let counter = 0;

    try {

        let urls = [globalThis.settings.gptApiUrl|| "https://api.tmrace.net/v1/chat/completions","https://api.openai.com/v1/chat/completions"];
        if(globalThis.dev) urls.unshift("http://localhost:3000/v1/chat/completions");
        for (const url of urls) {
            let headers = {"Content-Type": "application/json"};
            if (globalThis.settings?.gptApiKey)
                headers.Authorization = `Bearer ` + globalThis.settings.gptApiKey;
            else 
                headers.Authorization = `Bearer ReplyPal`;
            try {
                var response = await fetch(url, {
                    headers: headers,
                    signal: abortController.signal,
                    method: "POST",
                    body: JSON.stringify({
                        messages: payload,
                        stream: true,
                        model: globalThis.settings.gptModel || "gpt-3.5-turbo",
                    }),
                });
            }catch (e) {
                console.error(e);
            }
            if (response?.ok) {
                break;
            }
        }
        if(!response?.ok)
            throw new Error(response? await response.text():"failed to fetch");


        const reader = response.body.getReader();
        const parser = {
            buffer: "",
            textCombined: "",
            write(data) {
                if(abortController.signal.aborted) return;
                this.buffer += data;
                const parts = this.buffer.split("\n");
                this.buffer = parts.pop();
                for (const part of parts) {
                    if (part.startsWith("data: ")) {
                        if (part.substring(6) === "[DONE]") {
                            console.log(this.textCombined);
                            callback(this.textCombined,true);
                        } else {
                            try {
                                const json = JSON.parse(part.substring(6));
                                const text = json.choices[0].delta?.content || "";

                               // console.log(`Progress: ${counter} - Enqueueing: ${ this.textCombined }`);
                                this.textCombined += text;
                                callback(this.textCombined);

                                counter++;
                            } catch (e) {
                                console.error(e);
                                callback(this.textCombined,false,true);
                            }
                        }
                    }
                }
            },
        };

        const read = async () => {
            try {
                const { done, value } = await reader.read();
                if (done) {
                    //parser.write("data: [DONE]\n\n");
                    return;
                }
                parser.write(decoder.decode(value));
                read();
            } catch (e) {
                console.error(e);
            }
        };

        await read();
    } catch (e) {
        callback("Please Login, copy Api Key to settings from https://platform.openai.com/account/api-keys\n"+e?.message);
        onComplete?.(e);
        reject?.(e);
    }
}
