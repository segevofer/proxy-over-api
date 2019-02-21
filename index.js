const proxyRequire = requireFunction => moduleName => {
    let module;

    requireFunction(moduleName, loadedModule => {
        module = loadedModule
        console.log(`Loaded module "${moduleName}"`)
    })

    function recursiveProxyOrFunction(path) {
        function proxiedFunction(...args) {
            if (!module) {
                throw new Error(`Called function ${path} in ${moduleName} before getting it...`)
                // TODO: do whatever you want here. a promise might be a good idea for some cases
            }
            const split = path.split('.');
            let reflection = module;
            while (split.length) {
                reflection = Reflect.get(reflection, split.shift())
            }
            return reflection(...args)
        }

        return new Proxy(proxiedFunction, { // eslint-disable-line
            get(obj, propName) {
                return recursiveProxyOrFunction(`${path}.${propName}`)
            }
        })
    }

    return new Proxy({}, { // eslint-disable-line
        get(obj, propName) {
            return module ? Reflect.get(module, propName) : recursiveProxyOrFunction(propName)
        }
    })
}

module.exports = proxyRequire
