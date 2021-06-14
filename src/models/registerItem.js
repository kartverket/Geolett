export class RegisterItem {
    constructor({ owner, contextType, title, description, links, dialogText, possibleMeasures, guidance, dataSet, reference, technicalComment, otherComment, sign1, sign2, sign3, sign4, sign5, sign6 } = {}) {
        this.owner = owner || {
            id: null
        };
        this.contextType = contextType || '';
        this.title = title || '';
        this.description = description || '';
        this.links = links || [];
        this.dialogText = dialogText || '';
        this.possibleMeasures = possibleMeasures || '';
        this.guidance = guidance || '';
        this.dataSet = dataSet || null;
        this.reference = reference || null;
        this.technicalComment = technicalComment || '';
        this.otherComment = otherComment || '';
        this.sign1 = sign1 || '';
        this.sign2 = sign2 || '';
        this.sign3 = sign3 || '';
        this.sign4 = sign4 || '';
        this.sign5 = sign5 || '';
        this.sign6 = sign6 || '';
    }
}
