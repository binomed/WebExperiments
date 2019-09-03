export class HelperJsInCss{

    constructor(element, customProperty, loop, args){
        this.element = element
        this.customProperty = customProperty
        this.lastValue = undefined
        this.loop = loop
        this.args = args
        if (loop){
            window.requestAnimationFrame(this.checkElements.bind(this))
        }else{
            this.checkElements()
        }
    }

    checkElements(){


        const value = window.getComputedStyle(this.element).getPropertyValue(this.customProperty)
        const computeArguments = []
        if (this.args && this.args.length > 0){
            this.args.forEach(argumentProperty => {
                const argValue = window.getComputedStyle(this.element).getPropertyValue(argumentProperty)
                computeArguments.push(argValue)
            })
        }

        //console.log("--randomColor", value);
        const evaluateValue = eval(value)(...computeArguments)
        if (this.lastValue === evaluateValue){
            if (this.loop){
                window.requestAnimationFrame(this.checkElements.bind(this))
            }
            return;
        }

        this.lastValue = evaluateValue
        const computeName = `--compute${this.customProperty[2].toUpperCase()}${this.customProperty.substring(3)}`
        this.element.style.setProperty(computeName, evaluateValue)

        if (this.loop){
            window.requestAnimationFrame(this.checkElements.bind(this))
        }
    }

}