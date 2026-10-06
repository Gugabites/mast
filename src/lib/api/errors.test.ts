import { describe, expect, it } from 'vitest'
import { ApiError, unwrap, userMessage } from './errors'

describe('userMessage', () => {
  it('traduz os códigos conhecidos', () => {
    expect(userMessage(new ApiError('dup', '23505'))).toBe('Isso já estava registrado.')
    expect(userMessage(new ApiError('check', '23514'))).toBe(
      'Algum dado está inválido. Revise o formulário.',
    )
    expect(userMessage(new ApiError('rls', '42501'))).toBe('Sua sessão expirou. Entre novamente.')
    expect(userMessage(new ApiError('JWT expired', 'PGRST301'))).toBe(
      'Sua sessão expirou. Entre novamente.',
    )
  })

  it('reconhece falha de rede', () => {
    expect(userMessage(new TypeError('Failed to fetch'))).toBe('Sem conexão. Tente novamente.')
    expect(userMessage(new ApiError('TypeError: Load failed', ''))).toBe(
      'Sem conexão. Tente novamente.',
    )
  })

  it('usa a mensagem genérica no resto', () => {
    expect(userMessage(new Error('boom'))).toBe('Algo deu errado. Tente novamente.')
    expect(userMessage('texto solto')).toBe('Algo deu errado. Tente novamente.')
  })
})

describe('unwrap', () => {
  it('devolve data ou lança ApiError com o código', () => {
    expect(unwrap({ data: 1, error: null })).toBe(1)
    expect(() => unwrap({ data: null, error: { message: 'x', code: '23505' } })).toThrow(ApiError)
  })
})
