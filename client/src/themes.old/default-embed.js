!(function (window) {

    console.log('embed')

    let debugMode = (document.location.hostname.indexOf('localhost') >= 0) ? true : false;
    const domainName = (debugMode) ? 'http://localhost:3000' : 'https://heygendemoapp1638.azurewebsites.net';




    const host = domainName,
        url =
            host +
            document.location.search,
        clientWidth = document.body.clientWidth,
        wrapDiv = document.createElement("div");


    wrapDiv.id = "heygen-streaming-embed";
    const container = document.createElement("div");
    container.id = "heygen-streaming-container";
    const stylesheet = document.createElement("style");
    stylesheet.innerHTML = `\n  #heygen-streaming-embed {\n    z-index: 9999;\n    position: fixed;\n    left: 40px;\n    bottom: 40px;\n    width: 200px;\n    height: 200px;\n    border-radius: 50%;\n    border: 2px solid #fff;\n    box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.12);\n    transition: all linear 0.1s;\n    overflow: hidden;\n\n    opacity: 0;\n    visibility: hidden;\n  }\n  #heygen-streaming-embed.show {\n    opacity: 1;\n    visibility: visible;\n  }\n  #heygen-streaming-embed.expand {\n    ${clientWidth < 540 ? "height: 266px; width: 96%; left: 50%; transform: translateX(-50%);" : "height: 366px; width: calc(366px * 16 / 9);"
        }\n    border: 0;\n    border-radius: 8px;\n  }\n  #heygen-streaming-container {\n    width: 100%;\n    height: 100%;\n  }\n  #heygen-streaming-container iframe {\n    width: 100%;\n    height: 100%;\n    border: 0;\n  }\n  `;
    const iframe = document.createElement("iframe");
    (iframe.allowFullscreen = 1), (iframe.title = "Streaming Embed"), (iframe.role = "dialog"), (iframe.src = url);
    let visible = !1,
        initial = !1;

    //console.log('embed js');
    window.addEventListener("message", (e) => {
        //console.log(e.origin);
        //console.log(host);
        e.origin === host &&
            e.data &&
            e.data.type &&
            "streaming-embed" === e.data.type &&
            ("init" === e.data.action
                ? ((initial = !0), wrapDiv.classList.toggle("show", initial))
                : "show" === e.data.action
                    ? ((visible = !0), wrapDiv.classList.toggle("expand", visible))
                    : "hide" === e.data.action && ((visible = !1), wrapDiv.classList.toggle("expand", visible)));

        //fullscreen message
        if (e.origin === host &&
            e.data &&
            e.data.type &&
            "streaming-embed" === e.data.type &&
            ("start-fullscreen" === e.data.action)) {
            openFullscreen(document.getElementById('heygen-streaming-embed'));
        }

        if (e.origin === host &&
            e.data &&
            e.data.type &&
            "streaming-embed" === e.data.type &&
            ("end-fullscreen" === e.data.action)) {
            closeFullscreen(document.getElementById('heygen-streaming-embed'));
        }


    }),
        container.appendChild(iframe),
        wrapDiv.appendChild(stylesheet),
        wrapDiv.appendChild(container),
        document.body.appendChild(wrapDiv);

    //fullscreen functions
    function openFullscreen(elm) {

        if (elm.requestFullscreen) {
            elm.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elm.mozRequestFullScreen();
        } else if (elem.webkitRequestFullScreen) {
            elm.webkitRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elm.msRequestFullscreen();
        }

    }

    function closeFullscreen(elm) {

        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
})(globalThis);