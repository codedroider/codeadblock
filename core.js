(function() {
    'use strict';
    const FILTERS_URL = "https://raw.githubusercontent.com/codedroider/codeadblock/refs/heads/master/filters.txt";
    const cached = GM_getValue("selectors", null);

    if (cached && (Date.now() - GM_getValue("time", 0) < 6 * 60 * 60 * 1000)) {
        startFilter(JSON.parse(cached));
    } else {
        GM_xmlhttpRequest({
            method: "GET", url: FILTERS_URL, onload: (res) => {
                const selectors = [];
                res.responseText.split('\n').forEach(line => {
                    if (line.includes('##') && !line.startsWith('@@') && !line.startsWith('|')) {
                        let sel = line.split('##')[1].trim();
                        if (sel.startsWith('@')) sel = sel.substring(1);
                        if (sel.length > 1) selectors.push(sel);
                    }
                });
                GM_setValue("selectors", JSON.stringify(selectors));
                GM_setValue("time", Date.now());
                startFilter(selectors);
            }
        });
    }

    function startFilter(selectors) {
        if (!selectors.length) return;
        const run = () => selectors.forEach(s => { try { document.querySelectorAll(s).forEach(e => e.remove()); } catch(e) {} });
        run();
        new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true });
    }
})();
