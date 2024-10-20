define(['local_webworkers/worker', 'tool_realtime/api'],
    function(worker, realtimeApi) {
    const sharedWorkerClientPrototype = {
        init(userId, token, pollURLParam, maxDelay, maxFailures, earliestMessageCreationTime, pollType) {
            this.sharedWorker = new SharedWorker(worker.getURI('rtcomms_phppollshared/worker'));
            this.sharedWorker.port.addEventListener('message', this.messageReceiver);
            this.sharedWorker.port.start();
            this.sharedWorker.port.postMessage({
                type: 'configure',
                configuration: {
                    userId: userId,
                    token: token,
                    pollURLParam: pollURLParam,
                    maxDelay: maxDelay,
                    maxFailures: maxFailures,
                    earliestMessageCreationTime: earliestMessageCreationTime,
                    pollType: pollType,
                }
            });
            window.addEventListener( 'pagehide', () => {
                this.sharedWorker.port.postMessage({type: 'close'});
            });
            realtimeApi.setImplementation(pub);
        },

        subscribe(context, component, area, itemid, fromId= -1, fromTimestamp = -1) {
            this.sharedWorker.port.postMessage({
                type: 'listen',
                channel: {
                    context: context,
                    component: component,
                    area: area,
                    itemid: itemid,
                    fromId: fromId,
                    fromTimestamp: fromTimestamp,
                }
            });
        },

        messageReceiver(e) {
            switch(e.data.type) {
                case 'message':
                    realtimeApi.publish(e.data.message);
                    break;
                case 'ping':
                    this.sharedWorker.port.postMessage({type: 'pong'});
                    break;
                default:
                    // TODO: unknown message, should handle this with an error log to the console.
            }

        },
    };

    /**
     *
     * @constructor
     */
    function SharedWorkerClient() {
        /**
         *
         * @type {SharedWorker}
         */
        this.sharedWorker = null;
    }
    Object.assign(SharedWorkerClient.prototype, sharedWorkerClientPrototype);
    let instance = new SharedWorkerClient();
    let pub = {
        init: function(userId, token, pollURLParam, maxDelay, maxFailures, earliestMessageCreationTime, pollType) {
            instance.init(userId, token, pollURLParam, maxDelay, maxFailures, earliestMessageCreationTime, pollType);
        },
        subscribe: (context, component, area, itemid, fromId= -1, fromTimestamp = -1) => {
            instance.subscribe(context, component, area, itemid, fromId, fromTimestamp);
        },
    };
    return pub;
});