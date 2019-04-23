registerPaint('circle-from-css', class {
    static get inputProperties() {
        return ['--circle-js-in-css'];
    }

    paint(ctx, geom, properties, args) {
        //console.log(properties.get('--circle-js-in-css'));
        //console.log(properties.get('--circle-js-in-css').toString());
        eval(properties.get('--circle-js-in-css').toString())(ctx, geom, properties);
    }
});