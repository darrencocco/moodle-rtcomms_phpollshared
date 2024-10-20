/**
 * Real time eventsc
 *
 * @module     rtcomms_phppollshared/worker
 * @copyright  2024 Darren Cocco
 */
define(['rtcomms_phppoll/realtime', 'core/pubsub', 'tool_realtime/events', 'local_webworkers/worker'],
    function(phpPoll, PubSub, RealTimeEvents, workerHelper) {
    return {
        init: function() {
            let portMap = new Map();
            let portToChannelMap = {};
            let channelToPortMap = {};
            let channelBacklog = [];
            let phpPollInitialised = false;
            self.addEventListener('connect', (e) => {
                const port = e.ports[0];

                let clientId = portNumber.next().value;
                port.clientId = clientId;
                portMap.set(clientId, port);
                portToChannelMap[clientId] = [];

                port.addEventListener("message", handleClientMessage(port.clientId));
                port.start();
            });

            let handleMessage = (clientId, e) => {
                let port = getClientPort(clientId);
                if(port === undefined){
                    return;
                }
                switch(e.data.type) {
                    case 'configure':
                        if(!phpPollInitialised) {
                            setupPolling(e.data.configuration);
                        }
                        break;
                    case 'listen':
                        // TODO: should probably add some data validation here.
                        if(!hasChannel(port, getChannelName(e.data.channel))) {
                            addChannel(port, e.data.channel);
                        }
                        break;
                    case 'close':
                        cleanupPort(port.clientId);
                        delete port.clientId;
                        break;
                    case 'ping':
                        port.postMessage({type: 'pong'});
                        break;
                    default:
                        // TODO: Return better error message.
                        port.postMessage('error');
                        break;
                }
            };

            let handleClientMessage = (clientId) => {
                return (e) => {
                    return handleMessage(clientId, e);
                };
            };

            let serverMessageHandler = function(message) {
                let channelName = _getChannelNameFromMessage(message);
                if(channelToPortMap.hasOwnProperty(channelName)) {
                    channelToPortMap[channelName].forEach((clientId) => {
                        getClientPort(clientId)?.postMessage({ type: 'message', message: message});
                    });
                }
            };


            /**
             * Gets channel name from message data format.
             * @param {object} message
             * @returns {string}
             * @private
             */
            function _getChannelNameFromMessage(message) {
                return getChannelName({
                    context: message.context.id,
                    component: message.component,
                    area: message.area,
                    itemid: message.itemid,
                });
            }

            /**
             *
             * @param {int} clientId
             * @returns {MessagePort}
             */
            function getClientPort(clientId) {
                return portMap.get(clientId);
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
                let channelName = getChannelName(channel);
                portToChannelMap[port.clientId].push(channelName);
                if(!channelToPortMap.hasOwnProperty(channelName)) {
                    channelToPortMap[channelName] = [];
                    PubSub.subscribe(channelName, serverMessageHandler);
                }
                channelToPortMap[channelName].push(port.clientId);
                if(phpPoll === null) {
                    channelBacklog.push(channel);
                } else {
                    phpPoll.subscribe();
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

            /**
             * Generates a sequential set of numbers for the
             * lifetime of the worker.
             * @returns {Generator<number, void, *>}
             */
            function* generatePortNumber() {
                const start = 0;
                const end = Infinity;
                const step = 1;
                for (let i = start; i < end; i += step) {
                    yield i;
                }
            }
            let portNumber =  generatePortNumber();

            /**
             *
             * @param {Object} configuration
             */
            function setupPolling(configuration) {
                phpPollInitialised = true;
                phpPoll.init(configuration);
                if(channelBacklog.length > 0) {
                    phpPoll.subscribe();
                }
            }

            /**
             *
             * @param {Object} channelData
             * @returns {string}
             */
            function getChannelName(channelData) {
                return RealTimeEvents.EVENT + '/' + channelData.context + '/' + channelData.component + '/'
                    + channelData.area + '/' + channelData.itemid;
            }

            workerHelper.workerSetupComplete();
        }
    };
});