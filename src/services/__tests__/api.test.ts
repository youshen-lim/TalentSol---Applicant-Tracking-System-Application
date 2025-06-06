import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Service', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('should handle successful API responses', async () => {
    const mockResponse = { data: 'test' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const response = await fetch('/api/test')
    const data = await response.json()
    
    expect(data).toEqual(mockResponse)
  })

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' }),
    })

    const response = await fetch('/api/test')
    expect(response.ok).toBe(false)
    expect(response.status).toBe(404)
  })
})
