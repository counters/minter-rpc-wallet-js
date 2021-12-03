# minter-rpc-wallet-js

Remote build, sign and send any transaction

## Usage
```shell
./index.js example.yml
```

Currently, RabbitMQ transport is supported (HTTP and gRPC in the plans).
Use a RabbitMQ compatible RPC client written in any language. [Examples](https://www.rabbitmq.com/getstarted.html)

It is necessary to send a Json object by analogy with the official [minter-js-sdk](https://github.com/MinterTeam/minter-js-sdk#transaction-types)

#### Request example:
```json
{
  "txParams": {
    "type": 1,
    "data": {
      "to": "Mx376615B9A3187747dC7c32e51723515Ee62e37Dc",
      "value": 10,
      "coin": 0
    }
  }
}
```

#### Example of a successful transaction response
```json
{
  "hash": "Mt01020304050607___",
  "error": false,
  "message": null
}
```

#### Example of a failed transaction response
```json
{"hash": null, "error": true, "message": "text error"}
```