import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { ipcMain } from 'electron';
import concat from 'concat-stream';
import logger from 'electron-log';

/**
 *  event name format
 *      - listener : category : event
 *
 *  visual-metrics-extract
 *      - listen
 *          - main:visual-metrics-extract:start-analyse, videoFile
 *          - main:visual-metrics-extract:stop-analyse, taskId
 *      - emit
 *          - renderer:visual-metrics-extract:analyse-started, taskId
 *          - renderer:visual-metrics-extract:analyse-stopped, taskId
 *          - renderer:visual-metrics-extract:analyse-success, taskId, imageList
 *          - renderer:visual-metrics-extract:analyse-failure, taskId, error
 *  visual-metrics-analyse
 *      - listen
 *          - main:visual-metrics-analyse:start-analyse, videoFile, startTime, endTime
 *          - main:visual-metrics-analyse:stop-analyse, taskId
 *      - emit
 *          - renderer:visual-metrics-analyse:analyse-started, taskId
 *          - renderer:visual-metrics-analyse:analyse-stopped, taskId
 *          - renderer:visual-metrics-analyse:analyse-success, taskId, result
 *          - renderer:visual-metrics-analyse:analyse-failure, taskId, error
 */

const visualMetricPath = path.resolve(
    __dirname,
    '../third-party/visualmetrics/visualmetrics.py',
);
const genTmpdir = id => {
    const prefix = path.join(os.tmpdir(), `visualmetrics-${id}-`);
    const dir = fs.mkdtempSync(prefix);
    logger.log('tmpdir %s', dir);
    return dir;
};

// communicate with visualmetrics
class AbstractVirtualMetricsTask {
    // status
    // - waiting <- create
    // - running <- start waiting
    //      - success
    //      - failure
    // - stopped <- stop waiting/running
    constructor(videoFile, id) {
        this.id = id;
        this.file = videoFile;
        this.childProcess = null;
        this.status = 'waiting';
        this.tmpdir = genTmpdir(id);
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
    }
}

class VisualMetricsExtractTask extends AbstractVirtualMetricsTask {
    constructor(videoFile, id) {
        super(videoFile, id);
    }

    _spawn() {
        return new Promise((resolve, reject) => {
            this.childProcess = spawn('python2', [
                visualMetricPath,
                '--video',
                this.file,
                '--dir',
                this.tmpdir,
                '--quality',
                '75',
                '--orange',
                '--gray',
                '--viewport',
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
                                path.join(this.tmpdir, file),
                            );
                            resolve(imageList);
                        }
                    });
                } else {
                    reject(
                        new Error(`TODO: error code ${code}, signal ${signal}`),
                    );
                }
            });
        });
    }
}

class VisualMetricsAnalyseTask extends AbstractVirtualMetricsTask {
    constructor(videoFile, id, startTime, endTime) {
        super(videoFile, id);
        this.startTime = startTime;
        this.endTime = endTime;
    }

    _spawn() {
        return new Promise((resolve, reject) => {
            const stdout = concat(function(buf) {
                const json = buf.toString();
                try {
                    const value = JSON.parse(json);
                    value.PerceptualSpeedIndexChart.unshift([0, 0]);
                    resolve(value);
                } catch (err) {
                    logger.error(`err output: ${json}`);
                    reject(err);
                }
            });

            this.childProcess = spawn('python2', [
                visualMetricPath,
                '--video',
                this.file,
                '--dir',
                this.tmpdir,
                '--start',
                this.startTime,
                '--end',
                this.endTime,
                '--quality',
                '75',
                '--orange',
                '--gray',
                '--viewport',
                '--perceptual',
                '--json',
            ]);

            this.childProcess.stdout.pipe(stdout);

            this.childProcess.on('error', err => {
                logger.error(err);
                reject(err);
            });

            this.childProcess.on('close', (code, signal) => {
                logger.log(`code=${code}`);
                if (code !== 0) {
                    reject(
                        new Error(`TODO: error code ${code}, signal ${signal}`),
                    );
                }
            });
        });
    }
}

// communicate with renderer
const initVisualMetrics = () => {
    let ID = 0;
    const taskMap = {};

    // start
    ipcMain.on(
        'main:visual-metrics-extract:start-analyse',
        (event, videoFile) => {
            ID++;

            const taskId = ID;
            const task = new VisualMetricsExtractTask(videoFile, taskId);
            event.sender.send(
                'renderer:visual-metrics-extract:analyse-started',
                taskId,
            );

            const pTask = task.start();
            pTask.then(imageList => {
                event.sender.send(
                    'renderer:visual-metrics-extract:analyse-success',
                    taskId,
                    imageList,
                );
            });
            pTask.catch(err => {
                event.sender.send(
                    'renderer:visual-metrics-extract:analyse-failure',
                    taskId,
                    err,
                );
            });
        },
    );

    // stop
    ipcMain.on('main:visual-metrics-extract:stop-analyse', (event, taskId) => {
        const task = taskMap[taskId];
        if (task) task.stop();
        event.sender.send(
            'renderer:visual-metrics-extract:analyse-stopped',
            taskId,
        );
    });

    // start
    ipcMain.on(
        'main:visual-metrics-analyse:start-analyse',
        (event, videoFile, startTime, endTime) => {
            ID++;

            const taskId = ID;
            const task = new VisualMetricsAnalyseTask(
                videoFile,
                taskId,
                startTime,
                endTime,
            );
            event.sender.send(
                'renderer:visual-metrics-analyse:analyse-started',
                taskId,
            );

            const pTask = task.start();
            pTask.then(result => {
                event.sender.send(
                    'renderer:visual-metrics-analyse:analyse-success',
                    taskId,
                    result,
                );
            });
            pTask.catch(err => {
                event.sender.send(
                    'renderer:visual-metrics-analyse:analyse-failure',
                    taskId,
                    err,
                );
            });
        },
    );

    // stop
    ipcMain.on('main:visual-metrics-analyse:stop-analyse', (event, taskId) => {
        const task = taskMap[taskId];
        if (task) task.stop();
        event.sender.send(
            'renderer:visual-metrics-analyse:analyse-stopped',
            taskId,
        );
    });
};

export default initVisualMetrics;
