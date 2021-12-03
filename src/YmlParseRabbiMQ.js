/**
 * @param {Object} rabbitmq
 */
function YmlParseRabbiMQ(rabbitmq){

    let user = null;
    let password = null;
    let host =  '127.0.0.1';
    let port = null;
    let vhost = null; // %2f

    parse(rabbitmq);

    /**
     * @param {Object} rabbitmq
     */
    function parse(rabbitmq) {
        if (typeof rabbitmq.user !== 'undefined') user=rabbitmq.user;
        if (typeof rabbitmq.password !== 'undefined') password=rabbitmq.password;
        if (typeof rabbitmq.host !== 'undefined') host=rabbitmq.host;
        if (typeof rabbitmq.port !== 'undefined') port=rabbitmq.port;
        if (typeof rabbitmq.vhost !== 'undefined') vhost=rabbitmq.vhost;

    }

    /**
     * @return {String}
     */
    this.getUrl = function () {
        let amqp_URI = "amqp://"
        if (user != null && password != null ) amqp_URI += user+':'+password+'@'
        if (host != null) amqp_URI += host
        if (port != null) amqp_URI += ':'+port
        if (vhost != null) amqp_URI += '/'+vhost; else amqp_URI += '/';
        return amqp_URI
    }
}
module.exports = YmlParseRabbiMQ;