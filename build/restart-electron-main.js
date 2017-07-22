const path = require('path');
const { spawn } = require('child_process');
const electron = require('electron');
const chokidar = require('chokidar');

const main = path.join(__dirname, '../dist/main.js');
let electronProcess = null;

const restart = () => {
    if (electronProcess !== null) {
        electronProcess.kill('SIGKILL');
    }
    electronProcess = spawn(electron, ['--inspect=5858', main], {
        stdio: 'inherit'
    });
};

chokidar.watch(main).on('add', restart).on('change', restart);
