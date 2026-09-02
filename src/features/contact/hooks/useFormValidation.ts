import { useState, FormEvent, ChangeEvent } from 'react'
import { useTranslations } from 'next-intl'

interface FormData {
    nombre: string
    email: string
    telefono: string
    mensaje: string
}

interface FormErrors {
    nombre?: string
    email?: string
    telefono?: string
    mensaje?: string
}

interface UseFormValidationReturn {
    formData: FormData
    errors: FormErrors
    submitError: string | null
    isSubmitting: boolean
    handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    handleSubmit: (e: FormEvent) => Promise<void>
    resetForm: () => void
}

interface UseFormValidationOptions {
    resetOnSuccess?: boolean
    initialData?: Partial<FormData>
}

// Validación detallada (Usando traducciones i18n para proveer los mensajes de error)
const validateField = (name: string, value: string, t: ReturnType<typeof useTranslations>): string => {
    const trimmedValue = value.trim()
    
    switch (name) {
        case 'nombre': {
            if (!trimmedValue) return t('validation.name.required')
            if (trimmedValue.length < 2 || trimmedValue.length > 50) return t('validation.name.length')
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmedValue)) return t('validation.name.format')
            return ''
        }
        case 'email': {
            if (!trimmedValue) return t('validation.email.required')
            if (trimmedValue.length > 254) return t('validation.email.format')
            // Regex de grado profesional: Valida caracteres especiales permitidos, estructura de puntos y asegura un TLD alfabético de 2+ caracteres
            const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            if (!emailRegex.test(trimmedValue)) return t('validation.email.format')
            return ''
        }
        case 'telefono': {
            if (trimmedValue) {
                const cleanPhone = trimmedValue.replace(/[\s-()]/g, '')
                if (!/^[0-9]{8,15}$/.test(cleanPhone)) return t('validation.phone.format')
            }
            return ''
        }
        case 'mensaje': {
            if (!trimmedValue) return t('validation.message.required')
            if (trimmedValue.length < 10 || trimmedValue.length > 500) return t('validation.message.length')
            return ''
        }
    }
    return ''
}

export const useFormValidation = (
    onSubmit?: (data: FormData) => Promise<void>,
    options: UseFormValidationOptions = {}
): UseFormValidationReturn => {
    const t = useTranslations('contact');
    const [formData, setFormData] = useState<FormData>({
        nombre: options.initialData?.nombre ?? '',
        email: options.initialData?.email ?? '',
        telefono: options.initialData?.telefono ?? '',
        mensaje: options.initialData?.mensaje ?? ''
    })
    
    const [errors, setErrors] = useState<FormErrors>({})
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const resetForm = () => {
        setFormData({
            nombre: '',
            email: '',
            telefono: '',
            mensaje: ''
        })
        setErrors({})
        setSubmitError(null)
        setIsSubmitting(false)
    }

    // Validar en tiempo real
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (submitError) {
            setSubmitError(null)
        }

        // Validar en tiempo real con la traducción
        const error = validateField(name, value, t)
        setErrors(prev => ({ ...prev, [name]: error }))
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        
        // Validar todos los campos con la traducción
        const newErrors: FormErrors = {}
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key as keyof FormData], t)
            if (error) {
                newErrors[key as keyof FormErrors] = error
            }
        })
        
        setErrors(newErrors)
        
        if (Object.keys(newErrors).length === 0) {
            setIsSubmitting(true)
            setSubmitError(null)

            try {
                if (onSubmit) {
                    await onSubmit(formData)
                }

                if (options.resetOnSuccess) {
                    resetForm()
                }
            } catch (err) {
                // El error del servidor se muestra a nivel de formulario; la
                // simulación por defecto no existe: el envío real lo provee el caller.
                setSubmitError(
                    err instanceof Error && err.message
                        ? err.message
                        : t('form.error.submit_failed')
                )
            } finally {
                setIsSubmitting(false)
            }
        } else {
            // Los mensajes de error inline ya indican qué corregir
            // Se podría hacer scroll al primer campo inválido para mejor UX
            // const firstInvalid = document.querySelector('.invalid-value')
            // if (firstInvalid) firstInvalid.focus()
        }
    }

    return {
        formData,
        errors,
        submitError,
        isSubmitting,
        handleInputChange,
        handleSubmit,
        resetForm
    }
}
