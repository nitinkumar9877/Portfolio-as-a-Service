"use client"
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
const Portfolio = () => {
    const router = useRouter();
    useEffect(() => {
        router.push(`portfolio/create-portfolio`)
    })
    return (
        <div>

        </div>
    )
}

export default Portfolio
