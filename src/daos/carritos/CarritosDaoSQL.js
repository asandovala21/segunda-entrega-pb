import ContenedorSQL from "../../contenedores/ContenedorSQL.js"

class CarritosDaoSQL {

    constructor(configCarritos, configProds) {
        this.carritos = new ContenedorSQL(configCarritos, 'carritos')
        this.prodsEnCarritos = new ContenedorSQL(configProds, 'prodsEnCarritos')
    }

    async save(carrito = {}) {
        const result = await this.carritos.save(carrito)
        result.productos = []
        return result
    }

    async getById(_idCarrito) {
        const idCarrito = Number(_idCarrito)
        await this.carritos.getById(idCarrito)
        const result = {
            id: idCarrito,
            productos: []
        }
        const prodsEnCarritos = await this.prodsEnCarritos.getAll({ idCarrito })
        for (const prod of prodsEnCarritos) {
            delete prod.idCarrito
            result.productos.push(prod)
        }
        return result
    }

    async update(carrito) {
        carrito.id = Number(carrito.id)
        await this.prodsEnCarritos.deleteAll({ idCarrito: carrito.id })
        const inserts = carrito.productos.map(p => {
            return this.prodsEnCarritos.save({
                ...p,
                idCarrito: carrito.id
            })
        })
        return Promise.allSettled(inserts)
    }

    async deleteById(_idCarrito) {
        const idCarrito = Number(_idCarrito)
        const result = await Promise.allSettled([
            this.prodsEnCarritos.deleteAll({ idCarrito }),
            this.carritos.deleteById(idCarrito)
        ])
        return result
    }

    deleteAll() {
        return Promise.allSettled([
            this.carritos.deleteAll(),
            this.prodsEnCarritos.deleteAll()
        ])
    }

    async getAll() {
        const carritosIds = await this.carritos.getAll()
        const carritosMap = new Map()
        for (const obj of carritosIds) {
            carritosMap.set(obj.id, {
                id: obj.id,
                productos: []
            })
        }
        const prodsEnCarritos = await this.prodsEnCarritos.getAll()
        for (const prod of prodsEnCarritos) {
            if (carritosMap.has(prod.idCarrito)) {
                carritosMap.get(prod.idCarrito).productos.push(prod)
            }
        }
        return [...carritosMap.values()]
    }
}

export default CarritosDaoSQL
