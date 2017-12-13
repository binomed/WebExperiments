
const EmptyMixin = (subclass) => class extends subclass {

	constructor(){
		super();
	}

	_isEmpty() {
		return this.value === undefined || this.value === null || this.value === '';
	}

	connectedCallback(){
		//super.connectedCallback();
		if (this._isEmpty()) {
			this.classList.remove('ng-not-empty');
			this.classList.remove('is-filled');
			this.classList.add('ng-empty');
		} else {
			this.classList.add('ng-not-empty');
			this.classList.add('is-filled');
			this.classList.remove('ng-empty');
		}
	}
};
export {EmptyMixin};