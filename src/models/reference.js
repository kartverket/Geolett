export class Reference {
    constructor({ title, tek17, otherLaw, circularFromMinistry } = {}) {
            this.title = title || '';
            this.tek17 = tek17 || {
                text: '',
                url: ''
            };
            this.otherLaw = otherLaw || {
                text: '',
                url: ''
            },
            this.circularFromMinistry = circularFromMinistry || {
                text: '',
                url: ''
            }
        };
}
