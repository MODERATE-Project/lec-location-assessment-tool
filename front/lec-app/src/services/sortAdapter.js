export default function mapWeightsToApi(weights) {

    return {
        "Renta_media": weights.Rent,
        "Total_edad_media": weights.Age,
        "Total_poblacion": weights.Population,
        "Porcentaje_Hogares_unipersonales": weights["Single-person households"],
        "Porcentaje_mayor_65": weights["Elderly Percentage"],
        "Porcentaje_menor_18": weights["Youth Percentage"],
        "Tamaño_medio_hogar": weights["Average Persons Per Household"],
        "production": weights["Production"],
    }

}
