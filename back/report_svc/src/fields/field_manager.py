import yaml
from fields.field_factory import FieldFactory
import importlib
import inspect
import os
import logging

log = logging.getLogger(__name__)


def load_yaml(file_path):
    with open(file_path, 'r') as file:
        return yaml.safe_load(file)


def save_yaml(name, data, base_dir):
    yaml_filename = f'parameters_{name}.yaml'
    with open(os.path.join(base_dir, yaml_filename), 'w') as file:
        yaml.safe_dump(data, file)


def load_functions_from_module(module_name):
    """Cargar funciones de un módulo dado y devolver un diccionario."""
    module = importlib.import_module(module_name)
    functions_dict = {}

    # Iterar sobre los miembros del módulo y filtrar las funciones
    for name, func in inspect.getmembers(module, inspect.isfunction):
        functions_dict[name] = func

    return functions_dict


def get_yaml_parameters(name, base_dir):
    yaml_filename = os.path.join(base_dir, f'parameters_{name}.yaml')
    return load_yaml(yaml_filename)


def compute_all(fields):
    for field in fields:
        field.compute(municipality, yaml_data, field_dict)

def _update_yaml(yaml_data, field_dict):
    """Une dos diccionarios, prefiriendo valores de d2 (field_dict) sobre los de d1 (yaml_data),
       y solo actualiza las claves existentes en d1 sin agregar nuevas claves de d2."""
    return {k: field_dict[k] if k in field_dict else yaml_data[k] for k in yaml_data.keys()}


def get_and_compute_as_needed(municipality, field_dict, base_dir="../data"):

    yaml_data = _update_yaml(get_yaml_parameters(municipality, base_dir), field_dict)

    compute_map = load_functions_from_module('fields.compute_functions')

    fields = FieldFactory.create_from_dict(field_dict, yaml_data, compute_map)

    for field in fields:
        log.info(f'Municipality: {municipality}')
        field.compute(municipality, yaml_data, field_dict) # NOTE: here is where we include data required by the compute functions
        # yaml_data[field.name] = field.value

    save_yaml(str(municipality), yaml_data, base_dir=base_dir)

    return yaml_data


if __name__ == "__main__":
    # Simulación de datos del frontend
    field_dict = {
        'MUNICIPALITY': 'Crevillent',  # Valor recibido desde el frontend
    }

    municipality = field_dict.get("MUNICIPALITY").capitalize()
    
    yaml_data = get_and_compute_as_needed(municipality=municipality, field_dict=field_dict)
    
    log.info(yaml_data)
