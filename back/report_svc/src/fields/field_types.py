
class Field:
    def __init__(self, name, value):
        self.name = name
        self.value = value

    def compute(self):
        raise NotImplementedError("Subclasses must implement this method")


class StaticField(Field):
    def __init__(self, name, value):
        super().__init__(name, value)
        # Se recibe el valor directamente desde el frontend

    def compute(self):
        return self.value


class ComputedField(Field):
    def __init__(self, name, compute_fn):
        super().__init__(name, value=None)
        self.compute_fn = compute_fn  # La función para computar el valor

    def compute(self):
        print('computando... ' + self.name)
        self.value = self.compute_fn()
        print('computada ' + self.name)
        return self.value
