export class BuiltInInput extends HTMLElement{


	get type(){
		return this._input && this._input.getAttribute('type');
	}

	set type(type){
		if (!this._input) return;
		this._input.setAttribute('type', type);
	}

	get value(){
		return this._input.value;
	}

	set value(value){
		return this._input.value;
	}

	constructor(){
		super();
		this.attachShadow({mode: 'open'});
	}

	connectedCallback(){
		const style = document.createElement('style');
		style.textContent = `
			:host {
				display: block; /* by default, custom elements are display: inline */
				contain: content; /* CSS containment FTW. */
				--built-in-input: {};
			}
			input{
				@apply --built-in-input;
			}
		`;
		this._input = document.createElement('input');
		this.shadowRoot.appendChild(style);
		this.shadowRoot.appendChild(this._input);
	}

	static get observedAttributes() {
		return [
				'type',
			];
	}

	/**
	 *
	 * @param {string} attr
	 * @param {string} oldValue
	 * @param {string} newValue
	 */
	attributeChangedCallback(attr, oldValue, newValue){
		if (this[attr] != newValue){
			this[attr] = newValue;
		}
	}

}

customElements.define('built-in-input', BuiltInInput);