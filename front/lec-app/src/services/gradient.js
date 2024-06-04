const createGradientFunction = (values) => {
    
    const min = Math.min(...values)
    const max = Math.max(...values)

    return (value) => {

        const ratio = (value - min) / (max - min);
        let r, g, b = 0;
        if (ratio < 0.5) {
            // De rojo a amarillo
            r = 255;
            g = Math.round(255 * (ratio * 2));
        } else {
            // De amarillo a verde
            r = Math.round(255 * ((1 - ratio) * 2));
            g = 255;
        }

        return `rgb(${r},${g},${b})`;
    }
}


// const gradientColor = (value, min, max) => {
//     const ratio = (value - min) / (max - min);
//     let r, g, b = 0;
//     if (ratio < 0.5) {
//         // De rojo a amarillo
//         r = 255;
//         g = Math.round(255 * (ratio * 2));
//     } else {
//         // De amarillo a verde
//         r = Math.round(255 * ((1 - ratio) * 2));
//         g = 255;
//     }
//     return `rgb(${r},${g},${b})`;
// };

export { createGradientFunction };