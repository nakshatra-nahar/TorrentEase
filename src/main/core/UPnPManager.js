import NatAPI from '@motrix/nat-api'

import logger from './Logger'

let client = null
const mappingStatus = {}

export default class UPnPManager {
  constructor (options = {}) {
    this.options = {
      ...options
    }
  }

  init () {
    if (client) {
      return
    }

    client = new NatAPI({
      autoUpdate: true
    })
  }

  map (port) {
    this.init()

    return new Promise((resolve, reject) => {
      logger.info('[TorrentEase] UPnPManager port mapping: ', port)
      if (!port) {
        reject(new Error('[TorrentEase] port was not specified'))
        return
      }

      try {
        client.map(port, (err) => {
          if (err) {
            logger.warn(`[TorrentEase] UPnPManager map ${port} failed, error: `, err.message)
            reject(err.message)
            return
          }

          mappingStatus[port] = true
          logger.info(`[TorrentEase] UPnPManager port ${port} mapping succeeded`)
          resolve()
        })
      } catch (err) {
        reject(err.message)
      }
    })
  }

  unmap (port) {
    this.init()

    return new Promise((resolve, reject) => {
      logger.info('[TorrentEase] UPnPManager port unmapping: ', port)
      if (!port) {
        reject(new Error('[TorrentEase] port was not specified'))
        return
      }

      if (!mappingStatus[port]) {
        resolve()
        return
      }

      try {
        client.unmap(port, (err) => {
          if (err) {
            logger.warn(`[TorrentEase] UPnPManager unmap ${port} failed, error: `, err)
            reject(err.message)
            return
          }

          logger.info(`[TorrentEase] UPnPManager port ${port} unmapping succeeded`)
          mappingStatus[port] = false
          resolve()
        })
      } catch (err) {
        reject(err.message)
      }
    })
  }

  closeClient () {
    if (!client) {
      return
    }

    try {
      client.destroy(() => {
        client = null
      })
    } catch (err) {
      logger.warn('[TorrentEase] close UPnP client fail', err)
    }
  }
}
