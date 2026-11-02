"use client"
import Link from 'next/link';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    router.push(`portfolio/create-portfolio`)
  })
  return;
}

export default Home
