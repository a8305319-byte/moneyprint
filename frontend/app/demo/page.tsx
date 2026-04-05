'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function DemoPage() {
  const { enterDemo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    enterDemo();
    router.replace('/app');
  }, []);

  return null;
}
