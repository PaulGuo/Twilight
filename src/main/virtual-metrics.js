import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { ipcMain } from 'electron';
import logger from 'electron-log';

/**
 *  event name format
 *      - listener : category : event
 *
 *  listen
 *      - main:virtual-metrics:start-analyse, videoFile
 *      - main:virtual-metrics:stop-analyse, taskId
 *  emit
 *      - renderer:virtual-metrics:analyse-started, taskId
 *      - renderer:virtual-metrics:analyse-stopped, taskId
 *      - renderer:virtual-metrics:analyse-success, taskId, imageList
 *      - renderer:virtual-metrics:analyse-failure, taskId, error
 */

const virtualMetricPath = path.resolve(
    __dirname,
    '../visualmetrics/visualmetrics.py'
);
const tmpdir = path.join(os.tmpdir(), 'virtualmetric');

// communicate with virtualmetric
class VirtualMetricTask {
    // status
    // - waiting <- create
    // - running <- start waiting
    //      - success
    //      - failure
    // - stopped <- stop waiting/running

    constructor(videoFile, id) {
        this.id = id;
        this.tmpdir = path.join(tmpdir, `${id}-${Date.now()}`);
        this.file = videoFile;
        this.childProcess = null;
        this.status = 'waiting';
    }

    _spawn() {
        return new Promise((resolve, reject) => {
            this.childProcess = spawn('python2', [
                virtualMetricPath,
                '--video',
                this.file,
                '--dir',
                this.tmpdir,
                '--quality',
                '75',
                '--orange',
                '--gray',
                '--viewport'
            ]);

            this.childProcess.on('error', err => {
                logger.error(err);
                reject(err);
            });

            this.childProcess.on('close', (code, signal) => {
                if (code === 0) {
                    fs.readdir(this.tmpdir, (err, files) => {
                        if (err) {
                            logger.error(err);
                            reject(err);
                        } else {
                            const imageList = files.map(file =>
                                path.join(this.tmpdir, file)
                            );
                            resolve(imageList);
                        }
                    });
                } else {
                    reject(new Error(`TODO: error code ${code}, signal ${signal}`));
                }
            });
        });
    }

    start() {
        const p = new Promise(resolve => {
            if (this.status === 'waiting') {
                resolve(this._spawn());
            } else {
                throw new Error(`start: current status is ${this.status}`);
            }
        });
        p.then(() => {
            this.status = 'running';
        });
        p.catch(() => {
            this.status = 'failure';
            this.cleanup();
        });
        return p;
    }

    stop() {
        switch (this.status) {
            case 'waiting':
                this.status = 'stopped';
                break;
            case 'running':
                this.childProcess.kill();
                this.status = 'stopped';
                break;
        }
        this.cleanup();
    }

    cleanup() {
        fs.unlink(this.tmpdir, (err) => {
            if (err) {
                logger.error(err);
            }
        });
    }
}

// communicate with renderer
const startListen = () => {
    let ID = 0;
    const taskMap = {};

    // start
    ipcMain.on('main:virtual-metrics:start-analyse', (event, videoFile) => {
        ID++;

        const taskId = ID;
        const task = new VirtualMetricTask(videoFile, taskId);
        event.sender.send('renderer:virtual-metrics:analyse-started', taskId);

        const pTask = task.start();
        pTask.then(imageList => {
            event.sender.send(
                'renderer:virtual-metrics:analyse-success',
                taskId,
                imageList
            );
        });
        pTask.catch(err => {
            event.sender.send(
                'renderer:virtual-metrics:analyse-failure',
                taskId,
                err
            );
        });
    });

    // stop
    ipcMain.on('main:virtual-metrics:stop-analyse', (event, taskId) => {
        const task = taskMap[taskId];
        if (task) task.stop();
        event.sender.send('renderer:virtual-metrics:analyse-stopped', taskId);
    });
};

export default startListen;
