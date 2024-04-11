if (typeof chrome !== 'undefined' && chrome.runtime) throw new Error('Chrome runtime already exists');

window.chrome = {}
window.chrome.runtime = {

    onInstalled: {
        addListener: () => {
        }
    },
    onMessage: {
        addListener: () => {
        }
    },
    sendMessage: () => {
    }
};
window.chrome.storage = {

    local: {
        get: function (keys, callback) {
            if (!keys) {
                const items = Object.keys(localStorage).reduce((result, key) => {
                    try {
                        result[key] = JSON.parse(localStorage.getItem(key));
                    } catch (e) {
                        // Handle cases where the stored data is not valid JSON
                        console.error(`Error parsing value for key '${key}':`, e);
                    }
                    return result;
                }, {});
                callback(items);
            } else {
                let value = localStorage.getItem(keys);
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    // If the value is double-encoded, attempt to parse it again
                    try {
                        value = JSON.parse(JSON.parse(value));
                    } catch (e) {
                        value = null;
                    }
                }
                callback(value ? { [keys]: value } : null);
            }
        },
        set: function (items, callback) {
            try {
                Object.keys(items).forEach(function (key) {
                    localStorage.setItem(key, JSON.stringify(items[key]));
                });
                callback && callback();
            } catch (e) {
                callback && callback(new Error("Error saving items to localStorage"));
            }
        },
        remove: function (keys, callback) {
            try {
                if (!Array.isArray(keys)) {
                    keys = [keys];
                }
                keys.forEach(function (key) {
                    localStorage.removeItem(key);
                });
                callback && callback();
            } catch (e) {
                callback && callback(new Error("Error removing items from localStorage"));
            }
        },
    },

};

// Empty fake client for chrome.contextMenus
window.chrome.contextMenus = {
    create: () => {
    }
};

// Empty fake client for chrome.tabs
window.chrome.tabs = {
    create: (options) => {
        if (options.url) {
            window.location.href = options.url;
        }
    },
    executeScript: () => {
    },
    insertCSS: () => {
    },
    update: () => {
    },
    query: () => {
    },
    sendMessage: () => {
    },
    onActivated: {
        addListener: () => {
        }
    },
    onUpdated: {
        addListener: () => {
        }
    }
};