export class MyButton extends HTMLButtonElement{

	constructor() {
		super();
	}

	connectedCallback(){
		super.connectedCallback();
	}

}

customElements.define("my-button", MyButton, { extends: "button" });