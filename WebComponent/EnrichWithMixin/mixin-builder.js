
class MixinBuilder{
	constructor(superclass){
		this.superclass = superclass;
	}

	with(...mixins){
		return mixins.reduce((c, mixin) => mixin(c), this.superclass);
	}
}

const mix = (subclass) => new MixinBuilder(subclass);

export  {mix};

