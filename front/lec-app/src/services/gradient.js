import chroma from 'chroma-js';

const createGradientFunction = (values, min, max) => {

    if (!min || !max) {
        min = Math.min(...values)
        max = Math.max(...values)
    }

    return chroma.scale(['green', 'yellow', 'red']).domain([min, max]);

}

const darken = (color) => (chroma(color).darken().saturate(2))

export { createGradientFunction, darken };