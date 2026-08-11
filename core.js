(function() {
    'use strict';

    const FILTERS_URL = "hosts"; // YOUR HOSTS.TXT HERE!
    const cached = GM_getValue("bad_domains", null);

    if (cached && (Date.now() - GM_getValue("time", 0) < 6 * 60 * 60 * 1000)) {
        startNetFilter(JSON.parse(cached));
    } else {
        GM_xmlhttpRequest({
            method: "GET", url: FILTERS_URL, onload: (res) => {
                const domains = [];
                res.responseText.split('\n').forEach(line => {
                    line = line.trim();
                    if (!line || line.startsWith('#') || line.startsWith(';')) return;
                    const parts = line.split(/\s+/);
                    if (parts.length > 1) {
                        const domain = parts[1].trim().toLowerCase();
                        if (domain.length > 2) domains.push(domain);
                    }
                });
                GM_setValue("bad_domains", JSON.stringify(domains));
                GM_setValue("time", Date.now());
                startNetFilter(domains);
            }
        });
    }

    function startNetFilter(domains) {
        if (!domains.length) return;
        const badSet = new Set(domains);
        
        const checkAndLog = (urlStr) => {
            try {
                const url = new URL(urlStr, window.location.href);
                const host = url.hostname.toLowerCase();
                if (badSet.has(host) || [...badSet].some(d => host.endsWith('.' + d))) {
                    console.log(`%c[codeadblock.js] ad blocked successfully: ${host}`, "color: red; font-weight: bold;");
                    return true;
                }
            } catch(e) {}
            return false;
        };

        const orgFetch = window.fetch;
        window.fetch = function(...args) {
            if (args && checkAndLog(typeof args[0] === 'object' ? args[0].url : args[0])) {
                return Promise.reject(new Error('Blocked by codeadblock'));
            }
            return orgFetch.apply(this, args);
        };

        const orgOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(...args) {
            if (args[1] && checkAndLog(args[1])) return;
            orgOpen.apply(this, args);
        };
    }
})();
