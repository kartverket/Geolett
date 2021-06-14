if (!String.prototype.format) {
    // eslint-disable-next-line
    String.prototype.format = function () {
        let args = arguments;
  
        if (typeof args[0] === 'object') {
            return this.replace(/{(\w+)}/g, function (match, key) {
                return typeof args[0][key] !== 'undefined' ? args[0][key] : match;
            });
        }
  
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    };
  }
  