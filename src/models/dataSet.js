export class DataSet {
    constructor({ title, urlMetadata, bufferDistance, bufferText, urlGmlSchema, namespace, typeReference } = {}) {
        this.title = title || '';
        this.urlMetadata = urlMetadata || '';
        this.bufferDistance = bufferDistance || 0;
        this.bufferText = bufferText || '';
        this.urlGmlSchema = urlGmlSchema || '';
        this.namespace = namespace || '';
        this.typeReference = typeReference || {
            type: '',
            attribute: '',
            codeValue: ''
        };
    }
}
