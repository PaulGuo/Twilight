import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { ipcMain } from 'electron';
import concat from 'concat-stream';
import logger from './logger.js';

logger.debug("process env: '%j'", process.env);
logger.debug("node version: '%j'", process.versions);

const spawnEnv = Object.assign({}, process.env, {
    PATH: `/usr/local/bin:${process.env.PATH}`
});

logger.debug("spawn env: '%j'", spawnEnv);

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

let visualMetricsPath;
if (process.env.NODE_ENV === 'development') {
    visualMetricsPath = path.resolve(
        __dirname,
        '../third-party/visualmetrics/visualmetrics.py'
    );
} else {
    visualMetricsPath = path.resolve(
        process.resourcesPath,
        './third-party/visualmetrics/visualmetrics.py'
    );
}
logger.debug('visualmetrics path: "%s"', visualMetricsPath);

class Deferred {
    constructor() {
        const p = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        this.then = p.then.bind(p);
        this.catch = p.catch.bind(p);
    }
}

const genTmpdir = id => {
    const prefix = path.join(os.tmpdir(), `visualmetrics-`);
    if (fs.existsSync(prefix)) {
        fs.rmdirSync(prefix);
    }
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
        this.task = new Deferred();
        this.id = id;
        this.status = 'waiting';
        this.childProcess = null;
        this.file = videoFile;
        this.tmpdir = genTmpdir(id);
    }

    start() {
        const p = new Promise((resolve, reject) => {
            if (this.status === 'waiting') {
                this.spawn();
                this.task.then(resolve);
                this.task.catch(reject);
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

    spawn() {
        logger.debug(
            'task "%s" | extract | spawn arg: "%s"',
            this.id,
            this.args.join(' ')
        );
        this.childProcess = spawn('python2', this.args, {
            env: spawnEnv
        });
        this.childProcess.stdout.pipe(concat(this._handleStdout.bind(this)));
        this.childProcess.stderr.pipe(concat(this._handleStderr.bind(this)));
        this.childProcess.on('error', this._handleOnError.bind(this));
        this.childProcess.on('close', this._handleOnClose.bind(this));
    }

    _handleStdout(buf) {
        logger.debug('task "%s" | stdout: "%s"', this.id, buf.toString());
    }
    _handleStderr(buf) {
        logger.debug('task "%s" | stderr: "%s"', this.id, buf.toString());
    }
    _handleOnClose(code, signal) {
        logger.debug(
            'task "%s" | close | code: "%s" | signal: "%s"',
            this.id,
            code,
            signal
        );
        if (code !== 0) {
            this.task.reject(
                new Error(`closed with error code ${code}, signal ${signal}`)
            );
        }
    }
    _handleOnError(err) {
        logger.debug(
            'task "%s" | error | err: "%s\n%s"',
            this.id,
            err.message,
            err.stack
        );
        this.task.reject(err);
    }
}

class VisualMetricsExtractTask extends AbstractVirtualMetricsTask {
    constructor(videoFile, id) {
        super(videoFile, id);
        this.args = [
            visualMetricsPath,
            '--video',
            this.file,
            '--dir',
            this.tmpdir
        ];
    }
    _handleOnClose(code, signal) {
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
                    this.task.reject(err);
                } else {
                    logger.debug('task "%s" | images: "%j"', this.id, files);
                    const imageList = files.map(file =>
                        path.join(this.tmpdir, file)
                    );
                    this.task.resolve(imageList);
                }
            });
        } else {
            this.task.reject(
                new Error(`closed with error code ${code}, signal ${signal}`)
            );
        }
    }
}

class VisualMetricsAnalyseTask extends AbstractVirtualMetricsTask {
    constructor(videoFile, id, startTime, endTime) {
        super(videoFile, id);
        this.startTime = startTime;
        this.endTime = endTime;
        this.args = [
            visualMetricsPath,
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
    }

    _handleStdout(buf) {
        const json = buf.toString();
        logger.debug('task "%s" | stdout: "%s"', this.id, buf.toString());
        try {
            const value = JSON.parse(json);
            this.task.resolve(value);
        } catch (err) {
            logger.debug(
                'task "%s" | stdout is not valid json | err: "%s\n%s"',
                this.id,
                err.message,
                err.stack
            );
            this.task.reject(err);
        }
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
