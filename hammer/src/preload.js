/**
 * @since 2015-12-05 15:38
 * @author vivaxy
 */
'use strict';

/**
 * event:
 *
 * progress
 *     加载的进度
 *     参数 progress 0 ~ 1
 * done
 *     加载结束
 * error
 *     某张图片在重试次数后还是加载失败了
 *     参数 src 图片的路径
 */

import EventEmitter from '../node_modules/event-emitter/src/event-emitter.js';

class Preload extends EventEmitter {

    constructor(resourceList) {

        super();

        if (!resourceList.length) {
            throw new Error('preload: nothing to load');
        }

        this.retryCount = 5;

        this.resourceList = resourceList;

        this.list = resourceList.map((o, index) => {
            return {
                index: index,
                src: o.src,
                retryCount: this.retryCount,
                loaded: false
            };
        });
    }

    /**
     * 预加载开始
     */
    start() {
        this.list.forEach(o => {
            let load = () => {
                this._loadImage(o.src, (image) => {
                    o.loaded = true;
                    /**
                     * 加载后的 image 对象应该被缓存下来，虽然 src 加载过，但是
                     * ```
                     * var image = new Image();
                     * image.src = src;
                     * image.complete; // => false;
                     * ```
                     */
                    this.resourceList[o.index].image = image;
                    let progress = this._getProgress();
                    this.emit('progress', progress);
                    if (progress === 1) {
                        this.emit('done');
                    }
                }, () => {
                    if (o.retryCount > 0) {
                        o.retryCount--;
                        load();
                        // 重试次数用完了
                        this.emit('error', o.src);
                    }
                });
            };
            load();
        });
    }

    /**
     * 加载单张图片
     * @param src
     * @param success
     * @param error
     * @returns {Preload}
     */
    _loadImage(src, success, error) {
        let image = new Image();
        image.addEventListener('load', () => {
            success(image);
        });
        image.addEventListener('error', error);
        image.src = src;
        return this;
    }

    /**
     * 计算整体进度
     * 0 ~ 1
     * 1 - done
     * @returns {number}
     */
    _getProgress() {

        let loadedImage = this.list.filter((o => {
            return o.loaded;
        }));

        return loadedImage.length / this.list.length;

    }
}

export default Preload;
