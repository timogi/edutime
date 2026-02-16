/**
 * Low-level Payrexx API client.
 *
 * Handles HMAC-SHA256 authentication and request building.
 * Based on the official Payrexx Node demo:
 * https://github.com/payrexx/payrexx-node
 *
 * Required env vars:
 * - PAYREXX_INSTANCE: Payrexx instance name (e.g. "edutime")
 * - PAYREXX_API_SECRET: API secret key from Payrexx dashboard
 */

import axios from 'axios'
import qs from 'qs'
import Base64 from 'crypto-js/enc-base64'
import hmacSHA256 from 'crypto-js/hmac-sha256'

const PAYREXX_API_BASE = 'https://api.payrexx.com/v1.0/'

export interface PayrexxConfig {
  instance: string
  apiSecret: string
  baseUrl?: string
}

export interface PayrexxGatewayParams {
  amount: number
  currency: string
  purpose?: string
  successRedirectUrl?: string
  failedRedirectUrl?: string
  cancelRedirectUrl?: string
  referenceId?: string
  basket?: Array<{
    name: string[]
    description?: string[]
    quantity: number
    amount: number
    vatRate?: number
  }>
  fields?: Record<string, { value: string }>
  language?: string
  skipResultPage?: boolean
  validity?: number
  subscriptionState?: boolean
  subscriptionInterval?: string
  subscriptionPeriod?: string
  subscriptionCancellationInterval?: string
  vatRate?: number
}

export interface PayrexxGatewayResponse {
  status: string
  data: Array<{
    id: number
    status: string
    hash: string
    referenceId: string
    link: string
    invoices: unknown[]
    preAuthorization: number
    reservation: number
    amount: number
    currency: string
    createdAt: number
  }>
}

export interface PayrexxTransactionResponse {
  status: string
  data: Array<{
    id: number
    status: string
    referenceId: string
    amount: number
    currency: string
  }>
}

export class PayrexxClient {
  private instance: string
  private secret: string
  private baseUrl: string

  constructor(config: PayrexxConfig) {
    this.instance = config.instance
    this.secret = config.apiSecret
    this.baseUrl = config.baseUrl || PAYREXX_API_BASE
  }

  /**
   * Build HMAC-SHA256 API signature as required by Payrexx.
   * See: https://developers.payrexx.com/reference/rest-api
   */
  private buildSignature(data?: Record<string, unknown>): string {
    let queryStr = ''
    if (data) {
      queryStr = qs.stringify(data, { format: 'RFC1738' })
      queryStr = queryStr.replace(
        /[!'()*~]/g,
        (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
      )
    }
    return Base64.stringify(hmacSHA256(queryStr, this.secret))
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl}${path}?instance=${this.instance}`
  }

  /**
   * Create a Payrexx Gateway (payment page).
   * See: https://developers.payrexx.com/reference/create-a-gateway
   */
  async createGateway(params: PayrexxGatewayParams): Promise<PayrexxGatewayResponse> {
    const data: Record<string, unknown> = { ...params }
    data.ApiSignature = this.buildSignature(data as Record<string, unknown>)
    const queryStr = qs.stringify(data)
    const url = this.buildUrl('Gateway/')

    try {
      const response = await axios.post(url, queryStr)
      return response.data
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Payrexx API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        )
      }
      throw error
    }
  }

  /**
   * Get a Gateway by ID.
   */
  async getGateway(id: number): Promise<PayrexxGatewayResponse> {
    const url = `${this.buildUrl(`Gateway/${id}/`)}&ApiSignature=${this.buildSignature()}`

    try {
      const response = await axios.get(url)
      return response.data
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Payrexx API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        )
      }
      throw error
    }
  }

  /**
   * Get a Transaction by ID.
   */
  async getTransaction(id: number): Promise<PayrexxTransactionResponse> {
    const url = `${this.buildUrl(`Transaction/${id}/`)}&ApiSignature=${this.buildSignature()}`

    try {
      const response = await axios.get(url)
      return response.data
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Payrexx API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        )
      }
      throw error
    }
  }

  /**
   * Delete (cancel) a Gateway by ID.
   */
  async deleteGateway(id: number): Promise<void> {
    const data: Record<string, unknown> = {}
    data.ApiSignature = this.buildSignature()
    const queryStr = qs.stringify(data)
    const url = `${this.buildUrl(`Gateway/${id}/`)}`

    try {
      await axios.delete(url, { data: queryStr })
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Payrexx API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        )
      }
      throw error
    }
  }
}

/**
 * Create a PayrexxClient from environment variables.
 * Returns null if env vars are not configured (use mock provider instead).
 */
export function createPayrexxClientFromEnv(): PayrexxClient | null {
  const instance = process.env.PAYREXX_INSTANCE
  const apiSecret = process.env.PAYREXX_API_SECRET

  if (!instance || !apiSecret) {
    return null
  }

  return new PayrexxClient({ instance, apiSecret })
}
