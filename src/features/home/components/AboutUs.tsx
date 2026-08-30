"use client";
import { useRef, useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import type { UseScrollOptions } from 'framer-motion'
import './AboutUs.css'

const AboutUs = () => {
    const t = useTranslations('home');
    const sectionRef = useRef<HTMLElement>(null)
    const [isMobile, setIsMobile] = useState(false)

    // Detectamos si es móvil para la paridad de opacidad (con debounce)
    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout
        const checkMobile = () => setIsMobile(window.innerWidth <= 767.98)
        
        const debouncedResize = () => {
            clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(checkMobile, 150)
        }
        
        checkMobile()
        window.addEventListener('resize', debouncedResize)
        return () => {
            window.removeEventListener('resize', debouncedResize)
            clearTimeout(resizeTimeout)
        }
    }, [])

    // Memoizar la configuración de offset para evitar recreación innecesaria
    const offsetConfig = useMemo(() => ({
        desktop: ["start 102%", "center 60%"] as NonNullable<UseScrollOptions['offset']>,
        mobile: ["start 90%", "start 35%"] as NonNullable<UseScrollOptions['offset']>
    }), [])
    
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: isMobile ? offsetConfig.mobile : offsetConfig.desktop
    })

    // Valores de Escala: Desktop (0 -> 1), Móvil (0.88 -> 1)
    const scaleRange = isMobile ? [0.88, 1] : [0, 1]
    const scale = useTransform(scrollYProgress, [0, 1], scaleRange)
    
    // Valores de Opacidad: Desktop (fija 1), Móvil (0.82 -> 1)
    const opacityRange = isMobile ? [0.82, 1] : [1, 1]
    const opacity = useTransform(scrollYProgress, [0, 0.4], opacityRange)
    
    // Spring physics diferenciada para cada plataforma
    const springConfig = isMobile 
        ? { stiffness: 100, damping: 30 } // Más firme en móvil
        : { stiffness: 150, damping: 25 } // Más rápido en desktop
        
    const finalScale = useSpring(scale, { ...springConfig, restDelta: 0.001 })
    const finalOpacity = useSpring(opacity, { ...springConfig, restDelta: 0.001 })

    return (
        <motion.section
            ref={sectionRef}
            style={{
                scale: finalScale,
                opacity: finalOpacity
            }}
            className="about-us-section w-[calc(100vw-40px)] max-w-full mx-auto mt-10 mb-6 md:mt-9 md:mb-10 bg-black text-white py-5 rounded-[20px] overflow-hidden"
        >
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10 lg:gap-16 px-5 py-4 md:px-8">
                <div className="w-[250px] md:w-[350px] lg:w-[450px] h-[250px] md:h-[350px] lg:h-[450px] flex items-center justify-center shrink-0">
                    <Image
                        src="/assets/images/logo/logo.png"
                        alt={t('about_us.logo_alt')}
                        width={400}
                        height={400}
                        className="w-[220px] md:w-[320px] lg:w-[400px] h-auto rounded-[15px] shrink-0"
                    />
                </div>
                <div className="max-w-[600px] text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-semibold mb-4">{t('about_us.title')}</h2>
                    <p className="text-base md:text-lg leading-relaxed">
                        {t('about_us.description')}
                    </p>
                </div>
            </div>
        </motion.section>
    )
}

export default AboutUs

