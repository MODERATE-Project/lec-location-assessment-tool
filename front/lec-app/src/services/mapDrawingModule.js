import { Modify, Draw } from 'ol/interaction.js';



// const source = new VectorSource({ wrapX: false }); // TODO: wrapX: false

let draw = null;
let modify = null;

const addBoxInteraction = (map, drawingVectorLayer) => {

    modify = new Modify({ source: drawingVectorLayer.getSource() });

    draw = new Draw({
        source: drawingVectorLayer.getSource(),
        type: 'Polygon',
        // geometryFunction: createBox(),
    });
    draw.on("drawstart", () => {
        drawingVectorLayer.getSource().clear();
    })
    map.addInteraction(draw);
    map.addInteraction(modify);

}

// typeSelect.onchange = function () {  // TODO: efecto de disable de UI
const removeBoxInteraction = (map) => {
    if (draw)
        map.removeInteraction(draw);
        map.removeInteraction(modify);

}


export { addBoxInteraction, removeBoxInteraction }