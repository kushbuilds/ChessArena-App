import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

class WebSocketService {
  private client: Client | null = null
  private subscriptions: Map<string, any> = new Map()
  private pendingSubs: Map<string, (msg: any) => void> = new Map()

  connect(token: string, onConnected: () => void, onError: (e: any) => void) {
    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        this.pendingSubs.forEach((cb, dest) => this.subscribe(dest, cb))
        this.pendingSubs.clear()
        onConnected()
      },
      onStompError: onError,
      onDisconnect: () => { this.subscriptions.clear() },
    })
    this.client.activate()
  }

  disconnect() {
    this.subscriptions.forEach(sub => { try { sub.unsubscribe() } catch {} })
    this.subscriptions.clear()
    this.client?.deactivate()
    this.client = null
  }

  subscribe(destination: string, callback: (message: any) => void) {
    if (!this.client?.connected) {
      this.pendingSubs.set(destination, callback)
      return
    }
    if (this.subscriptions.has(destination)) {
      try { this.subscriptions.get(destination).unsubscribe() } catch {}
    }
    const sub = this.client.subscribe(destination, (msg: IMessage) => {
      try { callback(JSON.parse(msg.body)) } catch { callback(msg.body) }
    })
    this.subscriptions.set(destination, sub)
  }

  unsubscribe(destination: string) {
    const sub = this.subscriptions.get(destination)
    if (sub) { try { sub.unsubscribe() } catch {} this.subscriptions.delete(destination) }
  }

  send(destination: string, body: any) {
    if (!this.client?.connected) return
    this.client.publish({ destination, body: JSON.stringify(body) })
  }

  isConnected() {
    return this.client?.connected ?? false
  }
}

export const wsService = new WebSocketService()
