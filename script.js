/** Write contents of the textarea to the clipboard when clicking "Copy" */
copy.onclick = function () {
    navigator.clipboard.writeText(out.value)
        .then(() => {
            log('Text copied.');
        })
        .catch(log);
};

/** Read from clipboard when clicking the Paste button */
paste.onclick = function () {
    navigator.clipboard.readText()
        .then(text => {
            out.value = text;
            log('Text pasted.');
        })
        .catch(() => {
            log('Failed to read clipboard');
        });
};

/** Watch for pastes */
navigator.clipboard.addEventListener('clipboardchange', e => {
    navigator.clipboard.getText().then(text => {
        log('Updated clipboard contents: ' + text)
    })
});

/** The 4 available permissions for Async Clipboard API: */
const PERMISSIONS = [{
        name: "clipboard-read"
    },
    {
        name: "clipboard-write"
    }
    //{ name: "clipboard-read",  allowWithoutGesture: false },
    //{ name: "clipboard-read",  allowWithoutGesture: true  },
    //{ name: "clipboard-write", allowWithoutGesture: false },
    //{ name: "clipboard-write", allowWithoutGesture: true  }
];

/** Query for each permission's state, then watch for changes and update buttons accordingly: */
Promise.all(
    PERMISSIONS.map(descriptor => navigator.permissions.query(descriptor))
).then(permissions => {
    permissions.forEach((status, index) => {
        let descriptor = PERMISSIONS[index],
            name = permissionName(descriptor),
            btn = document.createElement('button');
        btn.title = 'Click to request permission';
        btn.textContent = name;
        // Clicking a button (re-)requests that permission:
        btn.onclick = () => {
            navigator.permissions.request(descriptor)
                .then(status => {
                    log(`Permission ${status.state}.`);
                })
                .catch(err => {
                    log(`Permission denied: ${err}`);
                });
        };
        // If the permission status changes, update the button to show it
        status.onchange = () => {
            btn.setAttribute('data-state', status.state);
        };
        status.onchange();
        permbuttons.appendChild(btn);
    });
});

function permissionName(permission) {
    let name = permission.name.split('-').pop();
    if ('allowWithoutGesture' in permission) {
        name += ' ' + (permission.allowWithoutGesture ? '(without gesture)' : '(with gesture)');
    }
    return name;
}

function log(value) {
    clearTimeout(log.timer);
    if (toast.hidden) toast.textContent = value;
    else toast.textContent += '\n' + value;
    toast.className = String(value).match(/error/i) ? 'error' : '';
    toast.hidden = false;
    log.timer = setTimeout(() => {
        toast.hidden = true;
    }, 3000);
}

/** Checks whether the clipboard data has changed */
function checkClipboard() {

    if (navigator.clipboard && navigator.clipboard.read) {
    
        navigator.clipboard.read().then(async function dataRead(data) {

            var mimeType = "";
            for (var i = 0; i < data[0].types.length; i++) {
                if (data[0].types[i] == "text/plain") {
                    mimeType = data[0].types[i];
                    break;
                }
                else if (data[0].types[i] == "image/png") {
                    mimeType = data[0].types[i];
                    break;
                }
                else {
                }
            }

            var blob = null;
            try{
                if (mimeType == "text/plain") {
                    blob = await data[0].getType("text/plain");
                    if (!!blob) {
                        blob = await blob.text();
                        out.value = blob;
                    }
                }
                else if (mimeType == "image/png") {
                    blob = await data[0].getType("image/png");
                }
                else {
                    mimeType = "text/plain";
                    blob = "";
                }
            }
            catch (err) {
                console.error(err.name, err.message);
            }

        })
        .catch(() => {
            log('Failed to read clipboard when focusing this page');
        });

    }

}

window.addEventListener('copy',  checkClipboard);
window.addEventListener('cut',   checkClipboard);
window.addEventListener('focus', function focusGained(e) {

    if (e.target === window)
        checkClipboard();

}, true);
