const baseUrl = 'http://localhost:3000';
// 监听content-script发送的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    console.log('收到来自content-script的消息：');
    console.log(request, sender, sendResponse);
    sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
    if (request.type == 'get-content') {
        const data = request.data;
        fetch(`${baseUrl}/api/generate-embeddings`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                textContent: data.content,
                title: data.title,
                url: data.url,
            })
        }).then(res => res.json())
            .then(summer => {
                console.log(summer);
                if (summer.success) {
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, { type: 'get-summer', summer: summer.summer });
                    });
                }
            return { success: true, summer };
        }).catch((error) => {
            return { success: false, summer: error?.message };
        });
    }
});