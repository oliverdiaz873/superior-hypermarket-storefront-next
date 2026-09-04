import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ApiRequestError, sendContactMessage } from '@/lib/api-client'
import { useFormValidation } from '../hooks/useFormValidation'
import type { Order } from '@/types/order'
import './ContactForm.css'
import '@/features/help/components/HelpLayout.css'

interface ContactFormProps {
    onSuccess?: () => void
    helpCategory?: string
    helpTopic?: string
    initialOrderId?: string
    orders?: Order[]
    isAuthenticated?: boolean
    initialName?: string
    initialEmail?: string
}

const ContactForm = ({
    onSuccess,
    helpCategory,
    helpTopic,
    initialOrderId,
    orders = [],
    isAuthenticated = false,
    initialName,
    initialEmail,
}: ContactFormProps) => {
    const t = useTranslations('contact')
    const tHelp = useTranslations('help')
    const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId ?? '')
    const [genericOrderId, setGenericOrderId] = useState(initialOrderId ?? '')

    // Resolve display names for chips
    const categoryName = helpCategory ? (() => { try { return tHelp(`categories.${helpCategory}`) } catch { return helpCategory } })() : ''
    const topicName = helpCategory && helpTopic ? (() => { try { return tHelp(`topics.${helpCategory}.${helpTopic}.title`) } catch { return helpTopic } })() : ''

    const selectedOrder = orders.find((o) => o.id === selectedOrderId)
    const orderDisplay = selectedOrder ? `#${selectedOrder.orderNumber}` : selectedOrderId ? `#${selectedOrderId}` : ''

    // Contextual placeholder for message (i18n)
    const messagePlaceholder = (() => {
        if (helpCategory && helpTopic) {
            if (selectedOrderId && orderDisplay) {
                return tHelp('contact_context.message_placeholder_with_order', { orderNumber: orderDisplay })
            }
            return tHelp('contact_context.message_placeholder_topic', { topic: topicName || helpTopic || '' })
        }
        return t('form.placeholders.message')
    })()

    const { formData, errors, submitError, isSubmitting, handleInputChange, handleSubmit } = useFormValidation(async (data) => {
        try {
            let prefix = ''
            if (helpCategory && helpTopic) {
                prefix = `[${helpCategory}/${helpTopic}]`
                const orderIdToUse = isAuthenticated ? selectedOrderId : genericOrderId.trim()
                if (orderIdToUse) {
                    prefix += `[pedido:${orderIdToUse}] `
                } else {
                    prefix += ' '
                }
            }
            const messageToSend = prefix + data.mensaje.trim()

            await sendContactMessage({
                name: data.nombre.trim(),
                email: data.email.trim(),
                phone: data.telefono.trim() || undefined,
                message: messageToSend
            })
        } catch (err) {
            if (err instanceof ApiRequestError && err.status === 429) {
                throw new Error(t('form.error.rate_limited'))
            }
            if (err instanceof ApiRequestError && err.message) {
                throw new Error(err.message)
            }
            throw new Error(t('form.error.submit_failed'))
        }

        if (onSuccess) {
            onSuccess()
        }
    }, {
        resetOnSuccess: true,
        initialData: {
            nombre: initialName ?? '',
            email: initialEmail ?? '',
            mensaje: '',
        }
    })

    const showHelpContext = Boolean(helpCategory && helpTopic)

    return (
        <form onSubmit={handleSubmit} className="contacto-form" noValidate>
            <h1>{t('form.title')}</h1>

            {showHelpContext && (
                <div className="help-chips" style={{ marginBottom: '16px' }}>
                    <span className="help-chip">
                        {categoryName} › {topicName}
                    </span>
                    {(selectedOrderId || genericOrderId) && (
                        <span className="help-chip help-chip-order">
                            Pedido: {isAuthenticated ? (orderDisplay || `#${selectedOrderId}`) : (genericOrderId ? `#${genericOrderId.trim()}` : '')}
                        </span>
                    )}
                </div>
            )}

            {showHelpContext && isAuthenticated && orders.length > 0 && (
                <div className="input-box mb-5 md:mb-6">
                    <label htmlFor="help_order">{tHelp('contact_context.order_selector_label')}</label>
                    <select
                        id="help_order"
                        value={selectedOrderId}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                        className="help-order-select"
                    >
                        <option value="">{tHelp('contact_context.order_selector_hint')}</option>
                        {orders.map((o) => (
                            <option key={o.id} value={o.id}>
                                #{o.orderNumber} — {o.status} — {new Date(o.createdAt).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                    <div className="text-white/60 text-xs mt-1 ml-2">{tHelp('contact_context.order_selector_hint')}</div>
                </div>
            )}

            {showHelpContext && !isAuthenticated && (
                <div className="input-box mb-5 md:mb-6">
                    <label htmlFor="help_order_generic">{tHelp('contact_context.order_generic_label')}</label>
                    <input
                        id="help_order_generic"
                        name="help_order_generic"
                        type="text"
                        placeholder={tHelp('contact_context.order_generic_placeholder')}
                        value={genericOrderId}
                        onChange={(e) => setGenericOrderId(e.target.value)}
                        className="w-full"
                    />
                    <div className="text-white/60 text-xs mt-1 ml-2">{tHelp('contact_context.order_generic_hint')}</div>
                </div>
            )}

            <div className="input-box mb-5 md:mb-6">
                <label htmlFor="nombre">{t('form.labels.name')}</label>
                <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder={t('form.placeholders.name')}
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={`w-full ${
                        errors.nombre 
                            ? 'invalid-value' 
                            : ''
                    }`}
                    required
                />
                {errors.nombre && (
                    <div className="error-message text-red-400 text-sm mt-1 ml-2 min-h-[16px]">
                        {errors.nombre}
                    </div>
                )}
            </div>
            
            <div className="input-box mb-5 md:mb-6">
                <label htmlFor="email">{t('form.labels.email')}</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('form.placeholders.email')}
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full ${
                        errors.email 
                            ? 'invalid-value' 
                            : ''
                    }`}
                    required
                />
                {errors.email && (
                    <div className="error-message text-red-400 text-sm mt-1 ml-2 min-h-[16px]">
                        {errors.email}
                    </div>
                )}
            </div>
            
            <div className="input-box mb-5 md:mb-6">
                <label htmlFor="telefono">{t('form.labels.phone')}</label>
                <input
                    id="telefono"
                    name="telefono"
                    type="text"
                    placeholder={t('form.placeholders.phone')}
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className={`w-full ${
                        errors.telefono 
                            ? 'invalid-value' 
                            : ''
                    }`}
                />
                {errors.telefono && (
                    <div className="error-message text-red-400 text-sm mt-1 ml-2 min-h-[16px]">
                        {errors.telefono}
                    </div>
                )}
            </div>

            <div className="input-box mb-5 md:mb-6">
                <label htmlFor="mensaje">{t('form.labels.message')}</label>
                <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={6}
                    placeholder={messagePlaceholder}
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    className={`w-full ${
                        errors.mensaje 
                            ? 'invalid-value' 
                            : ''
                    }`}
                    required
                />
                {errors.mensaje && (
                    <div className="error-message text-red-400 text-sm mt-1 ml-2 min-h-[16px]">
                        {errors.mensaje}
                    </div>
                )}
            </div>

            {submitError && (
                <div className="error-message text-red-400 text-sm mt-1 mb-4">
                    {submitError}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
            >
                {isSubmitting ? t('form.buttons.submitting') : t('form.buttons.submit')}
            </button>
        </form>
    )
}

export default ContactForm
