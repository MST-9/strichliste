const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  load: () => ipcRenderer.invoke('load'),
  save: json => ipcRenderer.send('save', json),
  path: ipcRenderer.sendSync('path')
});
