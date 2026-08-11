(function() {
    'use strict';
    const FILTERS_URL = "https://raw.githubusercontent.com/codedroider/codeadblock/refs/heads/master/filters.txt";
    const currentHost = window.location.hostname;
    const cached = GM_getValue("selectors", null);

    if (cached && (Date.now() - GM_getValue("time", 0) < 6 * 60 * 60 * 1000)) {
        injectStyles(JSON.parse(cached));
    } else {
        GM_xmlhttpRequest({
            method: "GET", url: FILTERS_URL, onload: (res) => {
                const selectors = [];
                res.responseText.split('\n').forEach(line => {
                    if (line.includes('##') && !line.startsWith('@@') && !line.startsWith('|')) {
                        const parts = line.split('##');
                        const site = parts[0].trim();
                        let sel = parts[1].trim();
                        if (sel.startsWith('@')) sel = sel.substring(1);
                        if ((!site || currentHost.includes(site)) && sel.length > 1 && !sel.includes(':style')) {
                            selectors.push(sel);
                        }
                    }
                });
                GM_setValue("selectors", JSON.stringify(selectors));
                GM_setValue("time", Date.now());
                injectStyles(selectors);
            }
        });
    }

    function injectStyles(selectors) {
        if (!selectors.length) return;
        const style = document.createElement('style');
        style.textContent = `${selectors.join(', ')} { display: none !important; }`;
        document.documentElement.appendChild(style);
    }
})();
