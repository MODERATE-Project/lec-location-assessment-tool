from fields.field_types import StaticField, ComputedField


class FieldFactory:
    @staticmethod
    def create_from_dict(field_dict, yaml_data, compute_map):
        """
        :param yaml_data: El diccionario cargado del YAML
        :param compute_map: Diccionario que contiene las funciones de cálculo para campos computados
        """
        fields = []

        # Mergea el YAML con el dict de entrada
        full_field_dict = field_dict | yaml_data

        for name, value in full_field_dict.items():
            if value is not None:
                field = StaticField(name, value)

            else:
                # compute_map.get(name, lambda x: f"Default computation for {x}")
                compute_fn = compute_map.get(f"compute_{name}", raise_no_compute_function)

                field = ComputedField(name, compute_fn)

            fields.append(field)

        return fields


def raise_no_compute_function(name):
    raise RuntimeError(f"No compute function found for {name}")
