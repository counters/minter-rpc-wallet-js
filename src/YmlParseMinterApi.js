/**
 * @param {Object} config
 */
function YmlParseMinterApi(config){

    /**
     * @param {string} baseURL
     * @param {int} chainId
     * @param {string} apiType
     */
    function Config (baseURL, chainId, apiType) {
        this.baseURL = baseURL;
        this.chainId = chainId;
        this.apiType = apiType;
    }

    let baseURL = null;
    let chainId = null;
    let apiType =  'node';

    parse(config);

    /**
     * @param {Object} config
     */
    function parse(config) {
        // console.info(config)
        if (typeof config.baseURL !== 'undefined') baseURL=config.baseURL;
        if (typeof config.chainId !== 'undefined') chainId= config.chainId;
        if (typeof config.apiType !== 'undefined') apiType=config.apiType;
    }

    /**
     * @return {Config|null}
     */
    this.getConfig = function () {
        if (baseURL!=null && chainId!=null  ) {
            return new Config(baseURL, chainId, apiType)
        }
        return null
    }

}
module.exports = YmlParseMinterApi;