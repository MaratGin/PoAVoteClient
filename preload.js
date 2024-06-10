// preload.js
const { contextBridge, ipcRenderer } = require('electron');
// const ipcRenderer = require('electron').ipcRenderer;

// Все API Node.js будут доступны в контексте рендерера.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector);
      if (element) element.innerText = text;
    };
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency]);
    }
  });


  contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => {
      let validChannels = ['navigate-to'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    invoke: (channel, data) => {
      let validChannels = ['get-local-public-key', 'encrypt', 'save-session', 'init-user','user-name', 'get-votes', 'get-invited-votes', 'read-json-file'];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = ['fromMain'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  });