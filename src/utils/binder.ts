/**
 * Binds all methods of a class to the instance of the class.
 * @param instance The instance to bind the methods to
 */
export function bind<T extends object>(instance: T): void {
  const proto = Object.getPrototypeOf(instance);
  for (const ownPropertyName of Object.getOwnPropertyNames(proto)) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, ownPropertyName);
    if (descriptor && typeof descriptor.value === "function") {
      instance[ownPropertyName as keyof T] = descriptor.value.bind(instance);
    }
  }
}
