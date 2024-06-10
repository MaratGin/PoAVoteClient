// main.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const electronIpcMain = require('electron').ipcMain;
const NodeRSA = require('node-rsa');

const Store = require('./store.js');

let mainWindow;
const fetched_public_key = "";

const store = new Store({
    // We'll call our data file 'user-preferences'
    configName: 'user-preferences',
    defaults: {
      // 800x600 is the default size of our window
      public_key: '',
      savedUsers: '',
      session: ''
    }
  });

async function createWindow() {

    // const public_key = await getPublicKey();
    // store.set('public_key', public_key);
    // console.log('public_key1' + public_key.public_key);
  
    mainWindow = new BrowserWindow({
        width: 700,
        height: 700,
        webPreferences: {
          preload: path.join(__dirname, '/preload.js'),
          contextIsolation: true,
          nodeIntegration: false
        }
      });
    mainWindow.webContents.openDevTools();

  mainWindow.loadFile('dist/index.html');
};

ipcMain.handle('store-get', (event, key) => {
    return store.get(key);
  });

  ipcMain.handle('store-set', (event, key, value) => {
    store.set(key, value);
  });


app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('button-a-clicked', async () => {
    console.log('Button a clicked!')
    mainWindow.loadFile("voteSetup.html")
});

ipcMain.on('navigate-to', (event, page) => {
    console.log("NAVIGATE" + page)
    mainWindow.loadFile(page);
    // .then(() => { window.show(); })
  });

ipcMain.on('button-b-clicked', () => {
console.log('Button b clicked!')

  const newWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true
    }
  });

  ipcMain.on('moveToMain', () => {
    console.log('move to main!')
    mainWindow.loadFile('mainMenu.html').then(() => { window.show(); })
  });
});

async function getPublicKey() {
    // const response = await fetch('http://127.0.0.1:9090/public_key');
    // const data = await response.json();
    // // console.log(data)
    // return data.public_key;
    try {
        const response = await fetch('http://127.0.0.1:9090/public_key');
        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.public_key;
    } catch (error) {
        console.error('Error fetching public key:', error);
    }
}

ipcMain.handle('get-local-public-key', () => {
    const public_key = store.get('public_key');
    console.log('LOCAL PUBLIC KEY '+ public_key)
    return public_key;
  });

  ipcMain.handle('encrypt', (event, credentials) => {
    try {
        const public_key = store.get('public_key');
        console.log('ENCRYPTED PUBLIC KEY '+ public_key + ' \n'+ credentials)

        if (!public_key) {
            throw new Error('Public key is undefined');
        }
        const key = new NodeRSA(public_key, 'pkcs1-public-pem', { encryptionScheme: 'pkcs1' });

        const encrypted = key.encrypt(credentials, 'base64');
        return encrypted;
    } catch (error) {
        console.error('Error encrypting voter info:', error);
    }
    return encrypted;
  });

  ipcMain.handle('save-session', (event, user) => {
    try {
        console.log('New session '+ user.username)
        store.set('name', user.username)
        store.set('email', user.email)
    } catch (error) {
        console.error('Error encrypting voter info:', error);
    }
    return user;
  });

  ipcMain.handle('init-user', (event) => {
    const user = {
      username: "username",
      email: "email"
    };
    try {
      const username = store.get('name');
      const email = store.get('email');

      console.log(username + ' | ' + email);
    
      user.username = username;
      user.email = email;
    } catch (error) {
        console.error('Error encrypting voter info:', error);
    }
    return user;
  });

  ipcMain.handle('user-name', (event) => {
      const username = store.get('name');
    return username;
  });

  ipcMain.handle('get-votes', async (event) => {
    const username = store.get('name');
    try {
      const response = await fetch('http://127.0.0.1:9090/getVotes?user_name='+ username);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const votes = await response.json();
      return votes;
    } catch (error) {
      console.error('Error fetching votes:', error);
    }

  return username;
});


ipcMain.handle('get-invited-votes', async (event) => {
  const username = store.get('name');
  let smth;
  try {
    const response = await fetch('http://127.0.0.1:10040/getVotes?user_name=' + username);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const textResponse = await response.text();
    // const votes = JSON.parse(textResponse);
    console.log(textResponse);

    // const votes = await response.json();
    return textResponse;
  } catch (error) {
    console.error('Error fetching votes:', error);
  }

return 1;
});

ipcMain.handle('read-json-file', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    throw error;
  }
});

  ipcMain.handle('saveUsers', (event, credentials) => {

  });