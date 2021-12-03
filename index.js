#!/usr/bin/env node
const yaml = require('js-yaml');
const fs = require('fs');

var amqp = require('amqplib/callback_api');

var args = process.argv.slice(2);

let yaml_file
if (args.length === 0) {
    console.log("Usage: index.js example.yml");
    process.exit(1);
} else {
    yaml_file = args[0]
}
let rabbitmq, minter_api = {};
let wallet_mnemonic, wallet_address, app_queue = '';

const minterjs_wallet = require('minterjs-wallet');
try {
    const doc = yaml.load(fs.readFileSync(yaml_file, 'utf8'));
    rabbitmq = doc.rabbitmq
    minter_api = doc.minter_api

    wallet_mnemonic = doc.wallet.mnemonic
    wallet_address = doc.wallet.address

    if (typeof doc.app !== 'undefined') {
        if (typeof doc.app.queue !== 'undefined') app_queue = doc.app.queue; else app_queue = wallet_address;
    } else {
        app_queue = wallet_address;
    }

} catch (e) {
    console.log(e);
    process.exit(1);
}

const YmlParseRabbiMQ = require('./src/YmlParseRabbiMQ');
const YmlParseMinterApi = require('./src/YmlParseMinterApi');

let ymlParseRabbiMQ = new YmlParseRabbiMQ(rabbitmq)
let ymlParseMinterApi = new YmlParseMinterApi(minter_api)

// console.log(ymlParseRabbiMQ.getUrl());

try {
    const get_wallet = minterjs_wallet.walletFromMnemonic(wallet_mnemonic)
    if (get_wallet.getAddressString() !== wallet_address && wallet_address !== '') {
        console.error("Error: mnemonic for " + get_wallet.getAddressString() + ", config address = " + wallet_address + "");
        process.exit(1);
    }
} catch (e) {
    console.error(e);
    process.exit(1);
}

const Process = require('./src/Process');

let proc = new Process(ymlParseMinterApi.getConfig(), wallet_mnemonic)


amqp.connect(ymlParseRabbiMQ.getUrl(), function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }

        channel.assertQueue(app_queue, {
            durable: false
        });
        channel.prefetch(1);
        console.log(' [x] Awaiting RPC requests for ' + wallet_address + ', app_queue=' + app_queue);
        channel.consume(app_queue, function reply(msg) {
                const message = msg.content.toString();

                if (message === 'ping') {
                    channel.sendToQueue(msg.properties.replyTo,
                        Buffer.from('pong'), {
                            correlationId: msg.properties.correlationId
                        });
                    console.log('channel.ack(msg) for ping');
                    channel.ack(msg);
                } else {
                    const array = proc.parseJson(message);
                    let returnArray = {hash: null, error: true, message: null}
                    if (array != null) {

                        if (typeof array.txParams !== 'undefined') {
                            proc.postTx(array, function (result) {
                                console.log("result", result);
                                if (result != null) {
                                    returnArray = result
                                } else {
                                    returnArray.message = "NoName"
                                }
                                const json = JSON.stringify(returnArray)
                                channel.sendToQueue(msg.properties.replyTo,
                                    Buffer.from(json.toString()), {
                                        correlationId: msg.properties.correlationId
                                    });
                                console.log('channel.ack(msg) ');
                                channel.ack(msg);
                            })
                        }
                    } else {
                        returnArray.message = "Error parse json"
                        const json = JSON.stringify(returnArray)
                        channel.sendToQueue(msg.properties.replyTo,
                            Buffer.from(json.toString()), {
                                correlationId: msg.properties.correlationId
                            });
                        console.log('channel.ack(msg) ');
                        channel.ack(msg);
                    }
                }
            }
        );
    });
});
