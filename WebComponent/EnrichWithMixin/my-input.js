import {EmptyMixin} from './empty-mixin.js';
import {mix} from './mixin-builder.js';

export class MyInput extends EmptyMixin(HTMLInputElement){

	constructor(){
		super();
	}

	connectedCallback(){
		super.connectedCallback();
	}
}

customElements.define('my-input', MyInput, {extends: 'input'});