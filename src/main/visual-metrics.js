import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { ipcMain } from 'electron';
import concat from 'concat-stream';
import logger from './logger.js';

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

let visualMetricPath;
if (process.env.NODE_ENV === 'development') {
    visualMetricPath = path.resolve(
        __dirname,
        '../third-party/visualmetrics/visualmetrics.py'
    );
} else {
    visualMetricPath = path.resolve(
        process.resourcesPath,
        './third-party/visualmetrics/visualmetrics.py'
    );
}
logger.debug('visualmetrics path: "%s"', visualMetricPath);

const genTmpdir = id => {
    const prefix = path.join(os.tmpdir(), `visualmetrics-`);
    const dir = fs.mkdtempSync(prefix);
    logger.debug('create tmpdir: "%s"', dir);
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
            const args = [
                visualMetricPath,
                '--video',
                this.file,
                '--dir',
                this.tmpdir
            ];
            logger.debug(
                'task "%s" | extract | spawn arg: "%s"',
                this.id,
                args.join(' ')
            );
            this.childProcess = spawn('python2', args);

            this.childProcess.stdout.pipe(
                concat(buf => {
                    logger.debug(
                        'task "%s" | stdout: "%s"',
                        this.id,
                        buf.toString()
                    );
                })
            );

            this.childProcess.stderr.pipe(
                concat(buf => {
                    logger.debug(
                        'task "%s" | stderr: "%s"',
                        this.id,
                        buf.toString()
                    );
                })
            );

            this.childProcess.on('error', err => {
                logger.debug(
                    'task "%s" | error | err: "%s\n%s"',
                    this.id,
                    err.message,
                    err.stack
                );
                reject(err);
            });

            this.childProcess.on('close', (code, signal) => {
                logger.debug(
                    'task "%s" | close | code: "%s" | signal: "%s"',
                    this.id,
                    code,
                    signal
                );
                if (code === 0) {
                    fs.readdir(this.tmpdir, (err, files) => {
                        if (err) {
                            logger.debug(
                                'task "%s" | readdir | err: "%s\n%s"',
                                this.id,
                                err.message,
                                err.stack
                            );
                            reject(err);
                        } else {
                            logger.debug(
                                'task "%s" | images: "%j"',
                                this.task,
                                files
                            );
                            const imageList = files.map(file =>
                                path.join(this.tmpdir, file)
                            );
                            resolve(imageList);
                        }
                    });
                } else {
                    reject(
                        new Error(
                            `closed with error code ${code}, signal ${signal}`
                        )
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
            const args = [
                visualMetricPath,
                '--video',
                this.file,
                '--dir',
                this.tmpdir,
                '--start',
                this.startTime,
                '--end',
                this.endTime,
                '--perceptual',
                '--json'
            ];
            logger.debug('extract task | spawn arg: "%s"', args.join(' '));
            this.childProcess = spawn('python2', args);

            this.childProcess.stdout.pipe(
                concat(buf => {
                    const json = buf.toString();
                    logger.debug(
                        'task "%s" | stdout: "%s"',
                        this.id,
                        buf.toString()
                    );
                    try {
                        const value = JSON.parse(json);
                        resolve(value);
                    } catch (err) {
                        logger.debug(
                            'task "%s" | stdout is not valid json | err: "%s\n%s"',
                            this.id,
                            err.message,
                            err.stack
                        );
                        reject(err);
                    }
                })
            );

            this.childProcess.stderr.pipe(
                concat(buf => {
                    logger.debug(
                        'task "%s" | stderr: "%s"',
                        this.id,
                        buf.toString()
                    );
                })
            );

            this.childProcess.on('error', err => {
                logger.debug(
                    'task "%s" | error | err: "%s\n%s"',
                    this.id,
                    err.message,
                    err.stack
                );
                reject(err);
            });

            this.childProcess.on('close', (code, signal) => {
                logger.debug(
                    'task "%s" | close | code: "%s" | signal: "%s"',
                    this.id,
                    code,
                    signal
                );
                if (code !== 0) {
                    reject(
                        new Error(
                            `closed with error code ${code}, signal ${signal}`
                        )
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
                taskId
            );

            const pTask = task.start();
            pTask.then(imageList => {
                event.sender.send(
                    'renderer:visual-metrics-extract:analyse-success',
                    taskId,
                    imageList
                );
            });
            pTask.catch(err => {
                event.sender.send(
                    'renderer:visual-metrics-extract:analyse-failure',
                    taskId,
                    err
                );
            });
        }
    );

    // stop
    ipcMain.on('main:visual-metrics-extract:stop-analyse', (event, taskId) => {
        const task = taskMap[taskId];
        if (task) task.stop();
        event.sender.send(
            'renderer:visual-metrics-extract:analyse-stopped',
            taskId
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
                endTime
            );
            event.sender.send(
                'renderer:visual-metrics-analyse:analyse-started',
                taskId
            );

            const pTask = task.start();
            pTask.then(result => {
                event.sender.send(
                    'renderer:visual-metrics-analyse:analyse-success',
                    taskId,
                    result
                );
            });
            pTask.catch(err => {
                event.sender.send(
                    'renderer:visual-metrics-analyse:analyse-failure',
                    taskId,
                    err
                );
            });
        }
    );

    // stop
    ipcMain.on('main:visual-metrics-analyse:stop-analyse', (event, taskId) => {
        const task = taskMap[taskId];
        if (task) task.stop();
        event.sender.send(
            'renderer:visual-metrics-analyse:analyse-stopped',
            taskId
        );
    });
};

export default initVisualMetrics;
