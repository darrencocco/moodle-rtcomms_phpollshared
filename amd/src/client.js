define(['local_webworkers/sharedworker!rtcomms_phppollshared/worker', 'tool_realtime/api'],
    function(sharedWorker, realtimeApi) {
    const sharedWorkerClientPrototype = {
        init(userId, token, pollURLParam, maxDelay, maxFailures, earliestMessageCreationTime, pollType) {
            this.sharedWorker = sharedWorker();
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
            this.sharedWorker.port.onmessage = this.messageReceiver;
            window.onpagehide = () => {
                this.sharedWorker.port.postMessage({type: 'close'});
            };
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
            realtimeApi.publish(e.data);
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
    Object.assign(SharedWorkerClient, sharedWorkerClientPrototype);
    let instance = new SharedWorkerClient();
    return {
        init: function(userId, token, pollURLParam, maxDelay, maxFailures, earliestMessageCreationTime, pollType) {
            instance.init(userId, token, pollURLParam, maxDelay, maxFailures, earliestMessageCreationTime, pollType);
        },
        subscribe: (context, component, area, itemid, fromId= -1, fromTimestamp = -1) => {
            instance.subscribe(context, component, area, itemid, fromId, fromTimestamp);
        },
    };
});