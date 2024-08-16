/**
 * Real time events
 *
 * @module     rtcomms_phppollshared/worker
 * @copyright  2024 Darren Cocco
 */
define(['rtcomms_phppoll/realtime', 'core/pubsub', 'tool_realtime/events'],
    function(PhpPoll, PubSub, RealTimeEvents) {
    let portMap = {};
    let portToChannelMap = {};
    let channelToPortMap = {};
    let phpPoll = null;
    let channelBacklog = [];
    self.onconnect = (e) => {
        const port = e.ports[0];

        port.clientId = portNumber().next();
        portMap[port.clientId] = port;
        portToChannelMap[port.clientId] = [];

        port.addEventListener("message", (e) => {
            if(!portIsAvailable(port)){
                return;
            }
            switch(e.data.type) {
                case 'configure':
                    if(phpPoll === null) {
                        setupPolling(e.data.configuration);
                    }
                    break;
                case 'listen':
                    // TODO: should probably add some data validation here.
                    if(!hasChannel(port, channelName(e.data.channel))) {
                        addChannel(port, e.data.channel);
                    }
                    break;
                case 'close':
                    cleanupPort(port.clientId);
                    delete port.clientId;
                    break;
                default:
                    // TODO: Return better error message.
                    port.postMessage('error');
                    break;
            }
        });

        port.start();
    };

    let serverMessageHandler = function(message) {
        let channelName = channelName(message);
        if(channelToPortMap.hasOwnProperty(channelName)) {
            channelToPortMap[channelName].forEach((portId) => {
                portMap[portId].postMessage(message);
            });
        }
    };

    /**
     *
     * @param {int} port
     * @returns {boolean}
     */
    function portIsAvailable(port) {
        return port.hasOwnProperty('clientId');
    }

    /**
     *
     * @param {MessagePort} port
     * @param {string} channelName
     * @returns {boolean}
     */
    function hasChannel(port, channelName) {
        return portToChannelMap[port.clientId].includes(channelName);
    }

    /**
     *
     * @param {MessagePort} port
     * @param {Object} channel
     */
    function addChannel(port, channel) {
        let channelName = channelName(channel);
        portToChannelMap[port.clientId].push(channelName);
        if(!channelToPortMap.hasOwnProperty(channelName)) {
            channelToPortMap[channelName] = [];
            PubSub.subscribe(channelName, serverMessageHandler);
        }
        channelToPortMap[channelName].push(port.clientId);
        if(phpPoll === null) {
            channelBacklog.push(channel);
        } else {
            phpPoll.subscribe(channel);
        }
    }

    /**
     * Remove ports and channel associations
     * @param {string} clientId
     */
    function cleanupPort(clientId) {
        delete portMap[clientId];
        portToChannelMap['clientId'].forEach((channel) => {
            let index = channelToPortMap[channel].indexOf(clientId);
            channelToPortMap[channel].splice(index, 1);
        });
        delete portToChannelMap[clientId];
    }

    let _portNumber = null;
    let portNumber = function() {
        if(_portNumber !== null && _portNumber !== undefined) {
            return _portNumber;
        }
        _portNumber = (function*() {
            const start = 0;
            const end = Infinity;
            const step = 1;
            for (let i = start; i < end; i += step) {
                yield i;
            }
        });
        return _portNumber;
    };

    /**
     *
     * @param {Object} configuration
     */
    function setupPolling(configuration) {
        phpPoll = new PhpPoll();
        phpPoll.init(configuration.userId, configuration.token, configuration.pollURLParam, configuration.maxDelay,
            configuration.maxFailures, configuration.earliestMessageCreationTime, configuration.pollType);
        if(channelBacklog.length > 0) {
            channelBacklog.forEach((channel) => {
                phpPoll.subscribe(channel.context, channel.component, channel.area, channel.itemid,
                    channel.fromId, channel.fromTimestamp);
            });
            channelBacklog = [];
        }
    }

    /**
     *
     * @param {Object} channelData
     * @returns {string}
     */
    function channelName(channelData) {
        return RealTimeEvents.EVENT + '/' + channelData.context + '/' + channelData.component + '/'
            + channelData.area + '/' + channelData.itemid;
    }
});