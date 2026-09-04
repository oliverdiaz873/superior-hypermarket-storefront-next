import { describe, expect, it } from '@jest/globals'
import { formatUnitLabel, formatProductPrice } from './priceUtils'
import type { Product } from '@/types/product'

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'test-1',
  name: 'Test Product',
  url: '/product/test-1',
  categoria: 'test',
  precio: 100,
  precioTexto: 'Precio: $100',
  imagen: '',
  ...overrides,
})

describe('priceUtils · formatUnitLabel', () => {
  describe('unidades contables (pluralizan)', () => {
    it('unidad + 1 → "unidad"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'unidad', quantity: 1 }), 'es')).toBe('unidad')
    })

    it('unidad + 2 → "2 unidades"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'unidad', quantity: 2 }), 'es')).toBe(
        '2 unidades',
      )
    })

    it('unidad + 6 → "6 unidades"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'unidad', quantity: 6 }), 'es')).toBe(
        '6 unidades',
      )
    })

    it('unit (en) + 1 → "unit"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'unit', quantity: 1 }), 'en')).toBe('unit')
    })

    it('unit (en) + 2 → "2 units"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'unit', quantity: 2 }), 'en')).toBe('2 units')
    })

    it('litro + 1 → "litro"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'litro', quantity: 1 }), 'es')).toBe('litro')
    })

    it('litro + 2 → "2 litros"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'litro', quantity: 2 }), 'es')).toBe('2 litros')
    })

    it('liters (en) + 2 → "2 liters"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'liters', quantity: 2 }), 'en')).toBe('2 liters')
    })

    it('paquete + 2 → "2 paquetes"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'paquete', quantity: 2 }), 'es')).toBe(
        '2 paquetes',
      )
    })

    it('caja + 2 → "2 cajas"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'caja', quantity: 2 }), 'es')).toBe('2 cajas')
    })

    it('botella + 2 → "2 botellas"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'botella', quantity: 2 }), 'es')).toBe(
        '2 botellas',
      )
    })

    it('lata + 2 → "2 latas"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'lata', quantity: 2 }), 'es')).toBe('2 latas')
    })
  })

  describe('unidades no contables (no pluralizan)', () => {
    it('kg + 1 → "kg"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'kg', quantity: 1 }), 'es')).toBe('kg')
    })

    it('kg + 2 → "2 kg"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'kg', quantity: 2 }), 'es')).toBe('2 kg')
    })

    it('kg + 0.5 → "0.5 kg"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'kg', quantity: 0.5 }), 'es')).toBe('0.5 kg')
    })

    it('g + 500 → "500 g"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'g', quantity: 500 }), 'es')).toBe('500 g')
    })

    it('g + 1 → "g"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'g', quantity: 1 }), 'es')).toBe('g')
    })

    it('lb + 2 → "2 lb"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'lb', quantity: 2 }), 'es')).toBe('2 lb')
    })

    it('ml + 250 → "250 ml"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'ml', quantity: 250 }), 'es')).toBe('250 ml')
    })

    it('l + 2 → "2 l"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'l', quantity: 2 }), 'es')).toBe('2 l')
    })

    it('oz + 1 → "oz"', () => {
      expect(formatUnitLabel(makeProduct({ unidad: 'oz', quantity: 1 }), 'es')).toBe('oz')
    })
  })

  describe('sin unidad', () => {
    it('unidad undefined → ""', () => {
      expect(formatUnitLabel(makeProduct({ unidad: undefined, quantity: 2 }), 'es')).toBe('')
    })

    it('unidad vacía → ""', () => {
      expect(formatUnitLabel(makeProduct({ unidad: '', quantity: 2 }), 'es')).toBe('')
    })

    it('quantity null → ""', () => {
      expect(
        formatUnitLabel(makeProduct({ unidad: 'kg', quantity: null as number | null }), 'es'),
      ).toBe('')
    })
  })
})

describe('priceUtils · formatProductPrice', () => {
  it('1 unidad → "Precio: $100 / unidad"', () => {
    const product = makeProduct({ unidad: 'unidad', quantity: 1, precio: 100 })
    expect(formatProductPrice(product, { locale: 'es' })).toBe('Precio: $100 / unidad')
  })

  it('2 unidades → "Precio: $100 / 2 unidades"', () => {
    const product = makeProduct({ unidad: 'unidad', quantity: 2, precio: 100 })
    expect(formatProductPrice(product, { locale: 'es' })).toBe('Precio: $100 / 2 unidades')
  })

  it('2 kg → "Precio: $100 / 2 kg"', () => {
    const product = makeProduct({ unidad: 'kg', quantity: 2, precio: 100 })
    expect(formatProductPrice(product, { locale: 'es' })).toBe('Precio: $100 / 2 kg')
  })

  it('0.5 kg → "Precio: $100 / 0.5 kg"', () => {
    const product = makeProduct({ unidad: 'kg', quantity: 0.5, precio: 100 })
    expect(formatProductPrice(product, { locale: 'es' })).toBe('Precio: $100 / 0.5 kg')
  })

  it('sin unidad → "Precio: $100"', () => {
    const product = makeProduct({ unidad: undefined, precio: 100 })
    expect(formatProductPrice(product, { locale: 'es' })).toBe('Precio: $100')
  })

  it('unidad con quantity null → "Precio: $100" (no trailing slash)', () => {
    const product = makeProduct({ unidad: 'unidad', quantity: null as number | null, precio: 100 })
    expect(formatProductPrice(product, { locale: 'es' })).toBe('Precio: $100')
  })

  it('usa translatedUnit cuando se proporciona', () => {
    const product = makeProduct({ unidad: 'unidad', quantity: 2, precio: 100 })
    expect(formatProductPrice(product, { translatedUnit: '2 uds.', locale: 'es' })).toBe(
      'Precio: $100 / 2 uds.',
    )
  })
})
