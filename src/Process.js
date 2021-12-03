function Process(ymlParseMinterApi, mnemonic) {

    const Minter = require('minter-js-sdk');
    const minter = new Minter.Minter({apiType: ymlParseMinterApi.apiType, chainId: ymlParseMinterApi.chainId, baseURL: ymlParseMinterApi.baseURL});

    let seedPhrase = mnemonic

    /**
     * @param {string} jsonStr
     * @return {Object|null}
     */
    this.parseJson = function (jsonStr) {
        try {
            return JSON.parse(jsonStr)
        } catch (err) {
            console.error("Error parse: ", err);
        }
        return null
    }
    /**
     * @param {Object} json
     * @param {function(*=): Object} callback
     */
    this.postTx = function (json, callback) {
        let txParams = json['txParams']
        let postTxOptions = {}
        if (json['postTxOptions'] != null) {
            postTxOptions = json['postTxOptions']
        } else {
            // postTxOptions['seedPhrase'] = seedPhrase
        }

        minter.postTx(txParams, {seedPhrase: seedPhrase})
            .then((txHash) => {
                const result = {hash: txHash.hash, error: false, message: null}
                // console.debug("Tx created: ", result);
                callback(result);
            }).catch((error) => {
            let errorMessage = "Undefined"
            try {
                console.error("error: ", error);
                errorMessage = error.response.data.error.message
            } catch (err) {
                console.error("Error error.response.data.error.message: ", err);
            }
            const result = {tx: null, error: true, message: errorMessage}
            console.log("txParams", txParams);
            console.error(result);
            callback(result);
        });
    }
    this.prepareTx = function () {

    }
}

module.exports = Process;