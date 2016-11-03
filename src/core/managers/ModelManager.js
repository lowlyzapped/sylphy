const Thinky = require('thinky')
const requireAll = require('require-all')
const EventEmitter = require('eventemitter3')

class ModelManager extends EventEmitter {
  constructor (options) {
    super()
    this.models = {}

    const thinky = this.thinky = new Thinky(options)
    thinky.dbReady()
    .then(() => this.emit('ready'))
  }

  loadFolder (folder) {
    const models = requireAll(folder)
    for (let model in models) {
      this.load(models[model].call(this))
    }
  }

  load ({ tableName, schema, options = {} }) {
    if (typeof tableName !== 'string') {
      this.emit('error', TypeError('Model found with invalid name'))
      return
    }
    if (typeof schema !== 'object') {
      this.emit('error', TypeError(`Model ${tableName} has an invalid schema`))
      return
    }
    if (typeof options !== 'object') {
      this.emit('error', TypeError(`Model ${tableName} has invalid options`))
      return
    }
    if (typeof this.models[tableName] === 'object') {
      this.emit('error', Error(`Duplicate model found: ${tableName}`))
      return
    }

    const modelID = tableName
    const model = this.thinky.createModel(modelID, schema, options)

    this.models[modelID] = model
    this.emit('loaded', modelID)
  }
}

module.exports = ModelManager
